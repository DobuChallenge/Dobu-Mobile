import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput as NativeTextInput, View } from 'react-native';
import { cores } from '../styles/tema';

export default function TextInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const senhaEscondida = secureTextEntry && !mostrarSenha;

  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.areaInput}>
        <NativeTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={cores.textoClaro}
          secureTextEntry={senhaEscondida}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[styles.input, multiline && styles.multiline, secureTextEntry && styles.inputSenha]}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.olho}>
            <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={22} color={cores.textoClaro} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    marginBottom: 18,
  },
  label: {
    color: cores.texto,
    fontWeight: '800',
    marginBottom: 7,
    fontSize: 15,
  },
  areaInput: {
    position: 'relative',
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: cores.branco,
    borderWidth: 0,
    color: cores.texto,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputSenha: {
    paddingRight: 48,
  },
  olho: {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiline: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
