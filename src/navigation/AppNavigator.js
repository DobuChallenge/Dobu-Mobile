import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { cores } from '../styles/tema';
import { getNavigationConfig } from './routeConfig';
import AdicionarAgendamento from '../screens/AdicionarAgendamento';
import Agendamentos from '../screens/Agendamentos';
import Cadastro from '../screens/Cadastro';
import CadastroPet from '../screens/CadastroPet';
import Carregamento from '../screens/Carregamento';
import DobuCam from '../screens/DobuCam';
import Inicio from '../screens/Inicio';
import Inicial from '../screens/Inicial';
import Informacoes from '../screens/Informacoes';
import Lembretes from '../screens/Lembretes';
import ListaPets from '../screens/ListaPets';
import Login from '../screens/Login';
import PerfilVeterinario from '../screens/PerfilVeterinario';
import PerfilPet from '../screens/PerfilPet';
import PerfilUsuario from '../screens/PerfilUsuario';

const Stack = createNativeStackNavigator();
const screens = {
  Carregamento, Inicial, Login, Cadastro,
  Inicio, PerfilVeterinario, PerfilUsuario, CadastroPet, DobuCam,
  ListaPets, PerfilPet, Lembretes, Informacoes, Agendamentos, AdicionarAgendamento,
};

export default function AppNavigator() {
  const config = getNavigationConfig(useAuth());
  return (
    <Stack.Navigator
      key={config.key}
      initialRouteName={config.initialRouteName}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}
    >
      <Stack.Group navigationKey={config.key}>
        {config.routeNames.map((name) => (
          <Stack.Screen key={name} name={name} component={screens[name]} />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
}
