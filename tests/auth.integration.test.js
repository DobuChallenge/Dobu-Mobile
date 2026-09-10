import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { authApi } from '../src/api/auth.js';
import { usuariosApi } from '../src/api/usuarios.js';
import { request, setAuthToken } from '../src/api/httpClient.js';
import { createSessionController } from '../src/auth/sessionController.js';

test('backend real: cadastro, login, senha incorreta, restauração e logout', { skip: !process.env.EXPO_PUBLIC_API_URL }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dobu-session-'));
  const file = join(directory, 'session.json');
  const storage = {
    read: async () => { try { return JSON.parse(await readFile(file, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } },
    write: async (value) => writeFile(file, JSON.stringify(value), { mode: 0o600 }),
    remove: async () => rm(file, { force: true }),
  };
  const queryClient = new QueryClient();
  const options = { storage, api: authApi, queryClient, setToken: setAuthToken };
  const session = createSessionController(options);
  const email = `validation-${randomUUID()}@example.test`;
  const senha = randomBytes(24).toString('base64url');
  let usuarioId;
  try {
    const user = await session.register({ nome: 'Validação de autenticação', email, senha, tipoUsuario: 'RESPONSAVEL' });
    usuarioId = user.id;
    assert.equal(user.email, email);
    assert.equal(user.tipoConta, 'responsavel');
    const users = await usuariosApi.listar();
    assert.ok(users.some((item) => item.id === usuarioId));
    assert.ok(users.every((item) => item.senha === undefined));
    assert.ok(Array.isArray(await request('/api/pets')));
    await session.logout();
    await assert.rejects(request('/api/pets'), { status: 401 });
    await assert.rejects(session.login({ email, senha: randomBytes(24).toString('base64url') }), { status: 401 });
    assert.equal(session.getUser(), null);
    const login = await session.login({ email, senha });
    assert.equal(login.id, usuarioId);
    const stored = await storage.read();
    assert.equal(stored.senha, undefined);
    assert.deepEqual(Object.keys(stored).sort(), ['email', 'nome', 'tipoUsuario', 'token', 'usuarioId']);
    setAuthToken(null);
    const reopened = createSessionController(options);
    await reopened.restore();
    assert.equal(reopened.getUser().id, usuarioId);
    assert.ok(Array.isArray(await request('/api/pets')));
    queryClient.setQueryData(['private'], { id: usuarioId });
    await request(`/api/usuarios/${encodeURIComponent(usuarioId)}`, { method: 'DELETE' });
    usuarioId = null;
    await reopened.logout();
    assert.equal(await storage.read(), null);
    assert.equal(queryClient.getQueryCache().getAll().length, 0);
    await assert.rejects(request('/api/pets'), { status: 401 });
  } finally {
    if (usuarioId) {
      try {
        await session.login({ email, senha });
        await request(`/api/usuarios/${encodeURIComponent(usuarioId)}`, { method: 'DELETE' });
      } catch {}
    }
    setAuthToken(null);
    queryClient.clear();
    await rm(file, { force: true });
    await rmdir(directory);
  }
});
