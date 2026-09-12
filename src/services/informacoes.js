import { informacoesApi } from '../api/informacoes.js';
import { vacinasApi } from '../api/vacinas.js';
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

export function filtrarRacas(racas, especies, pesquisa) {
  const termos = normalizarTexto(pesquisa).split(/\s+/).filter(Boolean);
  const lista = Array.isArray(racas) ? racas : [];
  const especiesDisponiveis = Array.isArray(especies) ? especies : [];

  return lista
    .map((raca) => {
      const especie = especiesDisponiveis.find((item) => item.id === raca.especieId) || raca.especie;
      return { ...raca, especieNome: especie?.nome || 'Espécie não identificada' };
    })
    .filter((raca) => {
      if (termos.length === 0) return true;
      const texto = normalizarTexto(`${raca.nome} ${raca.especieNome} ${raca.porte} ${raca.descricao} ${raca.cuidados}`);
      return termos.every((termo) => texto.includes(termo));
    });
}

export function resumirRaca(raca) {
  if (!raca) return [];
  return [
    { label: 'Espécie', value: raca.especieNome || raca.especie?.nome || 'Não informada' },
    { label: 'Porte', value: raca.porte || 'Não informado' },
    { label: 'Expectativa de vida', value: raca.expectativaVida ? `${raca.expectativaVida} anos` : 'Não informada' },
  ];
}

export function formatarDataVacina(valor) {
  if (!valor) return 'Não informada';
  const texto = String(valor);
  const data = texto.includes('T') ? texto.slice(0, 10) : texto;
  const partes = data.split('-');
  if (partes.length !== 3) return texto;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function filtrarVacinas(vacinas, pets, pesquisa, petId = '') {
  const termos = normalizarTexto(pesquisa).split(/\s+/).filter(Boolean);
  const petsVisiveis = Array.isArray(pets) ? pets : [];
  const petIds = new Set(petsVisiveis.map((pet) => pet.id));

  return (Array.isArray(vacinas) ? vacinas : [])
    .filter((vacina) => !petId || vacina.petId === petId)
    .filter((vacina) => petIds.has(vacina.petId))
    .map((vacina) => ({
      ...vacina,
      petNome: petsVisiveis.find((pet) => pet.id === vacina.petId)?.nome || vacina.pet?.nome || 'Animal não identificado',
    }))
    .filter((vacina) => {
      if (termos.length === 0) return true;
      const texto = normalizarTexto(`${vacina.nome} ${vacina.petNome} ${formatarDataVacina(vacina.dataAplicacao)} ${formatarDataVacina(vacina.dataProximaDose)}`);
      return termos.every((termo) => texto.includes(termo));
    })
    .sort((a, b) => String(a.dataProximaDose || a.dataAplicacao || '').localeCompare(String(b.dataProximaDose || b.dataAplicacao || '')));
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

export function vacinasQuery(user) {
  return {
    queryKey: [...accountKey(user), 'vacinas'],
    queryFn: () => vacinasApi.listar(),
    enabled: Boolean(user),
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
