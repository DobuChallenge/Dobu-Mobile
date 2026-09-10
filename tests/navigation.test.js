import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CommonActions, StackRouter } from '@react-navigation/routers';
import { getNavigationConfig } from '../src/navigation/routeConfig.js';

function setup(auth) {
  const config = getNavigationConfig(auth);
  const router = StackRouter({ initialRouteName: config.initialRouteName });
  const options = { routeNames: config.routeNames, routeParamList: {}, routeGetIdList: {} };
  return { config, router, options, state: router.getInitialState(options) };
}

test('restauração e falha de restauração expõem apenas carregamento', () => {
  for (const auth of [{ restoring: true, user: null }, { restoring: true, user: { id: 'a' } }, { restoreError: 'erro', user: null }]) {
    const { config, state } = setup(auth);
    assert.deepEqual(config.routeNames, ['Carregamento']);
    assert.equal(state.routes[0].name, 'Carregamento');
  }
});

test('visitante não consegue navegar ou resetar para uma rota protegida', () => {
  const { router, state, options } = setup({ user: null });
  assert.equal(state.routes[0].name, 'Inicial');
  for (const name of ['Inicio', 'PerfilUsuario', 'PerfilVeterinario', 'CadastroPet', 'ListaPets', 'PerfilPet', 'DobuCam', 'Agendamentos', 'AdicionarAgendamento', 'Lembretes', 'Informacoes']) {
    assert.equal(router.getStateForAction(state, CommonActions.navigate(name), options), null);
    assert.equal(router.getStateForAction(state, CommonActions.reset({ index: 0, routes: [{ name }] }), options), null);
  }
});

test('sessão seleciona o painel do perfil e descarta acesso ao login', () => {
  for (const [tipoConta, expected] of [['responsavel', 'Inicio'], ['veterinario', 'PerfilVeterinario']]) {
    const { router, state, options } = setup({ user: { id: 'a', tipoConta } });
    assert.equal(state.routes[0].name, expected);
    assert.equal(router.getStateForAction(state, CommonActions.navigate('Login'), options), null);
  }
});

test('logout e troca de conta usam identidades distintas e não recuperam histórico protegido', () => {
  const first = setup({ user: { id: 'a', tipoConta: 'responsavel' } });
  const second = setup({ user: { id: 'b', tipoConta: 'responsavel' } });
  const loggedOut = setup({ user: null });
  assert.notEqual(first.config.key, second.config.key);
  assert.notEqual(first.config.key, loggedOut.config.key);
  const restoredHistory = loggedOut.router.getRehydratedState({ stale: true, routes: [{ name: 'PerfilPet', params: { pet: { id: 'privado' } } }] }, loggedOut.options);
  assert.deepEqual(restoredHistory.routes.map((route) => route.name), ['Inicial']);
  assert.equal(loggedOut.router.getStateForAction(restoredHistory, CommonActions.goBack(), loggedOut.options), null);
});
