import AsyncStorage from '@react-native-async-storage/async-storage';
import { session } from '../auth/session';
import { usuariosApi } from '../api/usuarios';
import { CHAVES } from './chaves';

async function obterJSON(chave, valorPadrao) {
  try {
    const valor = await AsyncStorage.getItem(chave);
    return valor ? JSON.parse(valor) : valorPadrao;
  } catch (error) {
    console.log(error);
    return valorPadrao;
  }
}

async function salvarJSON(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function obterUsuario() {
  return session.getUser();
}

export async function obterUsuarios() {
  const usuarios = await usuariosApi.listar();
  return usuarios.map(({ id, nome, email, tipoUsuario }) => ({
    id, nome, email, tipoConta: tipoUsuario.toLowerCase(),
  }));
}

export async function obterPets() {
  return obterJSON(CHAVES.PETS, []);
}

export async function salvarPet(pet) {
  const pets = await obterPets();
  const usuarioAtual = await obterUsuario();
  const novoPet = { ...pet, responsavelId: usuarioAtual?.id || null, id: Date.now().toString() };
  await salvarJSON(CHAVES.PETS, [...pets, novoPet]);
  return novoPet;
}

export async function excluirPet(petId) {
  const usuarioAtual = await obterUsuario();
  const pets = await obterPets();
  const petEncontrado = pets.find((pet) => pet.id === petId);

  if (!petEncontrado) return;
  if (
    usuarioAtual?.tipoConta !== 'veterinario' &&
    petEncontrado.responsavelId &&
    petEncontrado.responsavelId !== usuarioAtual?.id
  ) {
    return;
  }

  const agendamentos = await obterAgendamentos();
  const nomePet = (petEncontrado.nome || '').trim().toLowerCase();

  await Promise.all([
    salvarJSON(CHAVES.PETS, pets.filter((pet) => pet.id !== petId)),
    salvarJSON(
      CHAVES.AGENDAMENTOS,
      agendamentos.filter((agendamento) => {
        const mesmoPetId = agendamento.petId === petId;
        const mesmoPetLegado =
          !agendamento.petId &&
          (agendamento.pet || '').trim().toLowerCase() === nomePet &&
          agendamento.responsavelId === petEncontrado.responsavelId;

        return !mesmoPetId && !mesmoPetLegado;
      })
    ),
  ]);
}

export async function obterAgendamentos() {
  return obterJSON(CHAVES.AGENDAMENTOS, []);
}

export async function salvarAgendamento(agendamento) {
  const agendamentos = await obterAgendamentos();
  const novoAgendamento = { ...agendamento, id: Date.now().toString() };
  await salvarJSON(CHAVES.AGENDAMENTOS, [...agendamentos, novoAgendamento]);
  return novoAgendamento;
}

export async function excluirAgendamento(agendamentoId) {
  const agendamentos = await obterAgendamentos();
  await salvarJSON(
    CHAVES.AGENDAMENTOS,
    agendamentos.filter((agendamento) => agendamento.id !== agendamentoId)
  );
}

export async function obterMonitoramento() {
  return obterJSON(CHAVES.MONITORAMENTO, null);
}

export async function salvarMonitoramento(monitoramento) {
  const leitura = {
    ...monitoramento,
    atualizadoEm: new Date().toISOString(),
  };
  await salvarJSON(CHAVES.MONITORAMENTO, leitura);
  return leitura;
}

export async function obterPontos() {
  const usuarioAtual = await obterUsuario();
  const pontos = await obterJSON(CHAVES.PONTOS, {});

  if (!usuarioAtual?.id) return 0;

  if (typeof pontos === 'number') {
    await salvarJSON(CHAVES.PONTOS, { [usuarioAtual.id]: pontos });
    return pontos;
  }

  return pontos[usuarioAtual.id] || 0;
}

export async function adicionarPontos(quantidade) {
  const usuarioAtual = await obterUsuario();
  if (!usuarioAtual?.id) return 0;

  const pontosSalvos = await obterJSON(CHAVES.PONTOS, {});
  const pontosPorUsuario =
    typeof pontosSalvos === 'number'
      ? { [usuarioAtual.id]: pontosSalvos }
      : pontosSalvos;
  const pontosAtuais = await obterPontos();
  const total = pontosAtuais + quantidade;
  await salvarJSON(CHAVES.PONTOS, {
    ...pontosPorUsuario,
    [usuarioAtual.id]: total,
  });
  return total;
}

export async function limparDadosDobu() {
  await session.logout();
  await AsyncStorage.multiRemove([
    CHAVES.USUARIO,
    CHAVES.USUARIOS,
    CHAVES.PETS,
    CHAVES.AGENDAMENTOS,
    CHAVES.MONITORAMENTO,
    CHAVES.PONTOS,
  ]);
}
