import AsyncStorage from '@react-native-async-storage/async-storage';
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
  return obterJSON(CHAVES.USUARIO, null);
}

export async function obterUsuarios() {
  const usuarios = await obterJSON(CHAVES.USUARIOS, []);
  if (usuarios.length > 0) return usuarios;

  const usuarioAtual = await obterUsuario();
  return usuarioAtual ? [usuarioAtual] : [];
}

export async function obterUsuarioPorEmail(email) {
  const emailTratado = email.trim().toLowerCase();
  const usuarios = await obterUsuarios();
  return usuarios.find((usuario) => usuario.email === emailTratado) || null;
}

export async function obterUsuarioPorCpf(cpf) {
  const cpfTratado = cpf.replace(/\D/g, '');
  const usuarios = await obterUsuarios();
  return usuarios.find((usuario) => (usuario.cpf || '').replace(/\D/g, '') === cpfTratado) || null;
}

export async function definirUsuarioAtual(usuario) {
  await salvarJSON(CHAVES.USUARIO, usuario);
}

export async function salvarUsuario(usuario) {
  const usuarios = await obterUsuarios();
  const cpfTratado = (usuario.cpf || '').replace(/\D/g, '');
  const emailDuplicado = usuarios.some(
    (item) => item.email === usuario.email && item.id !== usuario.id
  );
  const cpfDuplicado = usuarios.some(
    (item) => (item.cpf || '').replace(/\D/g, '') === cpfTratado && item.id !== usuario.id
  );

  if (emailDuplicado) {
    const erro = new Error('EMAIL_DUPLICADO');
    erro.code = 'EMAIL_DUPLICADO';
    throw erro;
  }

  if (cpfDuplicado) {
    const erro = new Error('CPF_DUPLICADO');
    erro.code = 'CPF_DUPLICADO';
    throw erro;
  }

  const indiceExistente = usuarios.findIndex((item) => item.id === usuario.id);
  const usuariosAtualizados =
    indiceExistente >= 0
      ? usuarios.map((item) => (item.id === usuario.id ? usuario : item))
      : [...usuarios, usuario];

  await salvarJSON(CHAVES.USUARIOS, usuariosAtualizados);
  await salvarJSON(CHAVES.USUARIO, usuario);
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

export async function excluirContaAtual() {
  const usuarioAtual = await obterUsuario();
  if (!usuarioAtual?.id) return;

  const [usuarios, pontosSalvos, pets, agendamentos] = await Promise.all([
    obterJSON(CHAVES.USUARIOS, []),
    obterJSON(CHAVES.PONTOS, {}),
    obterJSON(CHAVES.PETS, []),
    obterJSON(CHAVES.AGENDAMENTOS, []),
  ]);

  const usuariosAtualizados = usuarios.filter((usuario) => usuario.id !== usuarioAtual.id);
  const petsDoUsuario = pets.filter((pet) => pet.responsavelId === usuarioAtual.id);
  const idsPetsDoUsuario = new Set(petsDoUsuario.map((pet) => pet.id));
  const nomesPetsDoUsuario = new Set(
    petsDoUsuario.map((pet) => (pet.nome || '').trim().toLowerCase())
  );
  const ehVeterinario = usuarioAtual.tipoConta === 'veterinario';
  const nomeUsuario = (usuarioAtual.nome || '').trim().toLowerCase();

  const petsAtualizados = ehVeterinario
    ? pets
    : pets.filter((pet) => pet.responsavelId !== usuarioAtual.id);
  const agendamentosAtualizados = agendamentos.filter((agendamento) => {
    if (ehVeterinario) {
      const mesmoVeterinario =
        agendamento.veterinarioId === usuarioAtual.id ||
        (agendamento.veterinario || '').trim().toLowerCase() === nomeUsuario;

      return !mesmoVeterinario;
    }

    const mesmoResponsavel = agendamento.responsavelId === usuarioAtual.id;
    const mesmoPetId = idsPetsDoUsuario.has(agendamento.petId);
    const mesmoPetLegado =
      !agendamento.petId &&
      nomesPetsDoUsuario.has((agendamento.pet || '').trim().toLowerCase());

    return !mesmoResponsavel && !mesmoPetId && !mesmoPetLegado;
  });
  const pontosPorUsuario =
    typeof pontosSalvos === 'number'
      ? {}
      : { ...pontosSalvos };

  delete pontosPorUsuario[usuarioAtual.id];

  await Promise.all([
    salvarJSON(CHAVES.USUARIOS, usuariosAtualizados),
    salvarJSON(CHAVES.PETS, petsAtualizados),
    salvarJSON(CHAVES.AGENDAMENTOS, agendamentosAtualizados),
    salvarJSON(CHAVES.PONTOS, pontosPorUsuario),
    AsyncStorage.removeItem(CHAVES.USUARIO),
  ]);
}

export async function limparDadosDobu() {
  await AsyncStorage.multiRemove([
    CHAVES.USUARIO,
    CHAVES.USUARIOS,
    CHAVES.PETS,
    CHAVES.AGENDAMENTOS,
    CHAVES.MONITORAMENTO,
    CHAVES.PONTOS,
  ]);
}
