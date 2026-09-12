import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationCard from '../components/NavigationCard';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';
import { useDashboard } from '../hooks/useDashboard';
import QueryState from '../components/QueryState';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

export default function Inicio({ navigation }) {
  const { user: usuario, query, animals, upcoming } = useDashboard();

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo small />
        </View>
        <View style={styles.heroHome}>
          <View style={styles.textoHero}>
            <Text style={styles.tituloHome}>Olá, {usuario?.nome}!</Text>
            <Text style={styles.chamada}>Vamos cuidar do seu animal juntos hoje?</Text>
            <QueryState query={query}>
              <Text style={styles.pontosMini}>{animals.length} animal(is) • {upcoming.length} próximo(s) atendimento(s)</Text>
            </QueryState>
          </View>
          <View style={styles.mascote}>
            <Image source={require('../../assets/gato.png')} style={styles.gato} />
          </View>
        </View>

        <View style={estilos.grade}>
          <NavigationCard
            title="Perfil"
            description="Conta e rotina"
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
            description="Próximos atendimentos"
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
            description="Caderno de cuidados"
            icon="information-outline"
            highlight
            onPress={() => navigation.navigate('Informacoes')}
          />
          <NavigationCard
            title="Dobu-Cam"
            description="Registros das câmeras"
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
