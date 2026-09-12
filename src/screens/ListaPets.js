import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import { useAuth } from '../hooks/useAuth';
import { usePetList } from '../hooks/usePetForm';
import { useCatalogos, usePets } from '../hooks/usePets';
import { cores } from '../styles/tema';

export default function ListaPets({ navigation }) {
  const { user } = useAuth();
  const petsQuery = usePets();
  const catalogosQuery = useCatalogos();
  const isVet = user?.tipoConta === 'veterinario';
  const pets = usePetList(petsQuery.data, catalogosQuery.data);

  return (
    <Screen
      navigation={navigation}
      title={isVet ? 'Animais cadastrados' : 'Meus animais'}
      subtitle={isVet ? 'Consulte e gerencie os perfis' : 'Perfis vinculados à sua conta'}
      active="home"
    >
      <Button
        title="Adicionar animal"
        icon="add-circle-outline"
        onPress={() => navigation.navigate('CadastroPet')}
        style={styles.addButton}
      />

      <QueryState
        query={petsQuery}
        empty={petsQuery.data?.length === 0}
        emptyTitle="Nenhum animal cadastrado"
        emptyMessage={isVet
          ? 'Cadastre um animal e vincule uma conta responsável.'
          : 'Cadastre seu primeiro animal para iniciar os cuidados.'}
      >
        <QueryState query={catalogosQuery}>
          {pets.map((pet) => (
            <Pressable
              key={pet.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir perfil de ${pet.name}`}
              onPress={() => navigation.navigate('PerfilPet', { id: pet.id })}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View style={styles.avatar}>
                <Ionicons name="paw" size={29} color={cores.principalEscuro} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{pet.name}</Text>
                <Text style={styles.description}>{pet.speciesName} • {pet.breedName}</Text>
                <Text style={styles.age}>{pet.ageLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={23} color={cores.textoClaro} />
            </Pressable>
          ))}
        </QueryState>
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addButton: { marginBottom: 16 },
  item: {
    minHeight: 94,
    backgroundColor: cores.branco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.cinza,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: { opacity: 0.82 },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: cores.amareloClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  info: { flex: 1 },
  name: { color: cores.marrom, fontSize: 21, fontWeight: '900' },
  description: { color: cores.texto, fontSize: 15, marginTop: 3 },
  age: { color: cores.textoClaro, fontSize: 14, marginTop: 4, fontWeight: '700' },
});
