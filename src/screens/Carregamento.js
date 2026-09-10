import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import DobuLogo from '../components/DobuLogo';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { cores } from '../styles/tema';

export default function Carregamento() {
  const { restoreError, restore } = useAuth();

  return (
    <SafeAreaView style={styles.tela}>

      <View style={styles.logoArea}>

        <DobuLogo large />

        <Text style={styles.subtitulo}>
          Cuidado contínuo para animais mais saudáveis
        </Text>
      </View>

      {restoreError ? (
        <View>
          <Text>{restoreError}</Text>
          <Button title="Tentar novamente" onPress={restore} />
        </View>
      ) : <ActivityIndicator
        size="small"
        color={cores.areia}
        style={styles.loading}
      />}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  logoArea: {
    alignItems: 'center',
  },

  icone: {
    marginBottom: 18,
  },

  subtitulo: {
    color: cores.textoClaro,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.8,
  },

  loading: {
    marginTop: 40,
  },
});
