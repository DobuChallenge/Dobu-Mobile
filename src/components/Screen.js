import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { estilos } from '../styles/globalStyles';
import Header from './Header';
import DobuLogo from './DobuLogo';
import BottomNavigation from './BottomNavigation';

export default function Screen({ navigation, title, subtitle, active, children }) {
  const { user } = useAuth();
  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <View style={estilos.topoLogo}><DobuLogo small /></View>
          <Header navigation={navigation} title={title} subtitle={subtitle} />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavigation navigation={navigation} active={active} homeRoute={user?.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio'} />
    </SafeAreaView>
  );
}
