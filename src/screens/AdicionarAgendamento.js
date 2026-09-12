import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import SelectField from '../components/SelectField';
import { useAgendamentoEditor, useAgendamentoForm } from '../hooks/useAgendamentoForm';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';
import { appointmentStatuses } from '../utils/agendamentoValidation';

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const availableTimes = Array.from({ length: 21 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minute = String(totalMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
});

export default function AdicionarAgendamento({ navigation, route }) {
  const id = route.params?.id;
  const editor = useAgendamentoEditor(id);
  const form = useAgendamentoForm({ id, initial: editor.initial, pets: editor.pets, usuarios: editor.usuarios, petId: route.params?.petId });
  const query = {
    ...editor.query,
    isPending: editor.query.isPending || (!editor.query.isError && !form.ready),
  };

  return (
    <Screen navigation={navigation} title={id ? 'Editar agendamento' : 'Novo agendamento'} subtitle="Organize o próximo atendimento">
      <QueryState query={query}>
        <AgendamentoForm navigation={navigation} editing={Boolean(id)} form={form} pets={editor.pets} />
      </QueryState>
    </Screen>
  );
}

function AgendamentoForm({ navigation, editing, form, pets }) {
  const selectedDate = parseDraftDate(form.draft.data);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = selectedDate || new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const statusOptions = [...new Set([...appointmentStatuses, form.draft.status])].filter(Boolean).map((value) => ({ value, label: value }));
  const timeOptions = [...new Set([...availableTimes, form.draft.horario])].filter(Boolean).map((value) => ({ value, label: value }));

  if (!pets.length) {
    return (
      <Card>
        <Text style={ui.title}>Cadastre um animal primeiro</Text>
        <Text style={ui.body}>O agendamento precisa estar vinculado a um animal.</Text>
        <Button title="Cadastrar animal" onPress={() => navigation.navigate('CadastroPet')} />
      </Card>
    );
  }

  if (!form.veterinarios.length) {
    return (
      <Card>
        <Text style={ui.title}>Nenhum veterinário cadastrado</Text>
        <Text style={ui.body}>Um profissional precisa criar uma conta de veterinário para receber agendamentos.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <SelectField label="Animal" value={form.draft.petId} onChange={(value) => form.change('petId', value)} options={pets.map((pet) => ({ value: pet.id, label: pet.nome }))} disabled={form.pending} />
      <SelectField label="Veterinário" value={form.draft.veterinarioId} onChange={(value) => form.change('veterinarioId', value)} options={form.veterinarios.map((user) => ({ value: user.id, label: `${user.nome} · ${user.email}` }))} disabled={form.pending || form.isVeterinario} />
      <Calendar
        data={form.draft.data}
        days={days}
        visibleMonth={visibleMonth}
        disabled={form.pending}
        onChangeMonth={(direction) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1))}
        onSelect={(date) => form.change('data', formatDate(date))}
      />
      <SelectField label="Horário" value={form.draft.horario} onChange={(value) => form.change('horario', value)} options={timeOptions} placeholder="Selecione o horário" disabled={form.pending} />
      <SelectField label="Status" value={form.draft.status} onChange={(value) => form.change('status', value)} options={statusOptions} disabled={form.pending} />
      {form.error ? <Text style={ui.error} accessibilityRole="alert">{form.error}</Text> : null}
      <View style={ui.actions}>
        <Button title={form.pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar agendamento'} disabled={form.pending} onPress={async () => { if (await form.submit()) navigation.goBack(); }} />
      </View>
    </Card>
  );
}

function Calendar({ data, days, visibleMonth, disabled, onChangeMonth, onSelect }) {
  const title = `${monthNames[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;

  return (
    <View style={styles.calendarGroup}>
      <Text style={ui.label}>Data</Text>
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <Pressable disabled={disabled} onPress={() => onChangeMonth(-1)} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={20} color={cores.marrom} />
          </Pressable>
          <Text style={styles.monthTitle}>{title}</Text>
          <Pressable disabled={disabled} onPress={() => onChangeMonth(1)} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={20} color={cores.marrom} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekText}>{day}</Text>)}
        </View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            const selected = day && formatDate(day) === data;
            return (
              <Pressable
                key={day ? dateKey(day) : `empty-${index}`}
                disabled={!day || disabled}
                onPress={() => onSelect(day)}
                style={[styles.dayButton, selected && styles.selectedDay, !day && styles.emptyDay]}
              >
                {day ? <Text style={[styles.dayText, selected && styles.selectedDayText]}>{day.getDate()}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
      {data ? <Text style={styles.selectedDate}>Selecionado: {data}</Text> : null}
    </View>
  );
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDraftDate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value || '')) return null;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function buildMonthDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const days = [];
  const emptyDays = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let index = 0; index < emptyDays; index += 1) days.push(null);
  for (let day = 1; day <= totalDays; day += 1) days.push(new Date(year, month, day));
  return days;
}

const styles = StyleSheet.create({
  calendarGroup: { marginBottom: 18 },
  calendar: { backgroundColor: cores.branco, borderRadius: 8, padding: 12 },
  calendarHeader: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  arrowButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { color: cores.marrom, fontSize: 17, fontWeight: '900' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekText: { flex: 1, textAlign: 'center', color: cores.textoClaro, fontWeight: '900' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayButton: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  emptyDay: { opacity: 0 },
  selectedDay: { backgroundColor: cores.cinzaEscuro },
  dayText: { color: cores.texto, fontSize: 15, fontWeight: '800' },
  selectedDayText: { color: cores.branco },
  selectedDate: { color: cores.marrom, fontWeight: '800', marginTop: 8 },
});
