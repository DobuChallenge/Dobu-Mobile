import { petsApi } from '../api/pets.js';
import { agendamentosApi } from '../api/agendamentos.js';
import { usuariosApi } from '../api/usuarios.js';
import { catalogosApi } from '../api/catalogos.js';
import { ApiError } from '../api/httpClient.js';

export const accountKey = (user) => ['dobu', user?.id];

function query(user, resource, queryFn) {
  return { queryKey: [...accountKey(user), resource], queryFn, enabled: Boolean(user), retry: false, staleTime: 30000 };
}

async function visiblePets(user) {
  if (!user) return [];
  const pets = user.tipoConta === 'veterinario' ? await petsApi.listar() : await petsApi.listarPorResponsavel(user.id);
  return user.tipoConta === 'veterinario' ? pets : pets.filter((pet) => pet.responsavelId === user.id);
}

export function petsQuery(user) {
  return query(user, 'pets', () => visiblePets(user));
}

export function petQuery(user, id) {
  return {
    ...query(user, 'pets', async () => {
      const pet = await petsApi.obter(id);
      if (user.tipoConta !== 'veterinario' && pet.responsavelId !== user.id) throw new ApiError('Você não tem acesso a este animal.', 'FORBIDDEN', 403);
      return pet;
    }),
    queryKey: [...accountKey(user), 'pets', id],
    enabled: Boolean(user && id),
  };
}

export function catalogosQuery(user) {
  return query(user, 'catalogos', async () => {
    const [racas, especies, usuarios] = await Promise.all([catalogosApi.racas(), catalogosApi.especies(), usuariosApi.listar()]);
    return { racas, especies, usuarios };
  });
}

export function agendamentosQuery(user) {
  return query(user, 'agendamentos', async () => {
    const [pets, usuarios] = await Promise.all([visiblePets(user), usuariosApi.listar()]);
    const records = user.tipoConta === 'veterinario'
      ? await agendamentosApi.listarPorVeterinario(user.id)
      : (await Promise.all(pets.map((pet) => agendamentosApi.listarPorPet(pet.id)))).flat();
    const petIds = new Set(pets.map((pet) => pet.id));
    return records
      .filter((item) => user.tipoConta === 'veterinario' ? item.veterinarioId === user.id : petIds.has(item.petId))
      .map((item) => ({
        ...item,
        petNome: pets.find((pet) => pet.id === item.petId)?.nome || item.pet?.nome || 'Animal indisponível',
        veterinarioNome: usuarios.find((usuario) => usuario.id === item.veterinarioId)?.nome || 'Veterinário indisponível',
      }))
      .sort((a, b) => a.dataAgendamento.localeCompare(b.dataAgendamento));
  });
}

export function agendamentoQuery(user, id) {
  return {
    ...query(user, 'agendamentos', async () => {
      const item = await agendamentosApi.obter(id);
      const allowed = user.tipoConta === 'veterinario'
        ? item.veterinarioId === user.id
        : (await visiblePets(user)).some((pet) => pet.id === item.petId);
      if (!allowed) throw new ApiError('Você não tem acesso a este agendamento.', 'FORBIDDEN', 403);
      return item;
    }),
    queryKey: [...accountKey(user), 'agendamentos', id],
    enabled: Boolean(user && id),
  };
}

function mutationOptions(client, user, api, action) {
  return {
    mutationFn: action === 'excluir' ? (id) => api.excluir(id) : ({ id, dados }) => id ? api.atualizar(id, dados) : api.criar(dados),
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: accountKey(user) }),
  };
}

export const petMutationOptions = (client, user, action) => mutationOptions(client, user, petsApi, action);
export const agendamentoMutationOptions = (client, user, action) => mutationOptions(client, user, agendamentosApi, action);
