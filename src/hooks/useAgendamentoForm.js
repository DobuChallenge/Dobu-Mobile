import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useCatalogos, usePets } from './usePets';
import { useAgendamento, useAgendamentoMutations } from './useAgendamentos';
import { combineQueries } from '../services/queryState';
import { agendamentoPayload, appointmentDraft } from '../utils/agendamentoValidation';
import { appointmentFormKey, initializeAppointmentForm } from './appointmentFormState';

export function useAgendamentoEditor(id) {
  const pets = usePets();
  const catalogs = useCatalogos();
  const appointment = useAgendamento(id);
  return { query: combineQueries(id ? [pets, catalogs, appointment] : [pets, catalogs]), pets: pets.data || [], usuarios: catalogs.data?.usuarios || [], initial: appointment.data };
}

export function useAgendamentoForm({ id, initial, petId, pets, usuarios }) {
  const { user } = useAuth();
  const { salvar } = useAgendamentoMutations();
  const key = appointmentFormKey(id, user.id);
  const [formState, setFormState] = useState(() => initializeAppointmentForm(null, { id, initial, petId, user }));
  const [error, setError] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    setFormState((current) => initializeAppointmentForm(current, { id, initial, petId, user }));
  }, [id, initial, petId, user.id, user.tipoConta]);

  useEffect(() => { setError(''); }, [key]);

  const ready = formState?.key === key;
  const draft = ready ? formState.draft : appointmentDraft();
  const change = (name, value) => {
    setFormState((current) => current?.key === key
      ? { ...current, draft: { ...current.draft, [name]: value } }
      : current);
    setError('');
  };
  const submit = async () => {
    if (!ready || lock.current) return null;
    lock.current = true;
    setError('');
    try {
      return await salvar.mutateAsync({ id, dados: agendamentoPayload(draft, pets, usuarios) });
    } catch (failure) { setError(failure.message); return null; }
    finally { lock.current = false; }
  };
  return { draft, change, submit, error, ready, pending: salvar.isPending, veterinarios: usuarios.filter((item) => item.tipoUsuario === 'VETERINARIO'), isVeterinario: user.tipoConta === 'veterinario' };
}
