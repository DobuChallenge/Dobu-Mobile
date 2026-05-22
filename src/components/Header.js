import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../styles/tema';

export default function Header({ title, subtitle, navigation, showBack = true }) {
  const mostrarVoltar = showBack && !title?.startsWith('Veterin') && navigation?.canGoBack();

  return (
    <View style={styles.container}>
      {mostrarVoltar ? (
        <Pressable onPress={() => navigation.goBack()} style={styles.voltar}>
          <Ionicons name="close" size={22} color={cores.branco} />
        </Pressable>
      ) : null}
      <View style={styles.textos}>
          <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  voltar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: cores.principal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textos: {
    flex: 1,
  },
  title: {
    color: cores.marrom,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: cores.textoClaro,
    fontSize: 17,
    marginTop: 5,
  },
});
