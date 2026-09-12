import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import SelectField from '../components/SelectField';
import TextInput from '../components/TextInput';
import { useAuth } from '../hooks/useAuth';
import { usePetForm } from '../hooks/usePetForm';
import { useCatalogos, usePet, usePetMutations } from '../hooks/usePets';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';

export default function CadastroPet({ navigation, route }) {
  const id = route.params?.id;
  const editing = Boolean(id);
  const { user } = useAuth();
  const petQuery = usePet(id);
  const catalogosQuery = useCatalogos();
  const { salvar } = usePetMutations();

  const handleSaved = useCallback((savedPet) => {
    const savedId = savedPet?.id || id;
    if (savedId) navigation.replace('PerfilPet', { id: savedId });
    else navigation.replace('ListaPets');
  }, [id, navigation]);

  const form = usePetForm({
    id,
    pet: petQuery.data,
    catalogos: catalogosQuery.data,
    user,
    savePet: salvar.mutateAsync,
    onSaved: handleSaved,
  });

  const formContent = (
    <QueryState
      query={catalogosQuery}
      empty={Boolean(catalogosQuery.data && (!catalogosQuery.data.especies?.length || !catalogosQuery.data.racas?.length))}
      emptyTitle="Catálogo indisponível"
      emptyMessage="O catálogo de espécies e raças precisa ser configurado pelo serviço Dobu."
    >
      <Card style={styles.formCard}>
        <TextInput
          label="Nome do animal"
          value={form.draft.nome}
          onChangeText={(value) => form.setField('nome', value)}
          placeholder="Ex.: Lua"
          editable={!form.isSubmitting}
        />
        <TextInput
          label="Idade em anos"
          value={form.draft.idade}
          onChangeText={(value) => form.setField('idade', value)}
          placeholder="Ex.: 0"
          keyboardType="number-pad"
          editable={!form.isSubmitting}
        />
        <SelectField
          label="Espécie"
          value={form.draft.especieId}
          onChange={(value) => form.setField('especieId', value)}
          options={form.speciesOptions}
          placeholder="Selecione a espécie"
          disabled={form.isSubmitting}
        />
        <SelectField
          label="Raça"
          value={form.draft.racaId}
          onChange={(value) => form.setField('racaId', value)}
          options={form.breedOptions}
          placeholder={form.draft.especieId ? 'Selecione a raça' : 'Selecione a espécie primeiro'}
          disabled={!form.draft.especieId || form.isSubmitting}
        />
        <SelectField
          label="Responsável"
          value={form.draft.responsavelId}
          onChange={(value) => form.setField('responsavelId', value)}
          options={form.ownerOptions}
          placeholder="Selecione o responsável"
          disabled={user?.tipoConta !== 'veterinario' || form.isSubmitting}
        />

        {user?.tipoConta === 'veterinario' && form.ownerOptions.length === 0 ? (
          <Text accessibilityRole="alert" style={ui.error}>Nenhuma conta responsável está disponível.</Text>
        ) : null}
        {form.error ? <Text accessibilityRole="alert" style={ui.error}>{form.error}</Text> : null}

        <Button
          title={form.isSubmitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar animal'}
          icon={editing ? 'checkmark-circle-outline' : 'add-circle-outline'}
          cor="cinzaEscuro"
          onPress={form.submit}
          disabled={form.isSubmitting}
        />
      </Card>
    </QueryState>
  );

  return (
    <Screen
      navigation={navigation}
      title={editing ? 'Editar animal' : 'Cadastrar animal'}
      subtitle={editing ? 'Atualize os dados do perfil' : 'Organize os dados do seu animal'}
      active="home"
    >
      {editing ? <QueryState query={petQuery}>{formContent}</QueryState> : formContent}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: cores.principal,
    borderRadius: 18,
    paddingVertical: 22,
  },
});
