import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import DobuLogo from '../components/DobuLogo';
import { cores } from '../styles/tema';

export default function Inicial({ navigation }) {
  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.topo}>
        <Text style={styles.boasVindas}>Bem-vindo ao</Text>
        <DobuLogo large />
      </View>

      <View style={styles.painelLaranja}>
        <Text style={styles.subtitulo}>
          Gerencie a saúde do seu pet em um só lugar, com o Dobu.
        </Text>
        <View style={styles.acoes}>
          <Button
            title="Login"
            cor="cinzaEscuro"
            onPress={() => navigation.navigate('Login')}
            style={styles.botaoInicial}
          />
          <Button
            title="Cadastro"
            cor="branco"
            onPress={() => navigation.navigate('Cadastro')}
            style={[styles.espaco, styles.botaoInicial]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  topo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150,
  },
  boasVindas: {
    color: cores.marrom,
    fontSize: 25,
    marginBottom: 10,
    fontWeight: '600',
  },
  subtitulo: {
    color: cores.branco,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    maxWidth: 280,
    fontWeight: '700',
  },
  painelLaranja: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.principal,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    minHeight: 360,
    paddingHorizontal: 34,
    paddingTop: 48,
    paddingBottom: 42,
    justifyContent: 'flex-start',
  },
  acoes: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  espaco: {
    marginTop: 12,
  },
  botaoInicial: {
    width: '100%',
    minHeight: 58,
    borderRadius: 29,
  },
});
