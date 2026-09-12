import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput as NativeTextInput, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import SelectField from '../components/SelectField';
import TextInput from '../components/TextInput';
import { useInformacaoForm, useInformacoesCaderno } from '../hooks/useInformacoes';
import { formatarDataVacina, resumirRaca } from '../services/informacoes';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';

export default function Informacoes({ navigation, route }) {
  const caderno = useInformacoesCaderno(route?.params?.petId);
  const form = useInformacaoForm(caderno.petId, caderno.mutations.criar);

  return (
    <Screen navigation={navigation} title="Informações" subtitle="Pesquise raças, cuidados e vacinas" active="home">
      <Text style={styles.sectionTitle}>Pesquisar raça</Text>
      <SearchBox
        label="Buscar raça"
        value={caderno.pesquisaRaca}
        onChangeText={caderno.setPesquisaRaca}
        placeholder="Busque por raça, espécie, porte ou cuidado"
      />

      <QueryState
        query={caderno.catalogosQuery}
        empty={Boolean(caderno.catalogosQuery.data && caderno.racasFiltradas.length === 0)}
        emptyTitle="Nenhuma raça encontrada"
        emptyMessage="Crie a lista inicial de espécies e raças no cadastro de animal ou tente outra busca."
      >
        {caderno.racasFiltradas.slice(0, 8).map((raca) => (
          <BreedCard key={raca.id} raca={raca} />
        ))}
      </QueryState>

      <Text style={styles.sectionTitle}>Vacinas</Text>
      <QueryState
        query={caderno.petsQuery}
        empty={Boolean(caderno.petsQuery.data && caderno.petsQuery.data.length === 0)}
        emptyTitle="Nenhum animal disponível"
        emptyMessage="Cadastre um animal para consultar vacinas vinculadas a ele."
      >
        <SelectField
          label="Animal"
          value={caderno.petId}
          onChange={caderno.setPetId}
          options={caderno.petOptions}
          placeholder="Selecione um animal"
          disabled={caderno.mutations.criar.isPending || caderno.mutations.excluir.isPending}
        />

        <SearchBox
          label="Buscar vacina"
          value={caderno.pesquisaVacina}
          onChangeText={caderno.setPesquisaVacina}
          placeholder="Busque por nome da vacina ou animal"
        />

        <QueryState
          query={caderno.vacinasQuery}
          empty={Boolean(caderno.vacinasQuery.data && caderno.vacinasFiltradas.length === 0)}
          emptyTitle="Nenhuma vacina encontrada"
          emptyMessage="As vacinas cadastradas para seus animais aparecerão aqui."
        >
          {caderno.vacinasFiltradas.map((vacina) => (
            <Card key={vacina.id} style={styles.vaccineCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="medkit-outline" size={22} color={cores.principalEscuro} />
                </View>
                <View style={styles.cardTitleArea}>
                  <Text style={styles.cardKicker}>Vacina</Text>
                  <Text style={styles.cardTitle}>{vacina.nome}</Text>
                </View>
              </View>
              <InfoRow label="Animal" value={vacina.petNome} />
              <InfoRow label="Aplicação" value={formatarDataVacina(vacina.dataAplicacao)} />
              <InfoRow label="Próxima dose" value={formatarDataVacina(vacina.dataProximaDose)} />
            </Card>
          ))}
        </QueryState>
      </QueryState>

      <View style={styles.cadernoHeader}>
        <Text style={styles.sectionTitleNoMargin}>Caderno do animal</Text>
        <Button
          title="Agendar"
          icon="calendar-outline"
          cor="branco"
          disabled={!caderno.petId}
          onPress={() => navigation.navigate('AdicionarAgendamento', { petId: caderno.petId })}
          style={styles.smallButton}
        />
      </View>

      <QueryState
        query={caderno.petsQuery}
        empty={Boolean(caderno.petsQuery.data && caderno.petsQuery.data.length === 0)}
        emptyTitle="Nenhum animal disponível"
        emptyMessage="Cadastre ou vincule um animal para criar registros."
      >
        <Text style={styles.petContext}>Registros de {caderno.pet?.nome || 'animal selecionado'}</Text>
        <SearchBox
          label="Buscar no caderno"
          value={caderno.pesquisa}
          onChangeText={caderno.setPesquisa}
          placeholder="Buscar por título ou descrição"
        />

        <QueryState
          query={caderno.informacoesQuery}
          empty={Boolean(caderno.informacoesQuery.data && caderno.informacoes.length === 0)}
          emptyTitle="Nenhum registro neste caderno"
          emptyMessage="Use o formulário abaixo para guardar uma observação."
        >
          {caderno.informacoesFiltradas.length === 0 ? (
            <StateCard icon="search-outline" text="Nenhum registro corresponde à busca." />
          ) : caderno.informacoesFiltradas.map((informacao) => (
            <Card key={informacao.id} style={styles.noteCard}>
              <View style={styles.noteTop}>
                <View style={styles.noteTitleArea}>
                  <Text style={styles.cardKicker}>Registro do usuário</Text>
                  <Text style={styles.cardTitle}>{informacao.titulo}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir ${informacao.titulo || 'registro'}`}
                  accessibilityState={{ disabled: caderno.mutations.excluir.isPending }}
                  disabled={caderno.mutations.excluir.isPending}
                  onPress={() => caderno.confirmarExclusao(informacao)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  {caderno.mutations.excluir.isPending && caderno.mutations.excluir.variables?.id === informacao.id ? (
                    <ActivityIndicator size="small" color={cores.vermelho} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={cores.vermelho} />
                  )}
                </Pressable>
              </View>
              <Text style={styles.noteText}>{informacao.descricao}</Text>
            </Card>
          ))}
        </QueryState>

        {caderno.mutations.excluir.isError ? (
          <Text accessibilityRole="alert" style={ui.error}>
            {caderno.mutations.excluir.error?.message || 'Não foi possível excluir o registro.'}
          </Text>
        ) : null}

        <Card style={styles.formCard}>
          <Text style={styles.formHelp}>Guarde observações rápidas sobre {caderno.pet?.nome || 'este animal'}.</Text>
          <TextInput label="Título" value={form.titulo} onChangeText={form.setTitulo} placeholder="Ex.: Alimentação" editable={!form.isSubmitting} />
          {form.erros.titulo ? <Text accessibilityRole="alert" style={ui.error}>{form.erros.titulo}</Text> : null}
          <TextInput
            label="Descrição"
            value={form.descricao}
            onChangeText={form.setDescricao}
            placeholder="Escreva a observação"
            multiline
            editable={!form.isSubmitting}
          />
          {form.erros.descricao ? <Text accessibilityRole="alert" style={ui.error}>{form.erros.descricao}</Text> : null}
          {form.erros.petId ? <Text accessibilityRole="alert" style={ui.error}>{form.erros.petId}</Text> : null}
          {form.error ? <Text accessibilityRole="alert" style={ui.error}>{form.error}</Text> : null}
          {form.success ? <Text accessibilityLiveRegion="polite" style={styles.success}>{form.success}</Text> : null}
          <Button
            title={form.isSubmitting ? 'Salvando...' : 'Adicionar registro'}
            icon={form.isSubmitting ? undefined : 'add-circle-outline'}
            disabled={form.isSubmitting || !caderno.petId}
            onPress={form.salvar}
          />
        </Card>
      </QueryState>
    </Screen>
  );
}

function BreedCard({ raca }) {
  const details = resumirRaca(raca);
  const description = String(raca.descricao || '').trim();
  const care = String(raca.cuidados || '').trim();

  return (
    <Card style={styles.breedCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <Ionicons name="paw-outline" size={22} color={cores.principalEscuro} />
        </View>
        <View style={styles.cardTitleArea}>
          <Text style={styles.cardKicker}>Raça</Text>
          <Text style={styles.cardTitle}>{raca.nome}</Text>
        </View>
      </View>
      {details.map((item) => <InfoRow key={item.label} label={item.label} value={item.value} />)}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {care ? (
        <View style={styles.careBox}>
          <Text style={styles.careTitle}>Cuidados cadastrados</Text>
          <Text style={styles.careText}>{care}</Text>
        </View>
      ) : null}
    </Card>
  );
}

function SearchBox({ label, value, onChangeText, placeholder }) {
  return (
    <View style={styles.searchGroup}>
      <Text style={ui.label}>{label}</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={21} color={cores.textoClaro} />
        <NativeTextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={cores.textoClaro}
          style={styles.searchInput}
        />
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StateCard({ icon, text }) {
  return (
    <Card style={styles.stateCard}>
      <Ionicons name={icon} size={26} color={cores.textoClaro} />
      <Text style={styles.stateText}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: cores.marrom, fontSize: 19, fontWeight: '900', marginBottom: 10, marginTop: 6 },
  sectionTitleNoMargin: { color: cores.marrom, fontSize: 19, fontWeight: '900' },
  searchGroup: { marginBottom: 14 },
  searchBox: { minHeight: 52, backgroundColor: cores.branco, borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  searchInput: { flex: 1, color: cores.texto, fontSize: 16, marginLeft: 8 },
  breedCard: { marginBottom: 12 },
  vaccineCard: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  cardTitleArea: { flex: 1 },
  cardKicker: { color: cores.principalEscuro, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  cardTitle: { color: cores.marrom, fontSize: 18, fontWeight: '900', marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 5 },
  infoLabel: { color: cores.textoClaro, fontWeight: '800', flex: 1 },
  infoValue: { color: cores.texto, fontWeight: '800', flex: 1.2, textAlign: 'right' },
  description: { color: cores.texto, fontSize: 15, lineHeight: 22, marginTop: 10 },
  careBox: { backgroundColor: cores.fundoClaro, borderRadius: 8, padding: 12, marginTop: 12 },
  careTitle: { color: cores.marrom, fontWeight: '900', marginBottom: 6 },
  careText: { color: cores.texto, fontSize: 15, lineHeight: 22 },
  cadernoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, marginBottom: 10 },
  smallButton: { minHeight: 44, paddingHorizontal: 16 },
  petContext: { color: cores.textoClaro, fontWeight: '800', marginBottom: 10 },
  noteCard: { marginBottom: 12 },
  noteTop: { flexDirection: 'row', alignItems: 'flex-start' },
  noteTitleArea: { flex: 1, paddingRight: 8 },
  noteText: { color: cores.texto, fontSize: 16, lineHeight: 24, marginTop: 10 },
  deleteButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF1F1', borderWidth: 1, borderColor: '#F6C7C7', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  formCard: { marginBottom: 24 },
  formHelp: { color: cores.textoClaro, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  success: { color: '#2E6B32', fontSize: 15, fontWeight: '800', lineHeight: 22, marginBottom: 14 },
  stateCard: { alignItems: 'center', marginBottom: 22, paddingVertical: 22 },
  stateText: { color: cores.textoClaro, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
});
