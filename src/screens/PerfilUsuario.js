import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import { useDashboard } from '../hooks/useDashboard';
import { useProfileExtras } from '../hooks/useProfileExtras';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';

export default function PerfilUsuario({ navigation, route }) {
  const { user, logout, query, animals, appointments } = useDashboard();
  const savedExtras = useProfileExtras(user);
  const extras = { ...savedExtras, ...(user.profileExtras || {}), ...(route.params?.profileExtras || {}) };

  const sair = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Não foi possível remover a sessão salva', 'Tente sair novamente.', [{ text: 'Tentar novamente', onPress: sair }]);
    }
  };

  return (
    <Screen navigation={navigation} title="Meu perfil" subtitle="Sua conta e sua rotina no Dobu" active="perfil">
      <Card>
        <View style={styles.header}>
          <Avatar photo={extras.foto} />
          <View style={styles.headerText}>
            <Text style={ui.title}>{user.nome}</Text>
            <Text style={ui.body}>{user.email}</Text>
            <Text style={ui.badge}>{user.tipoConta === 'veterinario' ? 'Veterinário' : 'Responsável'}</Text>
          </View>
        </View>

        {extras.telefone ? <Info label="Telefone" value={extras.telefone} /> : null}

        {user.tipoConta === 'veterinario' ? (
          <View style={styles.profissional}>
            <Text style={styles.sectionTitle}>Dados profissionais</Text>
            <Info label="CRMV" value={[extras.crmv, extras.ufCrmv].filter(Boolean).join(' / ') || 'Não informado'} />
            <Info label="Clínica" value={extras.clinica || 'Não informada'} />
            <Info label="Especialidade" value={extras.especialidade || 'Não informada'} />
          </View>
        ) : null}

        <QueryState query={query}>
          <Text style={ui.body}>{animals.length} {user.tipoConta === 'veterinario' ? 'paciente(s) na agenda' : 'animal(is) cadastrado(s)'}</Text>
          <Text style={ui.body}>{appointments.length} agendamento(s)</Text>
        </QueryState>
      </Card>

      <View style={ui.actions}>
        <Button title="Editar perfil" icon="create-outline" cor="branco" onPress={() => navigation.navigate('EditarPerfil')} />
        <Button title="Ver animais" icon="paw-outline" onPress={() => navigation.navigate('ListaPets')} />
        <Button title="Ver agendamentos" cor="cinzaEscuro" onPress={() => navigation.navigate('Agendamentos')} />
        <Button title="Sair da conta" icon="log-out-outline" cor="vermelho" onPress={sair} />
      </View>
    </Screen>
  );
}

function Avatar({ photo }) {
  return (
    <View style={styles.avatar}>
      {photo ? <Image source={{ uri: photo }} style={styles.avatarImage} /> : <Ionicons name="person" size={42} color={cores.branco} />}
    </View>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: cores.principalEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: cores.branco,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profissional: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: cores.texto,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  info: {
    marginBottom: 8,
  },
  infoLabel: {
    color: cores.textoClaro,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
});
