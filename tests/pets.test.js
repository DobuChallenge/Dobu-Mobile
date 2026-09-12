import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPetPayload, validatePet } from '../src/utils/petValidation.js';

const validPet = {
  nome: '  Lua  ',
  idade: '0',
  especieId: 'especie-1',
  racaId: 'raca-1',
  responsavelId: 'responsavel-1',
};

const catalogos = {
  especies: [{ id: 'especie-1', nome: 'Cachorro' }, { id: 'especie-2', nome: 'Gato' }],
  racas: [{ id: 'raca-1', nome: 'Vira-lata', especieId: 'especie-1' }],
  usuarios: [
    { id: 'responsavel-1', nome: 'Ana', tipoUsuario: 'RESPONSAVEL' },
    { id: 'vet-1', nome: 'Bia', tipoUsuario: 'VETERINARIO' },
  ],
};

test('aceita idade zero como inteiro valido', () => {
  assert.equal(validatePet(validPet, catalogos), null);
});

test('rejeita idade vazia, negativa, fracionaria ou textual', () => {
  for (const idade of ['', '-1', '1.5', 'dois']) {
    assert.equal(validatePet({ ...validPet, idade }, catalogos), 'Informe a idade usando um número inteiro igual ou maior que zero.');
  }
});

test('aceita o maior Int32 e rejeita idade acima do limite do backend', () => {
  assert.equal(validatePet({ ...validPet, idade: '2147483647' }, catalogos), null);
  assert.equal(
    validatePet({ ...validPet, idade: '2147483648' }, catalogos),
    'A idade informada excede o limite aceito.',
  );
});

test('rejeita nome curto mesmo quando contem espacos', () => {
  assert.equal(validatePet({ ...validPet, nome: ' L ' }, catalogos), 'Informe um nome com pelo menos 2 caracteres.');
});

test('exige os vinculos de especie, raca e responsavel', () => {
  assert.equal(validatePet({ ...validPet, especieId: '' }, catalogos), 'Selecione a espécie.');
  assert.equal(validatePet({ ...validPet, racaId: '' }, catalogos), 'Selecione a raça.');
  assert.equal(validatePet({ ...validPet, responsavelId: '' }, catalogos), 'Selecione o responsável.');
});

test('rejeita raca removida do catalogo ou vinculada a outra especie', () => {
  assert.equal(validatePet({ ...validPet, racaId: 'raca-removida' }, catalogos), 'Selecione uma raça disponível.');
  assert.equal(
    validatePet({ ...validPet, especieId: 'especie-2' }, catalogos),
    'A raça selecionada não pertence à espécie.',
  );
});

test('rejeita responsavel removido ou usuario sem perfil RESPONSAVEL', () => {
  assert.equal(validatePet({ ...validPet, responsavelId: 'removido' }, catalogos), 'Selecione uma conta responsável válida.');
  assert.equal(validatePet({ ...validPet, responsavelId: 'vet-1' }, catalogos), 'Selecione uma conta responsável válida.');
});

test('monta somente os campos aceitos pelo backend e normaliza os valores', () => {
  assert.deepEqual(buildPetPayload({ ...validPet, especieId: 'especie-1', foto: 'local' }), {
    nome: 'Lua',
    idade: 0,
    racaId: 'raca-1',
    responsavelId: 'responsavel-1',
  });
});
