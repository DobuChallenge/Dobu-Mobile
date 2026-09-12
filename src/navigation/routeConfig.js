const publicRoutes = ['Inicial', 'Login', 'Cadastro'];
const protectedRoutes = [
  'Inicio',
  'PerfilVeterinario',
  'PerfilUsuario',
  'EditarPerfil',
  'CadastroPet',
  'DobuCam',
  'ListaPets',
  'PerfilPet',
  'Lembretes',
  'Informacoes',
  'Agendamentos',
  'AdicionarAgendamento',
];

export function getNavigationConfig({ user, restoring, restoreError }) {
  if (restoring || restoreError) {
    return { key: 'restoring', initialRouteName: 'Carregamento', routeNames: ['Carregamento'] };
  }
  if (!user) {
    return { key: 'public', initialRouteName: 'Inicial', routeNames: publicRoutes };
  }
  return {
    key: `authenticated:${user.id}:${user.tipoConta}`,
    initialRouteName: user.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio',
    routeNames: protectedRoutes,
  };
}
