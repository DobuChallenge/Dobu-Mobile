import { Text, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import QueryState from '../components/QueryState';
import AppointmentCard from '../components/AppointmentCard';
import { useDashboard } from '../hooks/useDashboard';
import { ui } from '../styles/ui';

export default function PerfilVeterinario({ navigation }) {
  const dashboard = useDashboard();
  return <Screen navigation={navigation} title={`Olá, ${dashboard.user.nome}`} subtitle="Seu painel de atendimentos" active="home">
    <View style={ui.actions}>
      <Button title="Gerenciar agenda" icon="calendar-outline" onPress={() => navigation.navigate('Agendamentos')} />
      <Button title="Animais cadastrados" icon="paw-outline" cor="cinzaEscuro" onPress={() => navigation.navigate('ListaPets')} />
      <Button title="Caderno de cuidados" icon="book-outline" cor="branco" onPress={() => navigation.navigate('Informacoes')} />
    </View>
    <QueryState query={dashboard.query}>
      <Card><Text style={ui.title}>{dashboard.animals.length} paciente(s) na sua agenda</Text><Text style={ui.body}>{dashboard.upcoming.length} próximo(s) atendimento(s)</Text></Card>
      <Text style={ui.heading}>Próximos atendimentos</Text>
      {!dashboard.upcoming.length ? <Text style={ui.body}>Nenhum atendimento futuro. Sua agenda aparecerá aqui após o cadastro.</Text> : null}
      {dashboard.upcoming.slice(0, 3).map((item) => <AppointmentCard key={item.id} item={item} onEdit={() => navigation.navigate('AdicionarAgendamento', { id: item.id })} />)}
    </QueryState>
  </Screen>;
}
