import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../styles/tema';

export default function Button({ title, icon, cor = 'amarelo', onPress, style, disabled = false }) {
  const branco = cor === 'branco';
  const cinzaEscuro = cor === 'cinzaEscuro';
  const vermelho = cor === 'vermelho';

  return (
    <Pressable
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        branco && styles.branco,
        cinzaEscuro && styles.cinzaEscuro,
        vermelho && styles.vermelho,
        pressed && styles.pressionado,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={22}
          color={branco ? cores.marrom : vermelho ? cores.vermelho : cores.branco}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.text, branco && styles.textoBranco, vermelho && styles.textoVermelho]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: cores.principal,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  branco: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza,
  },
  cinzaEscuro: {
    backgroundColor: cores.buttonGray,
  },
  vermelho: {
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.vermelho,
  },
  pressionado: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  text: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: '800',
  },
  textoBranco: {
    color: cores.marrom,
  },
  textoVermelho: {
    color: cores.vermelho,
  },
  icon: {
    marginRight: 8,
  },
});
