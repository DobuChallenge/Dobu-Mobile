import { Text, View } from 'react-native';
import Screen from '../components/Screen';
import QueryState from '../components/QueryState';
import SelectField from '../components/SelectField';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAgendamentoEditor, useAgendamentoForm } from '../hooks/useAgendamentoForm';
import { appointmentStatuses } from '../utils/agendamentoValidation';
import { ui } from '../styles/ui';

export default function AdicionarAgendamento({ navigation, route }) {
  const id = route.params?.id;
  const editor = useAgendamentoEditor(id);
  return <Screen navigation={navigation} title={id ? 'Editar agendamento' : 'Novo agendamento'} subtitle="Organize o próximo atendimento">
    <QueryState query={editor.query}>
      <AgendamentoForm key={id || 'new'} navigation={navigation} {...editor} petId={route.params?.petId} />
    </QueryState>
  </Screen>;
}

function AgendamentoForm({ navigation, initial, pets, usuarios, petId }) {
  const form = useAgendamentoForm({ initial, pets, usuarios, petId });
  const statusOptions = [...new Set([...appointmentStatuses, form.draft.status])].filter(Boolean).map((value) => ({ value, label: value }));
  if (!pets.length) return <Card><Text style={ui.title}>Cadastre um animal primeiro</Text><Text style={ui.body}>O agendamento precisa estar vinculado a um animal.</Text><Button title="Cadastrar animal" onPress={() => navigation.navigate('CadastroPet')} /></Card>;
  if (!form.veterinarios.length) return <Card><Text style={ui.title}>Nenhum veterinário cadastrado</Text><Text style={ui.body}>Um profissional precisa criar uma conta de veterinário para receber agendamentos.</Text></Card>;
  return <Card>
    <SelectField label="Animal" value={form.draft.petId} onChange={(value) => form.change('petId', value)} options={pets.map((pet) => ({ value: pet.id, label: pet.nome }))} disabled={form.pending} />
    <SelectField label="Veterinário" value={form.draft.veterinarioId} onChange={(value) => form.change('veterinarioId', value)} options={form.veterinarios.map((user) => ({ value: user.id, label: `${user.nome} · ${user.email}` }))} disabled={form.pending || form.isVeterinario} />
    <TextInput label="Data" value={form.draft.data} onChangeText={(value) => form.change('data', value)} placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" editable={!form.pending} />
    <TextInput label="Horário" value={form.draft.horario} onChangeText={(value) => form.change('horario', value)} placeholder="HH:MM" keyboardType="numbers-and-punctuation" editable={!form.pending} />
    <SelectField label="Status" value={form.draft.status} onChange={(value) => form.change('status', value)} options={statusOptions} disabled={form.pending} />
    {form.error ? <Text style={ui.error} accessibilityRole="alert">{form.error}</Text> : null}
    <View style={ui.actions}>
      <Button title={form.pending ? 'Salvando…' : initial ? 'Salvar alterações' : 'Criar agendamento'} disabled={form.pending} onPress={async () => { if (await form.submit()) navigation.goBack(); }} />
    </View>
  </Card>;
}
