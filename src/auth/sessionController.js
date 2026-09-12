import { ApiError } from '../api/httpClient.js';

function normalizeSession(value) {
  if (!value || !['token', 'usuarioId', 'nome', 'email', 'tipoUsuario'].every((key) => typeof value[key] === 'string' && value[key])) {
    throw new ApiError('A sessão recebida é inválida. Entre novamente.', 'INVALID_SESSION');
  }
  if (!['RESPONSAVEL', 'VETERINARIO'].includes(value.tipoUsuario)) {
    throw new ApiError('O perfil recebido não é suportado.', 'INVALID_SESSION');
  }
  try {
    const part = value.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')));
    if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) throw new Error();
  } catch {
    throw new ApiError('Sua sessão expirou. Entre novamente.', 'INVALID_SESSION');
  }
  return { token: value.token, usuarioId: value.usuarioId, nome: value.nome, email: value.email, tipoUsuario: value.tipoUsuario };
}

export function createSessionController({ storage, api, queryClient, setToken, profileExtrasStorage = { save: async () => {} } }) {
  let user = null;
  let generation = 0;
  let writes = Promise.resolve();
  const listeners = new Set();
  const publish = (value) => {
    user = value;
    listeners.forEach((listener) => listener());
  };
  const serialized = (operation) => {
    const result = writes.then(operation);
    writes = result.catch(() => {});
    return result;
  };
  const persist = async (operation) => {
    try { return await operation(); }
    catch { throw new ApiError('Não foi possível acessar o armazenamento seguro. Tente novamente.', 'SESSION_STORAGE_ERROR'); }
  };
  const activate = (session, profileExtras) => {
    setToken(session.token);
    publish({
      id: session.usuarioId,
      nome: session.nome,
      email: session.email,
      tipoConta: session.tipoUsuario.toLowerCase(),
      ...(profileExtras ? { profileExtras } : {}),
    });
    return user;
  };
  const authenticate = async (operation, credentials) => {
    const attempt = ++generation;
    const session = normalizeSession(await operation(credentials));
    return serialized(async () => {
      if (attempt !== generation) throw new ApiError('A autenticação foi cancelada.', 'SESSION_CANCELLED');
      await persist(() => storage.write(session));
      let profileExtras = null;
      if (credentials?.profileExtras) {
        profileExtras = { ...credentials.profileExtras, tipoConta: session.tipoUsuario.toLowerCase() };
        await profileExtrasStorage.save(
          { id: session.usuarioId, email: session.email },
          profileExtras,
        );
      }
      if (attempt !== generation) {
        await persist(() => storage.remove());
        throw new ApiError('A autenticação foi cancelada.', 'SESSION_CANCELLED');
      }
      await queryClient.cancelQueries();
      queryClient.clear();
      if (attempt !== generation) throw new ApiError('A autenticação foi cancelada.', 'SESSION_CANCELLED');
      return activate(session, profileExtras);
    });
  };

  return {
    getUser: () => user,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    login: (credentials) => authenticate(api.login, credentials),
    register: (credentials) => authenticate(api.cadastrar, credentials),
    restore: () => {
      const attempt = generation;
      return serialized(async () => {
        const saved = await persist(() => storage.read());
        if (attempt !== generation || !saved) return;
        let session;
        try { session = normalizeSession(saved); }
        catch {
          await persist(() => storage.remove());
          setToken(null);
          publish(null);
          return;
        }
        activate(session);
      });
    },
    logout: async () => {
      generation += 1;
      setToken(null);
      publish(null);
      const cancellation = queryClient.cancelQueries();
      return serialized(async () => {
        await cancellation;
        queryClient.clear();
        await persist(() => storage.remove());
      });
    },
    updateUser: (changes) => serialized(async () => {
      const saved = await persist(() => storage.read());
      if (!saved || !user) return user;
      const nextSession = {
        ...saved,
        nome: changes.nome || saved.nome,
        email: changes.email || saved.email,
        tipoUsuario: changes.tipoUsuario || saved.tipoUsuario,
      };
      await persist(() => storage.write(nextSession));
      const nextProfileExtras = changes.profileExtras || user.profileExtras;
      publish({
        id: nextSession.usuarioId,
        nome: nextSession.nome,
        email: nextSession.email,
        tipoConta: nextSession.tipoUsuario.toLowerCase(),
        ...(nextProfileExtras ? { profileExtras: nextProfileExtras } : {}),
      });
      return user;
    }),
  };
}
