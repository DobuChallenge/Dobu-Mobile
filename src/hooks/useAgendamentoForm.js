import { useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useCatalogos, usePets } from './usePets';
import { useAgendamento, useAgendamentoMutations } from './useAgendamentos';
import { combineQueries } from '../services/queryState';
import { agendamentoPayload, appointmentDraft } from '../utils/agendamentoValidation';

export function useAgendamentoEditor(id) {
  const pets = usePets();
  const catalogs = useCatalogos();
  const appointment = useAgendamento(id);
  return { query: combineQueries(id ? [pets, catalogs, appointment] : [pets, catalogs]), pets: pets.data || [], usuarios: catalogs.data?.usuarios || [], initial: appointment.data };
}

export function useAgendamentoForm({ initial, petId, pets, usuarios }) {
  const { user } = useAuth();
  const { salvar } = useAgendamentoMutations();
  const [draft, setDraft] = useState(() => initial ? appointmentDraft(initial) : { ...appointmentDraft(), petId: petId || '', veterinarioId: user.tipoConta === 'veterinario' ? user.id : '' });
  const [error, setError] = useState('');
  const lock = useRef(false);
  const change = (name, value) => { setDraft((current) => ({ ...current, [name]: value })); setError(''); };
  const submit = async () => {
    if (lock.current) return null;
    lock.current = true;
    setError('');
    try {
      return await salvar.mutateAsync({ id: initial?.id, dados: agendamentoPayload(draft, pets, usuarios) });
    } catch (failure) { setError(failure.message); return null; }
    finally { lock.current = false; }
  };
  return { draft, change, submit, error, pending: salvar.isPending, veterinarios: usuarios.filter((item) => item.tipoUsuario === 'VETERINARIO'), isVeterinario: user.tipoConta === 'veterinario' };
}
