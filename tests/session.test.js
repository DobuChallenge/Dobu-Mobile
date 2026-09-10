import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { createSessionController } from '../src/auth/sessionController.js';

const response = () => ({ token: `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.signature`, usuarioId: 'user-id', nome: 'Teste', email: 'teste@example.test', tipoUsuario: 'RESPONSAVEL' });

function setup(apiResponse = response()) {
  let saved = null;
  let token = null;
  const storage = { read: async () => saved, write: async (value) => { saved = value; }, remove: async () => { saved = null; } };
  const api = { login: async () => apiResponse, cadastrar: async () => apiResponse };
  const queryClient = new QueryClient();
  const options = { storage, api, queryClient, setToken: (value) => { token = value; } };
  return { controller: createSessionController(options), options, queryClient, saved: () => saved, token: () => token };
}

test('persiste somente sessão mínima e restaura usuário e token em nova instância', async () => {
  const state = setup({ ...response(), senha: 'nao-persistir', extra: true });
  await state.controller.login({ email: 'teste@example.test', senha: 'nao-persistir' });
  assert.deepEqual(Object.keys(state.saved()).sort(), ['email', 'nome', 'tipoUsuario', 'token', 'usuarioId']);
  assert.equal(state.controller.getUser().id, 'user-id');
  assert.equal(state.controller.getUser().token, undefined);
  const restored = createSessionController(state.options);
  await restored.restore();
  assert.equal(restored.getUser().tipoConta, 'responsavel');
  assert.equal(state.token(), state.saved().token);
});

test('logout remove sessão, token e cache protegido', async () => {
  const state = setup();
  await state.controller.register({});
  state.queryClient.setQueryData(['pets'], ['protegido']);
  await state.controller.logout();
  assert.equal(state.saved(), null);
  assert.equal(state.token(), null);
  assert.equal(state.controller.getUser(), null);
  assert.equal(state.queryClient.getQueryCache().getAll().length, 0);
});

test('sessão expirada é descartada na restauração', async () => {
  const state = setup();
  await state.options.storage.write({ ...response(), token: `e30.${Buffer.from('{"exp":1}').toString('base64url')}.signature` });
  await state.controller.restore();
  assert.equal(state.saved(), null);
  assert.equal(state.controller.getUser(), null);
});

test('falha ao persistir não autentica nem expõe o erro do armazenamento', async () => {
  const state = setup();
  state.options.storage.write = async () => { throw new Error('segredo interno'); };
  await assert.rejects(state.controller.login({}), (error) => error.code === 'SESSION_STORAGE_ERROR' && !error.message.includes('segredo'));
  assert.equal(state.controller.getUser(), null);
  assert.equal(state.token(), null);
});

test('logout impede uma resposta de login pendente de recriar sessão', async () => {
  const state = setup();
  let resolve;
  state.options.api.login = () => new Promise((done) => { resolve = done; });
  const pending = state.controller.login({});
  await state.controller.logout();
  resolve(response());
  await assert.rejects(pending, { code: 'SESSION_CANCELLED' });
  assert.equal(state.saved(), null);
  assert.equal(state.token(), null);
});

test('logout pendente não apaga a persistência de um login posterior', async () => {
  const state = setup();
  let release;
  let calls = 0;
  state.queryClient.cancelQueries = () => ++calls === 1 ? new Promise((resolve) => { release = resolve; }) : Promise.resolve();
  const logout = state.controller.logout();
  const login = state.controller.login({});
  await new Promise((resolve) => setImmediate(resolve));
  release();
  await Promise.all([logout, login]);
  assert.ok(state.saved());
  assert.equal(state.saved().token, state.token());
});
