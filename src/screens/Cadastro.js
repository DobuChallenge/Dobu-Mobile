import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import PhotoPicker from '../components/PhotoPicker';
import { obterUsuarioPorCpf, obterUsuarioPorEmail, salvarUsuario } from '../storage/armazenamento';
import { cores } from '../styles/tema';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function limparEmail(valor) {
  return valor.trim().toLowerCase();
}

function emailValido(valor) {
  return /\S+@\S+\.\S+/.test(valor);
}

export default function Cadastro({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [cpfUsuario, setCpfUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [foto, setFoto] = useState('');
  const [tipoConta, setTipoConta] = useState('responsavel');
  const [crmv, setCrmv] = useState('');
  const [ufCrmv, setUfCrmv] = useState('');
  const [ufAberta, setUfAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function cadastrar() {
    const nome = nomeUsuario.trim();
    const email = limparEmail(emailUsuario);
    const cpf = cpfUsuario.trim();
    const crmvTratado = crmv.trim();
    const ufCrmvTratada = ufCrmv.trim().toUpperCase();
    const camposVazios = [];

    if (!nome) camposVazios.push('nome');
    if (!email) camposVazios.push('email');
    if (!cpf) camposVazios.push('CPF');
    if (!senha) camposVazios.push('senha');
    if (tipoConta === 'veterinario' && !crmvTratado) camposVazios.push('CRMV');
    if (tipoConta === 'veterinario' && !ufCrmvTratada) camposVazios.push('UF do CRMV');

    if (camposVazios.length > 0) {
      Alert.alert('Cadastro incompleto', `Falta preencher: ${camposVazios.join(', ')}.`);
      return;
    }

    if (!emailValido(email)) {
      Alert.alert('Email inválido', 'Digite um email válido.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Senha fraca', 'Use pelo menos 6 caracteres.');
      return;
    }

    try {
      setSalvando(true);
      const usuarioExistente = await obterUsuarioPorEmail(email);
      const cpfExistente = await obterUsuarioPorCpf(cpf);

      if (usuarioExistente) {
        Alert.alert('Email já cadastrado', 'Use outro email ou faça login com esta conta.');
        return;
      }

      if (cpfExistente) {
        Alert.alert('CPF já cadastrado', 'Use outro CPF para criar uma nova conta.');
        return;
      }

      await salvarUsuario({
        id: Date.now().toString(),
        nome,
        email,
        cpf,
        senha,
        foto,
        tipoConta,
        crmv: tipoConta === 'veterinario' ? crmvTratado : '',
        ufCrmv: tipoConta === 'veterinario' ? ufCrmvTratada : '',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        { text: 'Entrar', onPress: () => navigation.replace(tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio') },
      ]);
    } catch (error) {
      console.log('ERRO CADASTRO:', error);
      if (error.code === 'EMAIL_DUPLICADO') {
        Alert.alert('Email já cadastrado', 'Use outro email ou faça login com esta conta.');
        return;
      }
      if (error.code === 'CPF_DUPLICADO') {
        Alert.alert('CPF já cadastrado', 'Use outro CPF para criar uma nova conta.');
        return;
      }
      Alert.alert('Erro', 'Não foi possível salvar o cadastro.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <DobuLogo large style={styles.logo} />
        <Header navigation={navigation} title="Cadastro" subtitle="Crie o seu perfil dobu" />

        <Card style={styles.cardCadastro}>
          <PhotoPicker photo={foto} onChangePhoto={setFoto} title="Foto de perfil" />

          <Text style={styles.label}>Tipo de conta:</Text>
          <View style={styles.tipoLinha}>
            <TipoContaOpcao
              ativo={tipoConta === 'responsavel'}
              label="Responsável"
              onPress={() => setTipoConta('responsavel')}
            />
            <TipoContaOpcao
              ativo={tipoConta === 'veterinario'}
              label="Veterinário"
              onPress={() => setTipoConta('veterinario')}
            />
          </View>

          <Campo label="Nome:" value={nomeUsuario} onChangeText={setNomeUsuario} placeholder="Digite seu nome..." />
          <Campo
            label="Email:"
            value={emailUsuario}
            onChangeText={setEmailUsuario}
            placeholder="Digite seu email..."
            keyboardType="email-address"
          />
          <Campo label="CPF:" value={cpfUsuario} onChangeText={setCpfUsuario} placeholder="Digite seu cpf" />
          {tipoConta === 'veterinario' ? (
            <>
              <Campo label="CRMV:" value={crmv} onChangeText={setCrmv} placeholder="Digite seu CRMV" keyboardType="numeric" />
              <SelectDropdown
                label="UF do CRMV:"
                options={UFS.map((uf) => ({ label: uf, value: uf }))}
                value={ufCrmv}
                placeholder="Selecione o estado"
                aberto={ufAberta}
                onToggle={() => setUfAberta((valor) => !valor)}
                onChange={(valor) => {
                  setUfCrmv(valor);
                  setUfAberta(false);
                }}
              />
            </>
          ) : null}
          <Campo label="Senha:" value={senha} onChangeText={setSenha} placeholder="Digite uma senha..." secureTextEntry />

          <Button
            title={salvando ? 'Salvando...' : 'Cadastre-se'}
            onPress={salvando ? undefined : cadastrar}
            cor="cinzaEscuro"
            style={styles.botao}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function TipoContaOpcao({ ativo, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tipoOpcao, ativo && styles.tipoOpcaoAtiva]}>
      <Text style={[styles.tipoTexto, ativo && styles.tipoTextoAtivo]}>{label}</Text>
    </Pressable>
  );
}

function SelectDropdown({ label, options, value, placeholder, aberto, onToggle, onChange }) {
  const selecionado = options.find((option) => option.value === value);

  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={onToggle} style={styles.selectCampo}>
        <Text style={[styles.selectValor, !selecionado && styles.selectPlaceholder]}>
          {selecionado?.label || placeholder}
        </Text>
        <Text style={styles.selectSeta}>{aberto ? '▲' : '▼'}</Text>
      </Pressable>
      {aberto ? (
        <View style={styles.selectLista}>
          {options.map((option) => {
            const ativo = value === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                style={[styles.selectOpcao, ativo && styles.selectOpcaoAtiva]}
              >
                <Text style={[styles.selectOpcaoTexto, ativo && styles.selectOpcaoTextoAtivo]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function Campo({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9B9B9B"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    paddingHorizontal: 13,
    paddingTop: 22,
    paddingBottom: 38,
    flexGrow: 1,
  },
  logo: {
    alignSelf: 'center',
    width: 230,
    height: 94,
    marginTop: 4,
    marginBottom: 10,
  },
  cardCadastro: {
    backgroundColor: '#FBBA5B',
    borderRadius: 40,
    paddingHorizontal: 36,
    paddingTop: 18,
    paddingBottom: 38,
  },
  campo: {
    marginBottom: 9,
  },
  tipoLinha: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  tipoOpcao: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinzaEscuro,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipoOpcaoAtiva: {
    backgroundColor: cores.cinzaEscuro,
  },
  tipoTexto: {
    color: cores.texto,
    fontWeight: '900',
  },
  tipoTextoAtivo: {
    color: cores.branco,
  },
  label: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    minHeight: 45,
    borderRadius: 7,
    backgroundColor: '#EFEFEF',
    color: cores.texto,
    paddingHorizontal: 13,
    fontSize: 16,
  },
  selectCampo: {
    minHeight: 45,
    borderRadius: 7,
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: cores.cinza,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValor: {
    flex: 1,
    color: cores.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  selectPlaceholder: {
    color: '#9B9B9B',
    fontWeight: '500',
  },
  selectSeta: {
    color: cores.marrom,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 8,
  },
  selectLista: {
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza,
    overflow: 'hidden',
  },
  selectOpcao: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.cinza,
  },
  selectOpcaoAtiva: {
    backgroundColor: cores.cinzaEscuro,
  },
  selectOpcaoTexto: {
    color: cores.texto,
    fontWeight: '800',
  },
  selectOpcaoTextoAtivo: {
    color: cores.branco,
  },
  botao: {
    minHeight: 48,
    marginHorizontal: 31,
    marginTop: 17,
  },
});
