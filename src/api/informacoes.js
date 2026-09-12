import { request } from './httpClient.js';

function informacaoBody({ titulo, descricao, petId }) {
  return {
    titulo: String(titulo || '').trim(),
    descricao: String(descricao || '').trim(),
    petId,
  };
}

export const informacoesApi = {
  listarPorPet: (petId) => request(`/api/informacoes-cuidado/pet/${encodeURIComponent(petId)}`),
  criar: (dados) => request('/api/informacoes-cuidado', { method: 'POST', body: informacaoBody(dados) }),
  excluir: (id) => request(`/api/informacoes-cuidado/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
