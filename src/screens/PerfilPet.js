import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '../components/BottomNavigation';
import Button from '../components/Button';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import { excluirPet, obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

export default function PerfilPet({ navigation, route }) {
  const pet = route.params?.pet;
  const [usuario, setUsuario] = useState(null);

  useFocusEffect(
    useCallback(() => {
      obterUsuario().then(setUsuario);
    }, [])
  );

  const podeExcluir = usuario?.tipoConta !== 'veterinario' && Boolean(pet?.id);

  function confirmarExcluir() {
    Alert.alert(
      'Apagar animal',
      `Deseja apagar ${pet?.nome || 'este animal'}? Os agendamentos ligados a ele também serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await excluirPet(pet?.id);
            navigation.replace('ListaPets', { atualizadoEm: Date.now() });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>
        <Header navigation={navigation} title={pet?.nome || 'Perfil do Animal'} subtitle="Dados do animal" />

        <Card style={styles.highlight}>
          <View style={styles.avatar}>
            {pet?.foto ? (
              <Image source={{ uri: pet.foto }} style={styles.fotoPet} />
            ) : (
              <Ionicons name="paw" size={58} color={cores.principalEscuro} />
            )}
          </View>
          <Text style={styles.nome}>{pet?.nome || 'Animal'}</Text>
          <Text style={styles.descricao}>{pet?.especie || 'Espécie'} - {pet?.raca || 'Raça'}</Text>
          <Text style={styles.nascimento}>Nascimento: {pet?.nascimento || 'Não informado'}</Text>
        </Card>

        <Card style={styles.visao}>
          <Text style={styles.secao}>Dados médicos</Text>
          <View style={styles.linha}>
            <Ionicons name="scale-outline" size={21} color={cores.principalEscuro} />
            <Text style={styles.linhaTexto}>Peso: {pet?.peso || 'Não informado'}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name="warning-outline" size={21} color={cores.principalEscuro} />
            <Text style={styles.linhaTexto}>Alergias: {pet?.alergias || 'Nenhuma informada'}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name="medkit-outline" size={21} color={cores.principalEscuro} />
            <Text style={styles.linhaTexto}>Medicamentos: {pet?.medicamentos || 'Nenhum informado'}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name="document-text-outline" size={21} color={cores.principalEscuro} />
            <Text style={styles.linhaTexto}>Observacoes: {pet?.observacoes || 'Sem observacoes'}</Text>
          </View>
        </Card>

        {podeExcluir ? (
          <Button
            title="Apagar animal"
            icon="trash-outline"
            cor="vermelho"
            onPress={confirmarExcluir}
            style={styles.botaoExcluir}
          />
        ) : null}
      </ScrollView>
      <BottomNavigation
        navigation={navigation}
        active="home"
        homeRoute={usuario?.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  highlight: {
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: cores.fundoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: cores.principal,
  },
  fotoPet: {
    width: '100%',
    height: '100%',
  },
  nome: {
    color: cores.marrom,
    fontSize: 32,
    fontWeight: '900',
  },
  descricao: {
    color: cores.textoClaro,
    fontSize: 19,
    marginTop: 4,
  },
  nascimento: {
    color: cores.texto,
    fontWeight: '700',
    marginTop: 10,
  },
  visao: {
    marginTop: 16,
  },
  secao: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: cores.cinza,
  },
  linhaTexto: {
    flex: 1,
    color: cores.texto,
    fontSize: 17,
    marginLeft: 10,
    lineHeight: 21,
  },
  botaoExcluir: {
    marginTop: 16,
    marginBottom: 12,
  },
});
