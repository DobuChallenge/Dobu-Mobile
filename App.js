import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QueryProvider from './src/providers/QueryProvider';
import AuthProvider from './src/providers/AuthProvider';

import AdicionarAgendamento from './src/screens/AdicionarAgendamento';
import Agendamentos from './src/screens/Agendamentos';
import Cadastro from './src/screens/Cadastro';
import CadastroPet from './src/screens/CadastroPet';
import Carregamento from './src/screens/Carregamento';
import DobuCam from './src/screens/DobuCam';
import Inicio from './src/screens/Inicio';
import Inicial from './src/screens/Inicial';
import Informacoes from './src/screens/Informacoes';
import Lembretes from './src/screens/Lembretes';
import ListaPets from './src/screens/ListaPets';
import Login from './src/screens/Login';
import PerfilVeterinario from './src/screens/PerfilVeterinario';
import PerfilPet from './src/screens/PerfilPet';
import PerfilUsuario from './src/screens/PerfilUsuario';
import { cores } from './src/styles/tema';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor={cores.fundo} />
            <Stack.Navigator
              initialRouteName="Carregamento"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: cores.fundo },
              }}
            >
              <Stack.Screen name="Carregamento" component={Carregamento} />
              <Stack.Screen name="Inicial" component={Inicial} />
              <Stack.Screen name="Cadastro" component={Cadastro} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Inicio" component={Inicio} />
              <Stack.Screen name="PerfilVeterinario" component={PerfilVeterinario} />
              <Stack.Screen name="PerfilUsuario" component={PerfilUsuario} />
              <Stack.Screen name="CadastroPet" component={CadastroPet} />
              <Stack.Screen name="DobuCam" component={DobuCam} />
              <Stack.Screen name="ListaPets" component={ListaPets} />
              <Stack.Screen name="PerfilPet" component={PerfilPet} />
              <Stack.Screen name="Lembretes" component={Lembretes} />
              <Stack.Screen name="Informacoes" component={Informacoes} />
              <Stack.Screen name="Agendamentos" component={Agendamentos} />
              <Stack.Screen name="AdicionarAgendamento" component={AdicionarAgendamento} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
