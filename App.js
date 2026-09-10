import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QueryProvider from './src/providers/QueryProvider';
import AuthProvider from './src/providers/AuthProvider';

import AppNavigator from './src/navigation/AppNavigator';
import { cores } from './src/styles/tema';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor={cores.fundo} />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
