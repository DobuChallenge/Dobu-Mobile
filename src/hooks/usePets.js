import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { catalogosQuery, petMutationOptions, petQuery, petsQuery } from '../services/queries';

export function usePets() {
  const { user } = useAuth();
  return useQuery(petsQuery(user));
}

export function usePet(id) {
  const { user } = useAuth();
  return useQuery(petQuery(user, id));
}

export function useCatalogos() {
  const { user } = useAuth();
  return useQuery(catalogosQuery(user));
}

export function usePetMutations() {
  const { user } = useAuth();
  const client = useQueryClient();
  return {
    salvar: useMutation(petMutationOptions(client, user, 'salvar')),
    excluir: useMutation(petMutationOptions(client, user, 'excluir')),
  };
}
