export const appointmentStatuses = ['Agendado', 'Confirmado', 'Concluído', 'Cancelado'];
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function agendamentoPayload(draft, pets, usuarios) {
  if (!pets.some((pet) => pet.id === draft.petId)) throw new Error('Selecione um animal disponível.');
  if (!usuarios.some((user) => user.id === draft.veterinarioId && user.tipoUsuario === 'VETERINARIO')) throw new Error('Selecione um veterinário disponível.');
  if (!draft.status?.trim()) throw new Error('Informe o status do agendamento.');
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(draft.data)) throw new Error('Informe a data no formato DD/MM/AAAA.');
  const [day, month, year] = draft.data.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new Error('Informe uma data válida.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.horario)) throw new Error('Informe o horário entre 00:00 e 23:59.');
  return {
    dataAgendamento: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${draft.horario}:00`,
    status: draft.status.trim(), petId: draft.petId, veterinarioId: draft.veterinarioId,
  };
}

export function appointmentDraft(item) {
  if (!item) return { data: '', horario: '', status: 'Agendado', petId: '', veterinarioId: '' };
  // The API stores the appointment's local wall time without a time zone.
  const [year, month, day] = item.dataAgendamento.slice(0, 10).split('-');
  return { data: `${day}/${month}/${year}`, horario: item.dataAgendamento.slice(11, 16), status: item.status, petId: item.petId, veterinarioId: item.veterinarioId };
}

export function formatAppointmentDate(value) {
  if (!value) return 'Data não informada';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year} às ${value.slice(11, 16)}`;
}

export function filterAppointments(items, { search = '', status = '', petId = '' } = {}) {
  return items.filter((item) => (!status || item.status === status) && (!petId || item.petId === petId) && normalize(`${item.petNome || ''} ${item.veterinarioNome || ''}`).includes(normalize(search)));
}

export function upcomingAppointments(items, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return items.filter((item) => !['cancelado', 'concluido'].includes(normalize(item.status)) && new Date(item.dataAgendamento) >= today);
}
