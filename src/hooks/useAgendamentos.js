import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { agendamentoMutationOptions, agendamentoQuery, agendamentosQuery } from '../services/queries';

export function useAgendamentos() {
  const { user } = useAuth();
  return useQuery(agendamentosQuery(user));
}

export function useAgendamento(id) {
  const { user } = useAuth();
  return useQuery(agendamentoQuery(user, id));
}

export function useAgendamentoMutations() {
  const { user } = useAuth();
  const client = useQueryClient();
  return {
    salvar: useMutation(agendamentoMutationOptions(client, user, 'salvar')),
    excluir: useMutation(agendamentoMutationOptions(client, user, 'excluir')),
  };
}
