import { Alert, Text, View } from 'react-native';
import Screen from '../components/Screen';
import QueryState from '../components/QueryState';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import SelectField from '../components/SelectField';
import AppointmentCard from '../components/AppointmentCard';
import { useAgenda } from '../hooks/useAgenda';
import { appointmentStatuses } from '../utils/agendamentoValidation';
import { ui } from '../styles/ui';

export default function Agendamentos({ navigation, route }) {
  const petId = route.params?.petId;
  const agenda = useAgenda(petId);
  const remove = (item) => Alert.alert('Excluir agendamento?', `O atendimento de ${item.petNome} será removido.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: async () => { try { await agenda.excluir.mutateAsync(item.id); } catch (error) { Alert.alert('Não foi possível excluir', error.message); } } },
  ]);
  return <Screen navigation={navigation} title="Agendamentos" subtitle="Acompanhe e organize os atendimentos">
    <View style={ui.actions}><Button title="Novo agendamento" icon="add-outline" onPress={() => navigation.navigate('AdicionarAgendamento', { petId })} /></View>
    {petId ? <Button title="Mostrar todos os animais" cor="branco" onPress={() => navigation.setParams({ petId: undefined })} /> : null}
    <TextInput label="Buscar atendimento" value={agenda.search} onChangeText={agenda.setSearch} placeholder="Animal ou veterinário" />
    <SelectField label="Filtrar por status" value={agenda.status} onChange={agenda.setStatus} options={[{ value: '', label: 'Todos' }, ...appointmentStatuses.map((value) => ({ value, label: value }))]} />
    <QueryState query={agenda.query} empty={!agenda.items.length} emptyTitle="Nenhum agendamento encontrado" emptyMessage="Crie um atendimento ou ajuste os filtros da busca.">
      <Text style={ui.caption}>{agenda.items.length} atendimento(s)</Text>
      {agenda.items.map((item) => <AppointmentCard key={item.id} item={item} onEdit={() => navigation.navigate('AdicionarAgendamento', { id: item.id })} onDelete={() => remove(item)} pending={agenda.excluir.isPending} />)}
    </QueryState>
  </Screen>;
}
