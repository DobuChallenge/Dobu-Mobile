import { request } from './httpClient.js';

export const usuariosApi = {
  listar: () => request('/api/usuarios'),
  obter: (id) => request(`/api/usuarios/${encodeURIComponent(id)}`),
  atualizar: (id, dados) => request(`/api/usuarios/${encodeURIComponent(id)}`, { method: 'PUT', body: dados }),
  excluir: (id) => request(`/api/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
