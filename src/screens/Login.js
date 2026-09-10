import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';

import { useLogin } from '../hooks/useAuth';
import { validateLogin } from '../utils/authValidation';
import { ApiError } from '../api/httpClient';
import { estilos } from '../styles/globalStyles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const login = useLogin();
  const entrando = login.isPending;

  async function entrar() {
    const emailTratado = email.trim().toLowerCase();
    if (entrando) return;
    const erroValidacao = validateLogin(emailTratado, senha);
    if (erroValidacao) {
      Alert.alert('Confira os dados', erroValidacao);
      return;
    }

    try {
      const usuario = await login.mutateAsync({ email: emailTratado, senha });
      setSenha('');
      Alert.alert('Bem-vindo!', 'Login realizado com sucesso.');
      navigation.reset({ index: 0, routes: [{ name: usuario.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio' }] });
    } catch (error) {
      Alert.alert('Erro ao entrar', error instanceof ApiError ? error.message : 'Não foi possível fazer login.');
    } finally {
      login.reset();
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
            disabled={entrando}
            style={{ marginHorizontal: 34 }}
            cor="cinzaEscuro"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
