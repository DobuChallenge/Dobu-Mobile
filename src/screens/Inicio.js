import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationCard from '../components/NavigationCard';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';
import { obterPets, obterPontos, obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

export default function Inicio({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [totalPets, setTotalPets] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const [usuarioSalvo, pontosSalvos, petsSalvos] = await Promise.all([
          obterUsuario(),
          obterPontos(),
          obterPets(),
        ]);
        setUsuario(usuarioSalvo);
        setPontos(pontosSalvos);
        setTotalPets(petsSalvos.filter((pet) => pet.responsavelId === usuarioSalvo?.id).length);
      }

      carregar();
    }, [])
  );

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo small />
        </View>
        <View style={styles.heroHome}>
          <View style={styles.textoHero}>
            <Text style={styles.tituloHome}>Olá, {usuario?.nome || '{Nome}'}!</Text>
            <Text style={styles.chamada}>Vamos cuidar do seu animal juntos hoje?</Text>
            <Text style={styles.pontosMini}>{pontos} pontos • {totalPets} animal(is)</Text>
          </View>
          <View style={styles.mascote}>
            <Image source={require('../../assets/gato.png')} style={styles.gato} />
          </View>
        </View>

        <View style={estilos.grade}>
          <NavigationCard
            title="Perfil"
            description="Conta e pontos"
            icon="person-outline"
            highlight
            onPress={() => navigation.navigate('PerfilUsuario')}
          />
          <NavigationCard
            title="Animal"
            description="Perfil e cadastro"
            icon="paw-outline"
            highlight
            onPress={() => navigation.navigate('ListaPets')}
          />
          <NavigationCard
            title="Agendamento"
            description="Consultas e vacinas"
            icon="calendar-outline"
            onPress={() => navigation.navigate('Agendamentos')}
          />
          <NavigationCard
            title="Lembretes"
            description="Cuidados do dia"
            icon="notifications-outline"
            onPress={() => navigation.navigate('Lembretes')}
          />
          <NavigationCard
            title="Informações"
            description="Saúde e notícias"
            icon="information-outline"
            highlight
            onPress={() => navigation.navigate('Informacoes')}
          />
          <NavigationCard
            title="Dobu-Cam"
            description="Câmera Dobu"
            icon="videocam-outline"
            highlight
            onPress={() => navigation.navigate('DobuCam')}
          />
        </View>
      </ScrollView>
      <BottomNavigation navigation={navigation} active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroHome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 150,
    marginBottom: 24,
  },
  textoHero: { flex: 1 },
  tituloHome: {
    color: cores.marrom,
    fontSize: 32,
    fontWeight: '500',
  },
  chamada: {
    color: cores.principalEscuro,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 10,
    maxWidth: 220,
  },
  pontosMini: {
    color: cores.textoClaro,
    fontSize: 16,
    marginTop: 8,
  },
  mascote: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gato: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
