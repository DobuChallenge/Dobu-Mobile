import { request } from './httpClient.js';

export const authApi = {
  login({ email, senha }) {
    return request('/api/auth/login', {
      method: 'POST', authenticated: false, body: { email, senha },
    });
  },
  cadastrar({ nome, email, senha, tipoUsuario }) {
    return request('/api/auth/register', {
      method: 'POST', authenticated: false, body: { nome, email, senha, tipoUsuario },
    });
  },
};
