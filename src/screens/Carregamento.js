import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import DobuLogo from '../components/DobuLogo';
import { obterUsuario } from '../storage/armazenamento';
import { cores } from '../styles/tema';

export default function Carregamento({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      async function abrirFluxoInicial() {
        try {
          const usuarioSalvo = await obterUsuario();

          if (usuarioSalvo?.tipoConta === 'veterinario') {
            navigation.replace('PerfilVeterinario');
            return;
          }

          if (usuarioSalvo) {
            navigation.replace('Inicio');
            return;
          }
        } catch (error) {
          console.log('ERRO AO CARREGAR USUARIO:', error);
        }

        navigation.replace('Inicial');
      }

      abrirFluxoInicial();
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.tela}>

      <View style={styles.logoArea}>

        <DobuLogo large />

        <Text style={styles.subtitulo}>
          Cuidado contínuo para animais mais saudáveis
        </Text>
      </View>

      <ActivityIndicator
        size="small"
        color={cores.areia}
        style={styles.loading}
      />

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
