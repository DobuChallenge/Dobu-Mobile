import { Alert, Text, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import QueryState from '../components/QueryState';
import { useDashboard } from '../hooks/useDashboard';
import { ui } from '../styles/ui';

export default function PerfilUsuario({ navigation }) {
  const { user, logout, query, animals, appointments } = useDashboard();
  const sair = async () => {
    try { await logout(); }
    catch { Alert.alert('Não foi possível remover a sessão salva', 'Tente sair novamente.', [{ text: 'Tentar novamente', onPress: sair }]); }
  };
  return <Screen navigation={navigation} title="Meu perfil" subtitle="Sua conta e sua rotina no Dobu" active="perfil">
    <Card>
      <Text style={ui.title}>{user.nome}</Text>
      <Text style={ui.body}>{user.email}</Text>
      <Text style={ui.badge}>{user.tipoConta === 'veterinario' ? 'Veterinário' : 'Responsável'}</Text>
      <QueryState query={query}>
        <Text style={ui.body}>{animals.length} {user.tipoConta === 'veterinario' ? 'paciente(s) na agenda' : 'animal(is) cadastrado(s)'}</Text>
        <Text style={ui.body}>{appointments.length} agendamento(s)</Text>
      </QueryState>
    </Card>
    <View style={ui.actions}>
      <Button title="Ver animais" icon="paw-outline" onPress={() => navigation.navigate('ListaPets')} />
      <Button title="Ver agendamentos" cor="cinzaEscuro" onPress={() => navigation.navigate('Agendamentos')} />
      <Button title="Sair da conta" icon="log-out-outline" cor="vermelho" onPress={sair} />
    </View>
  </Screen>;
}
