import { appointmentDraft } from '../utils/agendamentoValidation.js';

export function appointmentFormKey(id, userId) {
  return `${userId}:${id || 'new'}`;
}

export function initializeAppointmentForm(current, { id, initial, petId, user }) {
  if (!user?.id) return current;
  const key = appointmentFormKey(id, user.id);
  if (current?.key === key) return current;
  if (id && initial?.id !== id) return current;

  const draft = initial
    ? appointmentDraft(initial)
    : {
        ...appointmentDraft(),
        petId: petId || '',
        veterinarioId: user.tipoConta === 'veterinario' ? user.id : '',
      };
  return { key, draft };
}
