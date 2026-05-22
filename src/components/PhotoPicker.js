import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../styles/tema';

export default function PhotoPicker({
  photo,
  onChangePhoto,
  title = 'Adicionar foto',
  type = 'perfil',
}) {
  const [open, setOpen] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function abrirCamera() {
    const permitido = await pedirPermissaoCamera();
    if (!permitido) return;

    await escolherFoto('camera');
  }

  async function abrirGaleria() {
    const permitido = await pedirPermissaoGaleria();
    if (!permitido) return;

    await escolherFoto('galeria');
  }

  async function escolherFoto(origem) {
    try {
      setCarregando(true);

      const opcoes = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      };

      const resultado =
        origem === 'camera'
          ? await ImagePicker.launchCameraAsync(opcoes)
          : await ImagePicker.launchImageLibraryAsync(opcoes);

      if (resultado.canceled) return;

      const uri = resultado.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert('Foto não encontrada', 'Tente escolher outra imagem.');
        return;
      }

      const fotoFinal = await tentarSalvarCopia(uri);
      onChangePhoto(fotoFinal);
      setOpen(false);
    } catch (error) {
      console.log('ERRO PHOTO PICKER:', error);
      Alert.alert(
        origem === 'camera' ? 'Câmera indisponível' : 'Galeria indisponível',
        origem === 'camera'
          ? 'Se estiver usando emulador, use a galeria ou teste em um celular físico com câmera.'
          : 'Não foi possível abrir a galeria. Confira as permissões do app.'
      );
    } finally {
      setCarregando(false);
    }
  }

  function remove() {
    onChangePhoto('');
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setOpen(true)} style={styles.foto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.img} />
        ) : (
          <Ionicons name={type === 'pet' ? 'paw' : 'person'} size={46} color={cores.branco} />
        )}

        <View style={styles.plus}>
          <Ionicons name="camera" size={18} color="white" />
        </View>
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.bg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Btn text={carregando ? 'Abrindo...' : 'Tirar foto'} icon="camera" onPress={carregando ? undefined : abrirCamera} />
            <Btn text={carregando ? 'Abrindo...' : 'Galeria'} icon="images" onPress={carregando ? undefined : abrirGaleria} />
            {photo ? <Btn text="Remover" icon="trash" danger onPress={remove} /> : null}
            <Btn text="Cancelar" icon="close" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

async function pedirPermissaoCamera() {
  const atual = await ImagePicker.getCameraPermissionsAsync();
  const permissao = atual.granted ? atual : await ImagePicker.requestCameraPermissionsAsync();

  if (!permissao.granted) {
    Alert.alert(
      'Permissão da câmera',
      'O Dobu precisa da câmera para cadastrar fotos do usuário e dos pets.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return true;
}

async function pedirPermissaoGaleria() {
  const atual = await ImagePicker.getMediaLibraryPermissionsAsync();
  const permissao = atual.granted ? atual : await ImagePicker.requestMediaLibraryPermissionsAsync(false);

  if (!permissao.granted) {
    Alert.alert(
      'Permissão da galeria',
      'O Dobu precisa acessar suas fotos para escolher imagens do usuário e dos pets.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return true;
}

async function tentarSalvarCopia(uri) {
  try {
    if (!uri.startsWith('file://')) {
      return uri;
    }

    const extensao = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const destino = `${FileSystem.documentDirectory}dobu-${Date.now()}.${extensao}`;

    await FileSystem.copyAsync({ from: uri, to: destino });
    return destino;
  } catch (error) {
    console.log('ERRO AO COPIAR FOTO:', error);
    return uri;
  }
}

function Btn({ text, icon, onPress, danger }) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, danger && styles.btnDanger, !onPress && styles.btnDisabled]}>
      <Ionicons name={icon} size={20} color={danger ? cores.vermelho : 'white'} />
      <Text style={[styles.btnText, danger && styles.btnTextDanger]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 20 },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#B8B8B8',
    borderWidth: 6,
    borderColor: cores.branco,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  plus: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: cores.principal,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: cores.branco,
  },
  title: {
    marginTop: 10,
    fontWeight: '500',
    fontSize: 18,
    color: cores.marrom,
  },
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
  },
  modalTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  btn: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnDanger: {
    backgroundColor: '#FFDDDD',
  },
  btnText: {
    color: 'white',
    fontWeight: '700',
  },
  btnTextDanger: {
    color: cores.vermelho,
  },
});
