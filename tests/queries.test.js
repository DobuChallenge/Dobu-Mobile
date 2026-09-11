import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QueryClient, MutationObserver } from '@tanstack/react-query';
import { apiConfig } from '../src/api/config.js';
import { petsQuery, agendamentosQuery, petMutationOptions, agendamentoMutationOptions } from '../src/services/queries.js';

const owner = { id: 'owner-1', tipoConta: 'responsavel' };

test('agenda do responsável usa IDs e não mistura pets homônimos de outras contas', async (t) => {
  apiConfig.baseUrl = 'https://dobu.test';
  t.mock.method(globalThis, 'fetch', async (url) => {
    const data = url.endsWith('/api/pets/responsavel/owner-1')
      ? [{ id: 'pet-1', nome: 'Lua', responsavelId: 'owner-1' }]
      : url.endsWith('/api/agendamentos/pet/pet-1')
        ? [{ id: 'appointment-1', petId: 'pet-1', veterinarioId: 'vet-1', dataAgendamento: '2026-10-10T10:00:00', status: 'Agendado' }]
        : url.endsWith('/api/usuarios') ? [{ id: 'vet-1', nome: 'Dra. Ana', tipoUsuario: 'VETERINARIO' }] : [];
    return new Response(JSON.stringify(data));
  });
  const client = new QueryClient();
  try {
    const result = await client.fetchQuery(agendamentosQuery(owner));
    assert.equal(result.length, 1);
    assert.equal(result[0].petNome, 'Lua');
    assert.equal(result[0].veterinarioNome, 'Dra. Ana');
    assert.equal(result[0].id, 'appointment-1');
  } finally { client.clear(); }
});

test('salvar e excluir invalidam dados da conta sem alterar cache de outra sessão', async (t) => {
  apiConfig.baseUrl = 'https://dobu.test';
  t.mock.method(globalThis, 'fetch', async (_url, init) => new Response(init.method === 'DELETE' ? null : '{"id":"pet-1"}', { status: init.method === 'DELETE' ? 204 : 200 }));
  const client = new QueryClient();
  const key = petsQuery(owner).queryKey;
  const other = petsQuery({ id: 'owner-2', tipoConta: 'responsavel' }).queryKey;
  client.setQueryData(key, []);
  client.setQueryData(other, [{ id: 'other' }]);
  try {
    const save = new MutationObserver(client, petMutationOptions(client, owner, 'salvar'));
    await save.mutate({ dados: { nome: 'Lua', idade: 0, racaId: 'raca-1', responsavelId: owner.id } });
    assert.equal(client.getQueryState(key).isInvalidated, true);
    assert.equal(client.getQueryState(other).isInvalidated, false);
    client.setQueryData(key, [{ id: 'pet-1' }]);
    await new MutationObserver(client, agendamentoMutationOptions(client, owner, 'excluir')).mutate('appointment-1');
    assert.equal(client.getQueryState(key).isInvalidated, true);
  } finally { client.clear(); }
});

test('falha ao salvar não apaga dados já consultados', async (t) => {
  apiConfig.baseUrl = 'https://dobu.test';
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 500 }));
  const client = new QueryClient();
  const key = petsQuery(owner).queryKey;
  client.setQueryData(key, [{ id: 'kept' }]);
  try {
    await assert.rejects(new MutationObserver(client, petMutationOptions(client, owner, 'excluir')).mutate('kept'), { status: 500 });
    assert.deepEqual(client.getQueryData(key), [{ id: 'kept' }]);
  } finally { client.clear(); }
});
