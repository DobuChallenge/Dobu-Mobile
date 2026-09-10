import { apiConfig } from './config.js';

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export class ApiError extends Error {
  constructor(message, code, status = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

function httpError(status, authenticated) {
  const messages = {
    400: 'Confira os dados informados.',
    401: authenticated ? 'Entre novamente para continuar.' : 'Não foi possível autenticar. Confira suas credenciais.',
    403: 'Você não tem permissão para esta ação.',
    404: 'O registro solicitado não foi encontrado.',
    409: 'Os dados informados entram em conflito com um registro existente.',
    422: 'Confira os dados informados.',
    429: 'Muitas tentativas. Aguarde e tente novamente.',
  };
  return new ApiError(
    messages[status] || 'Não foi possível concluir a solicitação. Tente novamente mais tarde.',
    'HTTP_ERROR',
    status,
  );
}

export async function request(path, { method = 'GET', body, authenticated = true, timeoutMs = 15000 } = {}) {
  let baseUrl;
  try {
    baseUrl = new URL(apiConfig.baseUrl?.trim());
    if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
      throw new Error();
    }
  } catch {
    throw new ApiError('A URL da API não está configurada corretamente.', 'CONFIG_ERROR');
  }

  if (!path.startsWith('/api/') || path.includes('\\') || /(?:^|\/)\.{1,2}(?:\/|$)/.test(path)) {
    throw new ApiError('Não foi possível preparar a solicitação.', 'REQUEST_ERROR');
  }

  return sendJson(`${baseUrl.href.replace(/\/+$/, '')}${path}`, { method, body, authenticated, timeoutMs });
}

export async function requestDeviceJson(url) {
  let deviceUrl;
  try {
    deviceUrl = new URL(url);
    if (!['http:', 'https:'].includes(deviceUrl.protocol) || deviceUrl.username || deviceUrl.password) {
      throw new Error();
    }
  } catch {
    throw new ApiError('Informe uma URL HTTP válida para o dispositivo.', 'REQUEST_ERROR');
  }
  return sendJson(deviceUrl.href, { method: 'GET', authenticated: false, timeoutMs: 15000 });
}

async function sendJson(url, { method, body, authenticated, timeoutMs }) {
  const headers = { Accept: 'application/json' };
  let serializedBody;
  if (body !== undefined) {
    try {
      serializedBody = JSON.stringify(body);
    } catch {
      throw new ApiError('Não foi possível preparar os dados da solicitação.', 'REQUEST_ERROR');
    }
    headers['Content-Type'] = 'application/json';
  }
  if (authenticated && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: serializedBody,
      signal: controller.signal,
    });
    if (!response.ok) throw httpError(response.status, authenticated);
    if (response.status === 204) return undefined;

    const text = await response.text();
    if (!text.trim()) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError('A API retornou uma resposta inválida. Tente novamente.', 'INVALID_RESPONSE', response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('A solicitação demorou demais. Tente novamente.', 'TIMEOUT');
    }
    throw new ApiError('Não foi possível conectar à API. Confira sua conexão e tente novamente.', 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}
