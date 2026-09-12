import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import PhotoPicker from '../components/PhotoPicker';
import { useRegister } from '../hooks/useAuth';
import { validateRegister } from '../utils/authValidation';
import { ApiError } from '../api/httpClient';
import { cores } from '../styles/tema';

export default function Cadastro({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoConta, setTipoConta] = useState('responsavel');
  const [foto, setFoto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [crmv, setCrmv] = useState('');
  const [ufCrmv, setUfCrmv] = useState('');
  const [clinica, setClinica] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const cadastro = useRegister();
  const salvando = cadastro.isPending;

  async function cadastrar() {
    if (salvando) return;
    const dados = { nome: nomeUsuario.trim(), email: emailUsuario.trim().toLowerCase(), senha, tipoUsuario: tipoConta.toUpperCase() };
    const erroValidacao = validateRegister(dados);
    if (erroValidacao) {
      Alert.alert('Confira os dados', erroValidacao);
      return;
    }
    try {
      const profileExtras = {
        foto,
        telefone: telefone.trim(),
        crmv: crmv.trim(),
        ufCrmv: ufCrmv.trim().toUpperCase(),
        clinica: clinica.trim(),
        especialidade: especialidade.trim(),
      };
      await cadastro.mutateAsync({
        ...dados,
        profileExtras,
      });
    } catch (error) {
      cadastro.reset();
      Alert.alert('Erro no cadastro', error instanceof ApiError ? error.message : 'Não foi possível realizar o cadastro.');
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <DobuLogo large style={styles.logo} />
        <Header navigation={navigation} title="Cadastro" subtitle="Crie o seu perfil dobu" />

        <Card style={styles.cardCadastro}>
          <PhotoPicker
            photo={foto}
            onChangePhoto={setFoto}
            title="Foto de perfil"
            disabled={salvando}
          />

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
          <Campo label="Telefone:" value={telefone} onChangeText={setTelefone} placeholder="Digite seu telefone..." keyboardType="phone-pad" />
          <Campo
            label="Email:"
            value={emailUsuario}
            onChangeText={setEmailUsuario}
            placeholder="Digite seu email..."
            keyboardType="email-address"
          />
          <Campo label="Senha:" value={senha} onChangeText={setSenha} placeholder="Digite uma senha..." secureTextEntry />

          {tipoConta === 'veterinario' ? (
            <View style={styles.blocoVeterinario}>
              <Text style={styles.subtitulo}>Dados profissionais</Text>
              <Campo label="CRMV:" value={crmv} onChangeText={setCrmv} placeholder="Ex: 12345" />
              <Campo label="UF do CRMV:" value={ufCrmv} onChangeText={(value) => setUfCrmv(value.toUpperCase())} placeholder="Ex: SP" />
              <Campo label="Clínica:" value={clinica} onChangeText={setClinica} placeholder="Nome da clínica ou hospital" />
              <Campo label="Especialidade:" value={especialidade} onChangeText={setEspecialidade} placeholder="Ex: clínica geral, dermatologia..." />
            </View>
          ) : null}

          <Button
            title={salvando ? 'Salvando...' : 'Cadastre-se'}
            onPress={salvando ? undefined : cadastrar}
            disabled={salvando}
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
        autoCapitalize={keyboardType === 'email-address' || secureTextEntry ? 'none' : 'sentences'}
        autoCorrect={!secureTextEntry && keyboardType !== 'email-address'}
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
  blocoVeterinario: {
    marginTop: 2,
  },
  subtitulo: {
    color: cores.marrom,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 7,
    marginBottom: 8,
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
