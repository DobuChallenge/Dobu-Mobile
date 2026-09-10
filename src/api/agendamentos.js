import { request } from './httpClient.js';

function agendamentoBody({ dataAgendamento, status, petId, veterinarioId }) {
  return { dataAgendamento, status, petId, veterinarioId };
}

export const agendamentosApi = {
  listar: () => request('/api/agendamentos'),
  obter: (id) => request(`/api/agendamentos/${encodeURIComponent(id)}`),
  listarPorPet: (petId) => request(`/api/agendamentos/pet/${encodeURIComponent(petId)}`),
  listarPorVeterinario: (veterinarioId) => request(`/api/agendamentos/veterinario/${encodeURIComponent(veterinarioId)}`),
  listarPorStatus: (status) => request(`/api/agendamentos/status/${encodeURIComponent(status)}`),
  criar: (dados) => request('/api/agendamentos', { method: 'POST', body: agendamentoBody(dados) }),
  atualizar: (id, dados) => request(`/api/agendamentos/${encodeURIComponent(id)}`, { method: 'PUT', body: agendamentoBody(dados) }),
  excluir: (id) => request(`/api/agendamentos/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
