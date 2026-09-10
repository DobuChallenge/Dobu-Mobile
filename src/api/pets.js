import { request } from './httpClient.js';

function petBody({ nome, idade, racaId, responsavelId }) {
  return { nome, idade, racaId, responsavelId };
}

export const petsApi = {
  listar: () => request('/api/pets'),
  obter: (id) => request(`/api/pets/${encodeURIComponent(id)}`),
  listarPorResponsavel: (responsavelId) => request(`/api/pets/responsavel/${encodeURIComponent(responsavelId)}`),
  listarPorRaca: (racaId) => request(`/api/pets/raca/${encodeURIComponent(racaId)}`),
  buscarPorNome: (nome) => request(`/api/pets/nome/${encodeURIComponent(nome)}`),
  criar: (dados) => request('/api/pets', { method: 'POST', body: petBody(dados) }),
  atualizar: (id, dados) => request(`/api/pets/${encodeURIComponent(id)}`, { method: 'PUT', body: petBody(dados) }),
  excluir: (id) => request(`/api/pets/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
