import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { apiConfig } from '../src/api/config.js';
import { ApiError, request, setAuthToken } from '../src/api/httpClient.js';
import { authApi } from '../src/api/auth.js';
import { petsApi } from '../src/api/pets.js';
import { agendamentosApi } from '../src/api/agendamentos.js';

const originalFetch = globalThis.fetch;
const originalBaseUrl = apiConfig.baseUrl;

beforeEach(() => {
  apiConfig.baseUrl = 'https://api.example.test/';
  setAuthToken(null);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  apiConfig.baseUrl = originalBaseUrl;
  setAuthToken(null);
});

test('envia JSON e token centralizado, permitindo limpar a sessão', async () => {
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return new Response(null, { status: 204 });
  };
  setAuthToken('token-de-teste');
  await petsApi.criar({ nome: 'Pet teste', idade: 2, racaId: 'raca', responsavelId: 'usuario', extra: true });
  assert.equal(calls[0][0], 'https://api.example.test/api/pets');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].headers.Authorization, 'Bearer token-de-teste');
  assert.equal(calls[0][1].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    nome: 'Pet teste', idade: 2, racaId: 'raca', responsavelId: 'usuario',
  });
  setAuthToken(null);
  await petsApi.listar();
  assert.equal(calls[1][1].headers.Authorization, undefined);
  assert.equal(calls[1][1].headers['Content-Type'], undefined);
});

test('login e cadastro respeitam os DTOs e não enviam token anterior', async () => {
  const calls = [];
  const response = { token: 'novo-token', usuarioId: 'usuario', nome: 'Teste', email: 'teste@example.test', tipoUsuario: 'RESPONSAVEL' };
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return Response.json(response);
  };
  setAuthToken('token-antigo');
  assert.deepEqual(await authApi.login({ email: 'teste@example.test', senha: 'senha-de-teste', extra: true }), response);
  await authApi.cadastrar({ nome: 'Teste', email: 'teste@example.test', senha: 'senha-de-teste', tipoUsuario: 'RESPONSAVEL' });
  assert.equal(calls[0][0], 'https://api.example.test/api/auth/login');
  assert.equal(calls[1][0], 'https://api.example.test/api/auth/register');
  assert.equal(calls[0][1].headers.Authorization, undefined);
  assert.equal(calls[1][1].headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(calls[0][1].body), { email: 'teste@example.test', senha: 'senha-de-teste' });
  assert.deepEqual(JSON.parse(calls[1][1].body), { nome: 'Teste', email: 'teste@example.test', senha: 'senha-de-teste', tipoUsuario: 'RESPONSAVEL' });
});

test('agendamento usa os campos reais e exclusão aceita 204', async () => {
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return new Response(null, { status: 204 });
  };
  await agendamentosApi.atualizar('id', { dataAgendamento: '2026-09-10T12:00:00', status: 'AGENDADO', petId: 'pet', veterinarioId: 'vet', extra: true });
  assert.equal(calls[0][0], 'https://api.example.test/api/agendamentos/id');
  assert.equal(calls[0][1].method, 'PUT');
  assert.deepEqual(JSON.parse(calls[0][1].body), { dataAgendamento: '2026-09-10T12:00:00', status: 'AGENDADO', petId: 'pet', veterinarioId: 'vet' });
  assert.equal(await agendamentosApi.excluir('id'), undefined);
  assert.equal(calls[1][1].method, 'DELETE');
});

test('codifica filtros como segmentos de rota', async () => {
  let url;
  globalThis.fetch = async (value) => { url = value; return Response.json([]); };
  await petsApi.buscarPorNome('A/B ?');
  assert.equal(url, 'https://api.example.test/api/pets/nome/A%2FB%20%3F');
  await agendamentosApi.listarPorStatus('EM ANDAMENTO');
  assert.equal(url, 'https://api.example.test/api/agendamentos/status/EM%20ANDAMENTO');
});

test('erros HTTP nunca repassam o corpo do servidor', async () => {
  for (const status of [400, 401, 403, 404, 409, 422, 429, 500, 503]) {
    globalThis.fetch = async () => new Response('senha token stacktrace privado', { status });
    await assert.rejects(petsApi.listar(), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, status);
      assert.equal(error.code, 'HTTP_ERROR');
      assert.doesNotMatch(error.message + JSON.stringify(error), /stacktrace|privado|senha token/);
      return true;
    });
  }
});

test('distingue falha de rede, JSON inválido e configuração ausente', async () => {
  globalThis.fetch = async () => { throw new Error('detalhe privado'); };
  await assert.rejects(petsApi.listar(), { code: 'NETWORK_ERROR' });
  globalThis.fetch = async () => new Response('<html>erro</html>');
  await assert.rejects(petsApi.listar(), { code: 'INVALID_RESPONSE' });
  apiConfig.baseUrl = '';
  globalThis.fetch = async () => assert.fail('não deve enviar sem configuração');
  await assert.rejects(petsApi.listar(), { code: 'CONFIG_ERROR' });
});

test('timeout aborta a requisição e produz erro seguro', async () => {
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('detalhe privado')), { once: true });
  });
  await assert.rejects(request('/api/pets', { timeoutMs: 10 }), { code: 'TIMEOUT' });
});

test('leitura IoT usa a URL do dispositivo sem enviar o token do backend', async () => {
  const { dobuCamApi } = await import('../src/api/dobuCam.js');
  apiConfig.baseUrl = '';
  setAuthToken('token-privado');
  let received;
  globalThis.fetch = async (url, options) => {
    received = { url, options };
    return Response.json({ pet_detected: true });
  };
  assert.deepEqual(await dobuCamApi.lerStatus('http://device.example.test/status'), { pet_detected: true });
  assert.equal(received.url, 'http://device.example.test/status');
  assert.equal(received.options.method, 'GET');
  assert.equal(received.options.headers.Authorization, undefined);
  assert.ok(received.options.signal instanceof AbortSignal);
  globalThis.fetch = async () => new Response('detalhe interno', { status: 500 });
  await assert.rejects(dobuCamApi.lerStatus('http://device.example.test/status'), { code: 'HTTP_ERROR', status: 500 });
  await assert.rejects(dobuCamApi.lerStatus('file:///status'), { code: 'REQUEST_ERROR' });
  await assert.rejects(dobuCamApi.lerStatus('http://user:password@device.example.test/status'), { code: 'REQUEST_ERROR' });
});
