import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';

import { definirUsuarioAtual, obterUsuarioPorEmail } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    const emailTratado = email.trim().toLowerCase();

    if (!emailTratado || !senha) {
      Alert.alert('Login incompleto', 'Informe email e senha.');
      return;
    }

    try {
      setEntrando(true);
      const usuarioSalvo = await obterUsuarioPorEmail(emailTratado);

      if (!usuarioSalvo) {
        Alert.alert('Sem cadastro', 'Não encontramos uma conta com este email.');
        return;
      }

      if (emailTratado === usuarioSalvo.email && senha === usuarioSalvo.senha) {
        await definirUsuarioAtual(usuarioSalvo);
        Alert.alert('Bem-vindo!', 'Login realizado com sucesso.');
        navigation.replace(usuarioSalvo.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio');
        return;
      }

      Alert.alert('Dados incorretos', 'Email ou senha não conferem com o cadastro salvo.');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível fazer login.');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <DobuLogo
          large
          style={{
            alignSelf: 'center',
            marginTop: 60,
            marginBottom: 18,
          }}
        />

        <Header navigation={navigation} title="Login" subtitle="Acesse sua jornada de cuidado" />

        <Card
          style={{
            backgroundColor: '#FBBA5B',
            borderRadius: 18,
            paddingVertical: 22,
          }}
        >
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu email"
            keyboardType="email-address"
          />

          <TextInput
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            secureTextEntry
          />

          <Button
            title={entrando ? 'Entrando...' : 'Login'}
            onPress={entrando ? undefined : entrar}
            style={{ marginHorizontal: 34 }}
            cor="cinzaEscuro"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
