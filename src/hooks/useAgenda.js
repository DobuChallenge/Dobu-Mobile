import { useState } from 'react';
import { useAgendamentos, useAgendamentoMutations } from './useAgendamentos';
import { filterAppointments, upcomingAppointments } from '../utils/agendamentoValidation';

export function useAgenda(petId) {
  const query = useAgendamentos();
  const { excluir } = useAgendamentoMutations();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  return { query, excluir, search, setSearch, status, setStatus, items: filterAppointments(query.data || [], { petId, search, status }) };
}

export function useLembretes() {
  const query = useAgendamentos();
  return { query, items: upcomingAppointments(query.data || []) };
}
