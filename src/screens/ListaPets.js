import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';
import { excluirPet, obterAgendamentos, obterPets, obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

export default function ListaPets({ navigation }) {
  const [pets, setPets] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const [petsSalvos, usuarioSalvo, agendamentosSalvos] = await Promise.all([
          obterPets(),
          obterUsuario(),
          obterAgendamentos(),
        ]);
        const nomeVeterinario = (usuarioSalvo?.nome || '').trim().toLowerCase();
        const animaisAtendidos = new Set(
          agendamentosSalvos
            .filter((item) => (item.veterinario || '').trim().toLowerCase() === nomeVeterinario)
            .map((item) => (item.pet || '').trim().toLowerCase())
        );
        const petsFiltrados =
          usuarioSalvo?.tipoConta === 'veterinario'
            ? petsSalvos.filter((pet) => animaisAtendidos.has((pet.nome || '').trim().toLowerCase()))
            : petsSalvos.filter((pet) => pet.responsavelId === usuarioSalvo?.id);

        setPets(petsFiltrados);
        setUsuario(usuarioSalvo);
      }

      carregar();
    }, [])
  );

  function confirmarExcluirPet(pet) {
    Alert.alert(
      'Apagar animal',
      `Deseja apagar ${pet.nome}? Os agendamentos ligados a ele também serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await excluirPet(pet.id);
            const petsAtualizados = pets.filter((item) => item.id !== pet.id);
            setPets(petsAtualizados);
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
        <Header
          navigation={navigation}
          title={usuario?.tipoConta === 'veterinario' ? 'Pacientes' : 'Meus Animais'}
          subtitle={usuario?.tipoConta === 'veterinario' ? 'Animais atendidos' : 'Perfis cadastrados'}
        />

        {usuario?.tipoConta === 'veterinario' ? null : (
          <Button
            title="Adicionar animal"
            icon="add-circle-outline"
            onPress={() => navigation.navigate('CadastroPet')}
            style={styles.botao}
          />
        )}

        {pets.length === 0 ? (
          <Card style={styles.vazio}>
            <Ionicons name="paw-outline" size={40} color={cores.principalEscuro} />
            <Text style={styles.vazioTitulo}>
              {usuario?.tipoConta === 'veterinario' ? 'Nenhum paciente vinculado' : 'Nenhum animal cadastrado'}
            </Text>
            <Text style={styles.vazioTexto}>
              {usuario?.tipoConta === 'veterinario'
                ? 'Animais aparecem aqui quando houver agendamento com este veterinário.'
                : 'Cadastre o primeiro animal para iniciar a jornada de cuidado.'}
            </Text>
          </Card>
        ) : (
          pets.map((pet) => (
            <Pressable
              key={pet.id}
              onPress={() => navigation.navigate('PerfilPet', { pet })}
              style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
            >
              <View style={styles.avatar}>
                {pet.foto ? (
                  <Image source={{ uri: pet.foto }} style={styles.fotoPet} />
                ) : (
                  <Ionicons name="paw" size={28} color={cores.principalEscuro} />
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.nome}>{pet.nome}</Text>
                <Text style={styles.descricao}>{pet.especie} • {pet.raca}</Text>
              </View>
              {usuario?.tipoConta === 'veterinario' ? (
                <Ionicons name="chevron-forward" size={22} color={cores.textoClaro} />
              ) : (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.();
                    confirmarExcluirPet(pet);
                  }}
                  hitSlop={10}
                  style={styles.botaoExcluir}
                >
                  <Ionicons name="trash-outline" size={22} color={cores.vermelho} />
                </Pressable>
              )}
            </Pressable>
          ))
        )}
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
  botao: {
    marginBottom: 16,
  },
  item: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressionado: {
    opacity: 0.82,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cores.fundoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  fotoPet: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  botaoExcluir: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.branco,
  },
  nome: {
    color: cores.marrom,
    fontSize: 22,
    fontWeight: '900',
  },
  descricao: {
    color: cores.textoClaro,
    marginTop: 3,
    fontSize: 17,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  vazioTitulo: {
    color: cores.marrom,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  vazioTexto: {
    color: cores.textoClaro,
    textAlign: 'center',
    marginTop: 6,
    fontSize: 17,
  },
});
