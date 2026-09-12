import { request } from './httpClient.js';

export const catalogosApi = {
  racas: () => request('/api/racas'),
  especies: () => request('/api/especies'),
  criarEspecie: (dados) => request('/api/especies', { method: 'POST', body: dados }),
  criarRaca: (dados) => request('/api/racas', { method: 'POST', body: dados }),
};
