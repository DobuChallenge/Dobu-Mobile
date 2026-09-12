import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import { usePetDetails } from '../hooks/usePetForm';
import { useCatalogos, usePet, usePetMutations } from '../hooks/usePets';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';

export default function PerfilPet({ navigation, route }) {
  const id = route.params?.id;
  const petQuery = usePet(id);
  const catalogosQuery = useCatalogos();
  const { excluir } = usePetMutations();
  const [deleteError, setDeleteError] = useState(null);
  const details = usePetDetails(petQuery.data, catalogosQuery.data);

  function confirmDelete() {
    if (!id || excluir.isPending) return;
    setDeleteError(null);
    Alert.alert(
      'Apagar animal',
      `Deseja apagar ${details?.name || 'este animal'}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluir.mutateAsync(id);
              navigation.replace('ListaPets');
            } catch (error) {
              setDeleteError(error?.message || 'Não foi possível apagar o animal. Tente novamente.');
            }
          },
        },
      ],
    );
  }

  if (!id) {
    return (
      <Screen navigation={navigation} title="Perfil do animal" subtitle="Dados do animal" active="home">
        <Card>
          <Text accessibilityRole="alert" style={ui.title}>Animal não identificado</Text>
          <Text style={ui.body}>Abra o perfil novamente pela lista de animais.</Text>
          <Button title="Voltar para a lista" onPress={() => navigation.replace('ListaPets')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      navigation={navigation}
      title={details?.name || 'Perfil do animal'}
      subtitle="Dados e atalhos de cuidado"
      active="home"
    >
      <QueryState query={petQuery}>
        <QueryState query={catalogosQuery}>
          {details ? (
            <>
              <Card style={styles.highlight}>
                <View style={styles.avatar}>
                  <Ionicons name="paw" size={58} color={cores.principalEscuro} />
                </View>
                <Text style={styles.name}>{details.name}</Text>
                <Text style={styles.description}>
                  {details.speciesName} • {details.breedName}
                </Text>
              </Card>

              <Card style={styles.summary}>
                <Text style={ui.title}>Perfil</Text>
                <DataRow icon="calendar-outline" label="Idade" value={details.ageLabel} />
                <DataRow icon="paw-outline" label="Espécie" value={details.speciesName} />
                <DataRow icon="ribbon-outline" label="Raça" value={details.breedName} />
                <DataRow icon="person-outline" label="Responsável" value={details.ownerName} />
              </Card>

              <View style={styles.actions}>
                <Button
                  title="Editar animal"
                  icon="create-outline"
                  onPress={() => navigation.navigate('CadastroPet', { id })}
                  disabled={excluir.isPending}
                />
                <Button
                  title="Ver agendamentos"
                  icon="calendar-outline"
                  cor="branco"
                  onPress={() => navigation.navigate('Agendamentos', { petId: id })}
                  disabled={excluir.isPending}
                />
                <Button
                  title="Informações e cuidados"
                  icon="document-text-outline"
                  cor="branco"
                  onPress={() => navigation.navigate('Informacoes', { petId: id })}
                  disabled={excluir.isPending}
                />
                {deleteError ? <Text accessibilityRole="alert" style={ui.error}>{deleteError}</Text> : null}
                <Button
                  title={excluir.isPending ? 'Apagando…' : 'Apagar animal'}
                  icon="trash-outline"
                  cor="vermelho"
                  onPress={confirmDelete}
                  disabled={excluir.isPending}
                />
              </View>
            </>
          ) : null}
        </QueryState>
      </QueryState>
    </Screen>
  );
}

function DataRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={21} color={cores.principalEscuro} />
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: { alignItems: 'center' },
  avatar: {
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: cores.amareloClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 6,
    borderColor: cores.principal,
  },
  name: { color: cores.marrom, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  description: { color: cores.textoClaro, fontSize: 18, marginTop: 5, textAlign: 'center' },
  summary: { marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: cores.cinza,
    paddingVertical: 9,
  },
  rowText: { flex: 1, marginLeft: 11 },
  label: { color: cores.textoClaro, fontSize: 13, fontWeight: '800' },
  value: { color: cores.texto, fontSize: 17, marginTop: 2 },
  actions: { gap: 12, marginTop: 16, marginBottom: 12 },
});
