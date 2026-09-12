import assert from 'node:assert/strict';
import { test } from 'node:test';
import { agendamentoPayload, appointmentDraft, filterAppointments, upcomingAppointments } from '../src/utils/agendamentoValidation.js';

const data = { data: '29/02/2028', horario: '09:30', status: 'Agendado', petId: 'pet', veterinarioId: 'vet' };
const pets = [{ id: 'pet' }];
const users = [{ id: 'vet', tipoUsuario: 'VETERINARIO' }];
test('valida calendário real e preserva horário local aceito pelo backend', () => {
  assert.deepEqual(agendamentoPayload(data, pets, users), { dataAgendamento: '2028-02-29T09:30:00', status: 'Agendado', petId: 'pet', veterinarioId: 'vet' });
  for (const value of ['31/04/2028', '29/02/2027', '00/01/2028', '1/2/2028']) assert.throws(() => agendamentoPayload({ ...data, data: value }, pets, users));
  for (const value of ['24:00', '09:60', '9:00', '']) assert.throws(() => agendamentoPayload({ ...data, horario: value }, pets, users));
});
test('impede salvar com pet ou veterinário removido e status vazio', () => {
  assert.throws(() => agendamentoPayload(data, [], users));
  assert.throws(() => agendamentoPayload(data, pets, [{ id: 'vet', tipoUsuario: 'RESPONSAVEL' }]));
  assert.throws(() => agendamentoPayload({ ...data, status: '' }, pets, users));
});
test('edição mantém data e status originais em vez de reiniciar o formulário', () => {
  assert.deepEqual(appointmentDraft({ dataAgendamento: '2028-02-29T09:30:00', status: 'Concluído', petId: 'pet', veterinarioId: 'vet' }), { ...data, status: 'Concluído' });
});
test('filtros pesquisam nomes sem acento e lembretes excluem compromissos encerrados', () => {
  const list = [
    { id: '1', petNome: 'Ágata', veterinarioNome: 'João', petId: 'p', status: 'Agendado', dataAgendamento: '2028-02-29T09:30:00' },
    { id: '2', petNome: 'Lua', veterinarioNome: 'João', petId: 'q', status: 'Cancelado', dataAgendamento: '2028-02-29T10:00:00' },
    { id: '3', petNome: 'Sol', petId: 'p', status: 'Concluído', dataAgendamento: '2028-02-29T11:00:00' },
  ];
  assert.deepEqual(filterAppointments(list, { search: 'agata', petId: 'p' }).map((item) => item.id), ['1']);
  assert.deepEqual(upcomingAppointments(list, new Date('2028-02-29T08:00:00')).map((item) => item.id), ['1']);
  assert.deepEqual(upcomingAppointments(list, new Date('2028-03-01T08:00:00')), []);
});
