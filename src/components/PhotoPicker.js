import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../styles/tema';

export default function PhotoPicker({ photo, onChangePhoto, title = 'Adicionar foto', type = 'perfil', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function choose(origin) {
    const permitted = origin === 'camera' ? await requestCamera() : await requestGallery();
    if (!permitted) return;

    try {
      setLoading(true);
      const options = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      };
      const result = origin === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        onChangePhoto(uri);
        setOpen(false);
      }
    } catch (error) {
      Alert.alert('Foto indisponível', 'Não foi possível abrir a câmera ou a galeria neste dispositivo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable disabled={disabled} onPress={() => setOpen(true)} style={[styles.photo, disabled && styles.disabled]}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} />
        ) : (
          <Ionicons name={type === 'pet' ? 'paw' : 'person'} size={46} color={cores.branco} />
        )}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={18} color={cores.branco} />
        </View>
      </Pressable>
      <Text style={styles.title}>{title}</Text>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{title}</Text>
            <PickerButton title={loading ? 'Abrindo...' : 'Tirar foto'} icon="camera" onPress={loading ? undefined : () => choose('camera')} />
            <PickerButton title={loading ? 'Abrindo...' : 'Escolher da galeria'} icon="images" onPress={loading ? undefined : () => choose('gallery')} />
            {photo ? <PickerButton title="Remover foto" icon="trash" danger onPress={() => { onChangePhoto(''); setOpen(false); }} /> : null}
            <PickerButton title="Cancelar" icon="close" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

async function requestCamera() {
  const current = await ImagePicker.getCameraPermissionsAsync();
  const permission = current.granted ? current : await ImagePicker.requestCameraPermissionsAsync();
  if (permission.granted) return true;
  Alert.alert('Permissão da câmera', 'Autorize a câmera para adicionar uma foto.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
  ]);
  return false;
}

async function requestGallery() {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  const permission = current.granted ? current : await ImagePicker.requestMediaLibraryPermissionsAsync(false);
  if (permission.granted) return true;
  Alert.alert('Permissão da galeria', 'Autorize a galeria para escolher uma foto.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
  ]);
  return false;
}

function PickerButton({ title, icon, onPress, danger }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[styles.modalButton, danger && styles.dangerButton, !onPress && styles.disabled]}>
      <Ionicons name={icon} size={20} color={danger ? cores.vermelho : cores.branco} />
      <Text style={[styles.modalButtonText, danger && styles.dangerText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 20 },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#B8B8B8',
    borderWidth: 6,
    borderColor: cores.branco,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%', borderRadius: 60 },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: cores.principal,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: cores.branco,
  },
  title: { marginTop: 10, fontWeight: '700', fontSize: 18, color: cores.marrom },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: cores.branco, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 10 },
  modalTitle: { fontWeight: '800', textAlign: 'center', marginBottom: 10, color: cores.texto },
  modalButton: { flexDirection: 'row', gap: 10, padding: 14, backgroundColor: cores.buttonGray, borderRadius: 10, alignItems: 'center' },
  modalButtonText: { color: cores.branco, fontWeight: '700' },
  dangerButton: { backgroundColor: '#FFDDDD' },
  dangerText: { color: cores.vermelho },
  disabled: { opacity: 0.6 },
});
