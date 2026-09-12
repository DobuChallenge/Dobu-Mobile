import { request } from './httpClient.js';

function vacinaBody({ nome, dataAplicacao, dataProximaDose, petId }) {
  return { nome, dataAplicacao, dataProximaDose: dataProximaDose || null, petId };
}

export const vacinasApi = {
  listar: () => request('/api/vacinas'),
  listarPorPet: (petId) => request(`/api/vacinas/pet/${encodeURIComponent(petId)}`),
  criar: (dados) => request('/api/vacinas', { method: 'POST', body: vacinaBody(dados) }),
  atualizar: (id, dados) => request(`/api/vacinas/${encodeURIComponent(id)}`, { method: 'PUT', body: vacinaBody(dados) }),
  excluir: (id) => request(`/api/vacinas/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
