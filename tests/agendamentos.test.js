import assert from 'node:assert/strict';
import { test } from 'node:test';
import { agendamentoPayload, appointmentDraft, filterAppointments, upcomingAppointments } from '../src/utils/agendamentoValidation.js';
import { initializeAppointmentForm } from '../src/hooks/appointmentFormState.js';

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
test('rascunho editado sobrevive a falha e recuperacao da consulta do mesmo agendamento', () => {
  const context = { id: 'appointment-1', petId: '', user: { id: 'owner-1', tipoConta: 'responsavel' } };
  const initial = { id: 'appointment-1', dataAgendamento: '2028-02-29T09:30:00', status: 'Agendado', petId: 'pet', veterinarioId: 'vet' };
  assert.equal(initializeAppointmentForm(null, { ...context, initial: undefined }), null);

  const initialized = initializeAppointmentForm(null, { ...context, initial });
  const dirty = { ...initialized, draft: { ...initialized.draft, status: 'Confirmado' } };
  const failed = initializeAppointmentForm(dirty, { ...context, initial: undefined });
  const refetched = initializeAppointmentForm(failed, {
    ...context,
    initial: { ...initial, status: 'Cancelado' },
  });

  assert.strictEqual(failed, dirty);
  assert.strictEqual(refetched, dirty);
  assert.equal(refetched.draft.status, 'Confirmado');
});
test('outro id de rota recebe o rascunho do novo agendamento', () => {
  const user = { id: 'owner-1', tipoConta: 'responsavel' };
  const first = initializeAppointmentForm(null, {
    id: 'appointment-1', user, initial: { id: 'appointment-1', dataAgendamento: '2028-02-29T09:30:00', status: 'Agendado', petId: 'pet', veterinarioId: 'vet' },
  });
  const waiting = initializeAppointmentForm(first, {
    id: 'appointment-2', user, initial: { id: 'appointment-1', dataAgendamento: '2028-02-29T09:30:00', status: 'Agendado', petId: 'pet', veterinarioId: 'vet' },
  });
  const second = initializeAppointmentForm(waiting, {
    id: 'appointment-2', user, initial: { id: 'appointment-2', dataAgendamento: '2028-03-01T10:00:00', status: 'Cancelado', petId: 'pet', veterinarioId: 'vet' },
  });
  assert.strictEqual(waiting, first);
  assert.equal(second.key, 'owner-1:appointment-2');
  assert.deepEqual(second.draft, { data: '01/03/2028', horario: '10:00', status: 'Cancelado', petId: 'pet', veterinarioId: 'vet' });
});
test('troca de conta cria uma identidade de formulario separada', () => {
  const initial = { id: 'appointment-1', dataAgendamento: '2028-02-29T09:30:00', status: 'Agendado', petId: 'pet', veterinarioId: 'vet' };
  const first = initializeAppointmentForm(null, { id: 'appointment-1', initial, user: { id: 'owner-1', tipoConta: 'responsavel' } });
  const second = initializeAppointmentForm(first, { id: 'appointment-1', initial, user: { id: 'owner-2', tipoConta: 'responsavel' } });
  assert.equal(second.key, 'owner-2:appointment-1');
  assert.notStrictEqual(second, first);
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
