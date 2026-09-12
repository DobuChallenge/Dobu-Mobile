import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { MutationObserver, QueryClient } from '@tanstack/react-query';

import { apiConfig } from '../src/api/config.js';
import { informacoesApi } from '../src/api/informacoes.js';
import {
  cuidadoDaRaca,
  criarControleSubmissao,
  criarGuardaRascunho,
  filtrarInformacoes,
  informacaoMutationOptions,
  informacoesQuery,
  selecionarPetDisponivel,
  validarInformacao,
} from '../src/services/informacoes.js';

const originalFetch = globalThis.fetch;
const originalBaseUrl = apiConfig.baseUrl;
const user = { id: 'owner-1', tipoConta: 'responsavel' };

beforeEach(() => {
  apiConfig.baseUrl = 'https://api.example.test/';
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  apiConfig.baseUrl = originalBaseUrl;
});

test('API de informações usa somente GET por pet, POST com DTO exato e DELETE', async () => {
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return args[1].method === 'DELETE'
      ? new Response(null, { status: 204 })
      : Response.json([]);
  };

  await informacoesApi.listarPorPet('pet/1');
  await informacoesApi.criar({ titulo: '  Rotina  ', descricao: '  Passeio cedo  ', petId: 'pet-1', extra: true });
  await informacoesApi.excluir('nota/1');

  assert.equal(calls[0][0], 'https://api.example.test/api/informacoes-cuidado/pet/pet%2F1');
  assert.equal(calls[0][1].method, 'GET');
  assert.equal(calls[1][0], 'https://api.example.test/api/informacoes-cuidado');
  assert.equal(calls[1][1].method, 'POST');
  assert.deepEqual(JSON.parse(calls[1][1].body), {
    titulo: 'Rotina',
    descricao: 'Passeio cedo',
    petId: 'pet-1',
  });
  assert.equal(calls[2][0], 'https://api.example.test/api/informacoes-cuidado/nota%2F1');
  assert.equal(calls[2][1].method, 'DELETE');
  assert.equal('atualizar' in informacoesApi, false);
});

test('busca encontra registros do usuário sem distinguir acentos ou maiúsculas', () => {
  const notas = [
    { id: '1', titulo: 'Alimentação', descricao: 'Ração pela manhã' },
    { id: '2', titulo: 'Passeio', descricao: 'Quinze minutos' },
  ];

  assert.deepEqual(filtrarInformacoes(notas, 'ALIMENTACAO').map((item) => item.id), ['1']);
  assert.deepEqual(filtrarInformacoes(notas, 'racao manha').map((item) => item.id), ['1']);
  assert.deepEqual(filtrarInformacoes(notas, '  ').map((item) => item.id), ['1', '2']);
});

test('validação aplica os limites do backend e devolve valores aparados', () => {
  const invalida = validarInformacao({ titulo: ' A ', descricao: ' 1234 ', petId: '' });
  assert.deepEqual(invalida.erros, {
    titulo: 'Informe um título com pelo menos 2 caracteres.',
    descricao: 'Informe uma descrição com pelo menos 5 caracteres.',
    petId: 'Selecione um animal.',
  });
  assert.equal(invalida.valida, false);

  const valida = validarInformacao({ titulo: '  Ação  ', descricao: '  Cinco ou mais  ', petId: 'pet-1' });
  assert.equal(valida.valida, true);
  assert.deepEqual(valida.dados, { titulo: 'Ação', descricao: 'Cinco ou mais', petId: 'pet-1' });
});

test('controle de envio ignora submissão duplicada enquanto o primeiro POST está pendente', async () => {
  const controle = criarControleSubmissao();
  let concluir;
  let envios = 0;
  const primeiro = controle.executar(() => {
    envios += 1;
    return new Promise((resolve) => { concluir = resolve; });
  });

  assert.equal(await controle.executar(() => { envios += 1; }), false);
  assert.equal(envios, 1);
  concluir('salvo');
  assert.equal(await primeiro, 'salvo');
  assert.equal(await controle.executar(async () => { envios += 1; return 'novo'; }), 'novo');
  assert.equal(envios, 2);
});

test('resposta de envio antigo não pertence ao rascunho de outro pet', () => {
  const guarda = criarGuardaRascunho('pet-1');
  assert.equal(guarda.pertence('pet-1'), true);

  guarda.atualizar('pet-2');

  assert.equal(guarda.pertence('pet-1'), false);
  assert.equal(guarda.pertence('pet-2'), true);
});

test('seleção atual persiste no refetch e parâmetro de rota só escolhe pet visível', () => {
  const pets = [{ id: 'pet-1' }, { id: 'pet-2' }];
  assert.equal(selecionarPetDisponivel(pets, 'pet-2', 'pet-1'), 'pet-2');
  assert.equal(selecionarPetDisponivel(pets, '', 'pet-2'), 'pet-2');
  assert.equal(selecionarPetDisponivel(pets, '', 'pet-secreto'), 'pet-1');
  assert.equal(selecionarPetDisponivel([], 'pet-2', 'pet-1'), '');
});

test('cuidados vêm do catálogo da raça e aceitam descrição como fallback', () => {
  const pet = { id: 'pet-1', racaId: 'raca-1' };
  assert.deepEqual(cuidadoDaRaca(pet, {
    racas: [{ id: 'raca-1', nome: 'SRD', cuidados: '  Escovação semanal  ', descricao: 'Companheiro' }],
  }), { nome: 'SRD', texto: 'Escovação semanal' });
  assert.deepEqual(cuidadoDaRaca(pet, {
    racas: [{ id: 'raca-1', nome: 'SRD', cuidados: ' ', descricao: '  Sem cuidados cadastrados; descrição disponível.  ' }],
  }), { nome: 'SRD', texto: 'Sem cuidados cadastrados; descrição disponível.' });
  assert.equal(cuidadoDaRaca(pet, { racas: [] }), null);
});

test('query e mutations mantêm o cache dentro da conta autenticada', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push([url, init]);
    return init.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : Response.json([{ id: 'nota-1', titulo: 'Rotina', descricao: 'Passeio cedo', petId: 'pet-1' }]);
  };
  const client = new QueryClient();
  const key = informacoesQuery(user, 'pet-1').queryKey;
  const otherKey = informacoesQuery({ id: 'owner-2' }, 'pet-1').queryKey;

  try {
    const notas = await client.fetchQuery(informacoesQuery(user, 'pet-1'));
    assert.equal(notas[0].id, 'nota-1');
    assert.deepEqual(key, ['dobu', 'owner-1', 'informacoes', 'pet-1']);
    client.setQueryData(otherKey, [{ id: 'outra-conta' }]);

    await new MutationObserver(client, informacaoMutationOptions(client, user, 'criar'))
      .mutate({ titulo: 'Rotina', descricao: 'Passeio cedo', petId: 'pet-1' });
    assert.equal(client.getQueryState(key).isInvalidated, true);
    assert.equal(client.getQueryState(otherKey).isInvalidated, false);

    client.setQueryData(key, [{ id: 'nota-1' }]);
    await new MutationObserver(client, informacaoMutationOptions(client, user, 'excluir'))
      .mutate({ id: 'nota-1', petId: 'pet-1' });
    assert.equal(client.getQueryState(key).isInvalidated, true);
    assert.equal(calls.at(-1)[1].method, 'DELETE');
  } finally {
    client.clear();
  }
});
