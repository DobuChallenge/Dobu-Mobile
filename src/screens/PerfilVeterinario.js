import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import AppointmentCard from '../components/AppointmentCard';
import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import { useDashboard } from '../hooks/useDashboard';
import { useProfileExtras } from '../hooks/useProfileExtras';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';

export default function PerfilVeterinario({ navigation, route }) {
  const dashboard = useDashboard();
  const savedExtras = useProfileExtras(dashboard.user);
  const extras = { ...savedExtras, ...(dashboard.user.profileExtras || {}), ...(route.params?.profileExtras || {}) };

  return (
    <Screen navigation={navigation} title={`Olá, ${dashboard.user.nome}`} subtitle="Seu painel de atendimentos" active="home">
      <Card>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {extras.foto ? <Image source={{ uri: extras.foto }} style={styles.avatarImage} /> : <Ionicons name="medical" size={42} color={cores.branco} />}
          </View>
          <View style={styles.headerText}>
            <Text style={ui.title}>{dashboard.user.nome}</Text>
            <Text style={ui.body}>{dashboard.user.email}</Text>
            <Text style={ui.badge}>Veterinário</Text>
          </View>
        </View>
        <Info label="CRMV" value={[extras.crmv, extras.ufCrmv].filter(Boolean).join(' / ') || 'Não informado'} />
        <Info label="Clínica" value={extras.clinica || 'Não informada'} />
        <Info label="Especialidade" value={extras.especialidade || 'Não informada'} />
        {extras.telefone ? <Info label="Telefone" value={extras.telefone} /> : null}
      </Card>

      <View style={ui.actions}>
        <Button title="Editar perfil" icon="create-outline" cor="branco" onPress={() => navigation.navigate('EditarPerfil')} />
        <Button title="Gerenciar agenda" icon="calendar-outline" onPress={() => navigation.navigate('Agendamentos')} />
        <Button title="Animais cadastrados" icon="paw-outline" cor="cinzaEscuro" onPress={() => navigation.navigate('ListaPets')} />
        <Button title="Caderno de cuidados" icon="book-outline" cor="branco" onPress={() => navigation.navigate('Informacoes')} />
      </View>

      <QueryState query={dashboard.query}>
        <Card>
          <Text style={ui.title}>{dashboard.animals.length} paciente(s) na sua agenda</Text>
          <Text style={ui.body}>{dashboard.upcoming.length} próximo(s) atendimento(s)</Text>
        </Card>
        <Text style={ui.heading}>Próximos atendimentos</Text>
        {!dashboard.upcoming.length ? <Text style={ui.body}>Nenhum atendimento futuro. Sua agenda aparecerá aqui após o cadastro.</Text> : null}
        {dashboard.upcoming.slice(0, 3).map((item) => (
          <AppointmentCard key={item.id} item={item} onEdit={() => navigation.navigate('AdicionarAgendamento', { id: item.id })} />
        ))}
      </QueryState>
    </Screen>
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
    width: 88,
    height: 88,
    borderRadius: 44,
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
