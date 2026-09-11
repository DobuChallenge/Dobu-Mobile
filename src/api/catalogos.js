import { request } from './httpClient.js';

export const catalogosApi = {
  racas: () => request('/api/racas'),
  especies: () => request('/api/especies'),
};
