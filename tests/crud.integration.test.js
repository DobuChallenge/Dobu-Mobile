import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { QueryClient, MutationObserver } from '@tanstack/react-query';
import { authApi } from '../src/api/auth.js';
import { request, setAuthToken } from '../src/api/httpClient.js';
import { petsQuery, petQuery, petMutationOptions, agendamentosQuery, agendamentoQuery, agendamentoMutationOptions } from '../src/services/queries.js';
import { informacaoMutationOptions, informacoesQuery } from '../src/services/informacoes.js';

test('API real: CRUD pets e agenda, caderno e atualização automática do cache', { skip: !process.env.EXPO_PUBLIC_API_URL }, async () => {
  const client = new QueryClient();
  const resources = [];
  const accountTokens = new Map();
  const suffix = randomUUID();
  const senha = randomBytes(24).toString('base64url');
  try {
    const vet = await authApi.cadastrar({ nome: 'Veterinário integração', email: `vet-${suffix}@example.test`, senha, tipoUsuario: 'VETERINARIO' });
    resources.push(`/api/usuarios/${vet.usuarioId}`);
    accountTokens.set(`/api/usuarios/${vet.usuarioId}`, vet.token);
    const session = await authApi.cadastrar({ nome: 'Responsável integração', email: `owner-${suffix}@example.test`, senha, tipoUsuario: 'RESPONSAVEL' });
    resources.push(`/api/usuarios/${session.usuarioId}`);
    accountTokens.set(`/api/usuarios/${session.usuarioId}`, session.token);
    setAuthToken(session.token);
    const user = { id: session.usuarioId, tipoConta: 'responsavel' };
    const species = await request('/api/especies', { method: 'POST', body: { nome: `Espécie ${suffix}`, descricao: 'Espécie de teste de integração' } });
    resources.push(`/api/especies/${species.id}`);
    const breed = await request('/api/racas', { method: 'POST', body: { nome: `Raça ${suffix}`, porte: 'Médio', expectativaVida: 12, descricao: 'Catálogo criado pelo teste de integração.', cuidados: 'Registro de teste, sem orientação clínica.', especieId: species.id } });
    resources.push(`/api/racas/${breed.id}`);
    const petSave = new MutationObserver(client, petMutationOptions(client, user, 'salvar'));
    const original = { nome: 'Lua integração', idade: 0, racaId: breed.id, responsavelId: user.id };
    const pet = await petSave.mutate({ dados: original });
    resources.push(`/api/pets/${pet.id}`);
    assert.equal((await client.fetchQuery(petsQuery(user))).some((item) => item.id === pet.id), true);
    await petSave.mutate({ id: pet.id, dados: { ...original, nome: 'Lua atualizada', idade: 2 } });
    assert.equal((await client.fetchQuery(petQuery(user, pet.id))).nome, 'Lua atualizada');
    assert.equal((await client.fetchQuery(petsQuery(user))).find((item) => item.id === pet.id).idade, 2);

    const appointmentSave = new MutationObserver(client, agendamentoMutationOptions(client, user, 'salvar'));
    const appointmentBody = { petId: pet.id, veterinarioId: vet.usuarioId, dataAgendamento: '2028-10-20T09:30:00', status: 'Agendado' };
    const appointment = await appointmentSave.mutate({ dados: appointmentBody });
    resources.push(`/api/agendamentos/${appointment.id}`);
    assert.equal((await client.fetchQuery(agendamentosQuery(user)))[0].petNome, 'Lua atualizada');
    await appointmentSave.mutate({ id: appointment.id, dados: { ...appointmentBody, status: 'Confirmado', dataAgendamento: '2028-10-21T10:00:00' } });
    assert.equal((await client.fetchQuery(agendamentoQuery(user, appointment.id))).status, 'Confirmado');
    assert.equal((await client.fetchQuery(agendamentosQuery(user)))[0].dataAgendamento, '2028-10-21T10:00:00');

    const note = await new MutationObserver(client, informacaoMutationOptions(client, user, 'criar')).mutate({ titulo: 'Retorno', descricao: 'Levar os registros ao próximo atendimento.', petId: pet.id });
    resources.push(`/api/informacoes-cuidado/${note.id}`);
    assert.equal((await client.fetchQuery(informacoesQuery(user, pet.id)))[0].titulo, 'Retorno');
    await new MutationObserver(client, informacaoMutationOptions(client, user, 'excluir')).mutate({ id: note.id, petId: pet.id });
    assert.deepEqual(await client.fetchQuery(informacoesQuery(user, pet.id)), []);
    resources.pop();

    await new MutationObserver(client, agendamentoMutationOptions(client, user, 'excluir')).mutate(appointment.id);
    assert.deepEqual(await client.fetchQuery(agendamentosQuery(user)), []);
    resources.pop();
    await new MutationObserver(client, petMutationOptions(client, user, 'excluir')).mutate(pet.id);
    assert.deepEqual(await client.fetchQuery(petsQuery(user)), []);
    resources.pop();
  } finally {
    const cleanupErrors = [];
    for (const path of resources.reverse()) {
      if (accountTokens.has(path)) setAuthToken(accountTokens.get(path));
      try { await request(path, { method: 'DELETE' }); }
      catch (error) { if (error.status !== 404) cleanupErrors.push(`${path}: ${error.message}`); }
    }
    setAuthToken(null);
    client.clear();
    assert.deepEqual(cleanupErrors, [], 'Os registros temporários devem ser removidos.');
  }
});
