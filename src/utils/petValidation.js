const INTEGER_AGE = /^\d+$/;
const INT32_MAX = 2147483647;

export function validatePet({ nome, idade, especieId, racaId, responsavelId }, catalogos) {
  if (String(nome || '').trim().length < 2) return 'Informe um nome com pelo menos 2 caracteres.';

  const ageText = String(idade ?? '').trim();
  if (!INTEGER_AGE.test(ageText) || !Number.isSafeInteger(Number(ageText))) {
    return 'Informe a idade usando um número inteiro igual ou maior que zero.';
  }
  if (Number(ageText) > INT32_MAX) return 'A idade informada excede o limite aceito.';

  if (!especieId) return 'Selecione a espécie.';
  if (!(catalogos?.especies || []).some((item) => item.id === especieId)) return 'Selecione uma espécie disponível.';
  if (!racaId) return 'Selecione a raça.';
  const breed = (catalogos?.racas || []).find((item) => item.id === racaId);
  if (!breed) return 'Selecione uma raça disponível.';
  if (breed.especieId !== especieId) return 'A raça selecionada não pertence à espécie.';
  if (!responsavelId) return 'Selecione o responsável.';
  const owner = (catalogos?.usuarios || []).find((item) => item.id === responsavelId);
  if (!owner || String(owner.tipoUsuario).toUpperCase() !== 'RESPONSAVEL') {
    return 'Selecione uma conta responsável válida.';
  }
  return null;
}

export function buildPetPayload({ nome, idade, racaId, responsavelId }) {
  return {
    nome: String(nome).trim(),
    idade: Number(String(idade).trim()),
    racaId,
    responsavelId,
  };
}
