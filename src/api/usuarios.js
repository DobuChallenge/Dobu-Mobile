import { request } from './httpClient.js';

export const usuariosApi = {
  listar: () => request('/api/usuarios'),
};
