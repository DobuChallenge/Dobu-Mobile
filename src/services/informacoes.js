import { informacoesApi } from '../api/informacoes.js';
import { accountKey } from './queries.js';

export function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filtrarInformacoes(informacoes, pesquisa) {
  const termos = normalizarTexto(pesquisa).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return Array.isArray(informacoes) ? informacoes : [];

  return (Array.isArray(informacoes) ? informacoes : []).filter((item) => {
    const texto = normalizarTexto(`${item?.titulo || ''} ${item?.descricao || ''}`);
    return termos.every((termo) => texto.includes(termo));
  });
}

export function validarInformacao({ titulo, descricao, petId } = {}) {
  const dados = {
    titulo: String(titulo || '').trim(),
    descricao: String(descricao || '').trim(),
    petId: String(petId || '').trim(),
  };
  const erros = {};

  if (dados.titulo.length < 2) erros.titulo = 'Informe um título com pelo menos 2 caracteres.';
  if (dados.descricao.length < 5) erros.descricao = 'Informe uma descrição com pelo menos 5 caracteres.';
  if (!dados.petId) erros.petId = 'Selecione um animal.';

  return { valida: Object.keys(erros).length === 0, dados, erros };
}

export function criarControleSubmissao() {
  let emAndamento = false;
  return {
    async executar(acao) {
      if (emAndamento) return false;
      emAndamento = true;
      try {
        return await acao();
      } finally {
        emAndamento = false;
      }
    },
  };
}

export function criarGuardaRascunho(contextoInicial) {
  let contextoAtual = contextoInicial;
  return {
    atualizar(contexto) {
      contextoAtual = contexto;
    },
    pertence(contexto) {
      return contextoAtual === contexto;
    },
  };
}

export function selecionarPetDisponivel(pets, selecionadoId, solicitadoId) {
  const disponiveis = Array.isArray(pets) ? pets : [];
  if (disponiveis.some((pet) => pet.id === selecionadoId)) return selecionadoId;
  if (disponiveis.some((pet) => pet.id === solicitadoId)) return solicitadoId;
  return disponiveis[0]?.id || '';
}

export function cuidadoDaRaca(pet, catalogos) {
  if (!pet) return null;
  const racas = Array.isArray(catalogos?.racas) ? catalogos.racas : [];
  const raca = racas.find((item) => item.id === pet.racaId) || pet.raca;
  if (!raca) return null;

  const texto = String(raca.cuidados || '').trim() || String(raca.descricao || '').trim();
  return texto ? { nome: raca.nome || 'Raça', texto } : null;
}

export function informacoesQuery(user, petId) {
  return {
    queryKey: [...accountKey(user), 'informacoes', petId],
    queryFn: () => informacoesApi.listarPorPet(petId),
    enabled: Boolean(user && petId),
    retry: false,
    staleTime: 30000,
  };
}

export function informacaoMutationOptions(client, user, action) {
  return {
    mutationFn: action === 'excluir'
      ? ({ id }) => informacoesApi.excluir(id)
      : (dados) => informacoesApi.criar(dados),
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: [...accountKey(user), 'informacoes'] }),
  };
}
