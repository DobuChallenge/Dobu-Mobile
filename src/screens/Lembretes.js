import { Text, View } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import QueryState from '../components/QueryState';
import AppointmentCard from '../components/AppointmentCard';
import { useLembretes } from '../hooks/useAgenda';
import { ui } from '../styles/ui';

export default function Lembretes({ navigation }) {
  const { query, items } = useLembretes();
  return <Screen navigation={navigation} title="Lembretes" subtitle="Seus próximos atendimentos" active="lembretes">
    <Text style={ui.caption}>Acompanhe os agendamentos futuros. Atendimentos concluídos e cancelados ficam no histórico da agenda.</Text>
    <QueryState query={query} empty={!items.length} emptyTitle="Tudo em dia por aqui" emptyMessage="Você não tem atendimentos futuros em aberto. Cadastre um agendamento para vê-lo aqui.">
      {items.map((item) => <AppointmentCard key={item.id} item={item} onEdit={() => navigation.navigate('AdicionarAgendamento', { id: item.id })} />)}
    </QueryState>
    <View style={ui.actions}>
      <Button title="Novo agendamento" icon="add-outline" onPress={() => navigation.navigate('AdicionarAgendamento')} />
      <Button title="Ver histórico completo" cor="branco" onPress={() => navigation.navigate('Agendamentos')} />
    </View>
  </Screen>;
}
