import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput as NativeTextInput, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import SelectField from '../components/SelectField';
import TextInput from '../components/TextInput';
import { useInformacaoForm, useInformacoesCaderno } from '../hooks/useInformacoes';
import { ui } from '../styles/ui';
import { cores } from '../styles/tema';

export default function Informacoes({ navigation, route }) {
  const caderno = useInformacoesCaderno(route?.params?.petId);
  const form = useInformacaoForm(caderno.petId, caderno.mutations.criar);

  return (
    <Screen navigation={navigation} title="Caderno de cuidados" subtitle="Registros organizados por animal" active="home">
      <QueryState
        query={caderno.petsQuery}
        empty={Boolean(caderno.petsQuery.data && caderno.petsQuery.data.length === 0)}
        emptyTitle="Nenhum animal disponível"
        emptyMessage="Cadastre ou vincule um animal para criar seu caderno de cuidados."
      >
        <SelectField
          label="Animal"
          value={caderno.petId}
          onChange={caderno.setPetId}
          options={caderno.petOptions}
          placeholder="Selecione um animal"
          disabled={caderno.mutations.criar.isPending || caderno.mutations.excluir.isPending}
        />

        <View style={styles.acoesTopo}>
          <Button
            title={`Agendar para ${caderno.pet?.nome || 'o animal'}`}
            icon="calendar-outline"
            cor="cinzaEscuro"
            disabled={!caderno.petId}
            onPress={() => navigation.navigate('AdicionarAgendamento', { petId: caderno.petId })}
            style={styles.acaoTopo}
          />
        </View>

        <Text style={styles.secaoTitulo}>Cuidados da raça</Text>
        {caderno.catalogosQuery.isPending ? (
          <Card style={styles.cardEstado}>
            <ActivityIndicator color={cores.principalEscuro} />
            <Text style={styles.estadoTexto}>Consultando os dados da raça…</Text>
          </Card>
        ) : caderno.catalogosQuery.isError ? (
          <Card style={styles.cardEstado}>
            <Ionicons name="cloud-offline-outline" size={26} color={cores.textoClaro} />
            <Text style={styles.estadoTexto}>Os cuidados da raça não puderam ser consultados agora.</Text>
            <Button
              title="Tentar novamente"
              cor="branco"
              disabled={caderno.catalogosQuery.isFetching}
              onPress={() => caderno.catalogosQuery.refetch()}
              style={styles.botaoCompacto}
            />
          </Card>
        ) : caderno.cuidado ? (
          <Card style={styles.cuidadoCard}>
            <View style={styles.cardCabecalho}>
              <View style={styles.iconeCuidado}>
                <Ionicons name="paw-outline" size={22} color={cores.principalEscuro} />
              </View>
              <View style={styles.cardTituloArea}>
                <Text style={styles.cardEtiqueta}>Sobre a raça</Text>
                <Text style={styles.cardTitulo}>{caderno.cuidado.nome}</Text>
              </View>
            </View>
            <Text style={styles.cardDescricao}>{caderno.cuidado.texto}</Text>
          </Card>
        ) : (
          <Card style={styles.cardEstado}>
            <Ionicons name="information-circle-outline" size={26} color={cores.textoClaro} />
            <Text style={styles.estadoTexto}>Esta raça ainda não possui cuidados cadastrados.</Text>
          </Card>
        )}

        <View style={styles.listaCabecalho}>
          <View>
            <Text style={styles.secaoTituloSemMargem}>Registros de {caderno.pet?.nome || 'animal'}</Text>
            {caderno.informacoesQuery.isSuccess ? (
              <Text style={styles.contador}>{caderno.informacoes.length} registro(s) do usuário</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.busca}>
          <Ionicons name="search-outline" size={21} color={cores.textoClaro} />
          <NativeTextInput
            accessibilityLabel="Buscar nos registros"
            value={caderno.pesquisa}
            onChangeText={caderno.setPesquisa}
            placeholder="Buscar por título ou descrição"
            placeholderTextColor={cores.textoClaro}
            style={styles.buscaInput}
          />
        </View>

        <QueryState
          query={caderno.informacoesQuery}
          empty={Boolean(caderno.informacoesQuery.data && caderno.informacoes.length === 0)}
          emptyTitle="Nenhum registro neste caderno"
          emptyMessage="Use o formulário abaixo para guardar a primeira observação deste animal."
        >
          {caderno.informacoesFiltradas.length === 0 ? (
            <Card style={styles.cardEstado}>
              <Ionicons name="search-outline" size={26} color={cores.textoClaro} />
              <Text style={styles.estadoTexto}>Nenhum registro corresponde à busca.</Text>
            </Card>
          ) : caderno.informacoesFiltradas.map((informacao) => (
            <Card key={informacao.id} style={styles.notaCard}>
              <View style={styles.notaTopo}>
                <View style={styles.notaTituloArea}>
                  <Text style={styles.registroEtiqueta}>Registro do usuário</Text>
                  <Text style={styles.notaTitulo}>{informacao.titulo}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    caderno.mutations.excluir.isPending && caderno.mutations.excluir.variables?.id === informacao.id
                      ? `Excluindo ${informacao.titulo || 'registro'}`
                      : `Excluir ${informacao.titulo || 'registro'}`
                  }
                  accessibilityState={{ disabled: caderno.mutations.excluir.isPending }}
                  disabled={caderno.mutations.excluir.isPending}
                  onPress={() => caderno.confirmarExclusao(informacao)}
                  style={({ pressed }) => [styles.excluir, pressed && styles.pressionado]}
                >
                  {caderno.mutations.excluir.isPending && caderno.mutations.excluir.variables?.id === informacao.id ? (
                    <ActivityIndicator size="small" color={cores.vermelho} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={cores.vermelho} />
                  )}
                </Pressable>
              </View>
              <Text style={styles.notaDescricao}>{informacao.descricao}</Text>
            </Card>
          ))}
        </QueryState>

        {caderno.mutations.excluir.isError ? (
          <Text accessibilityRole="alert" style={ui.error}>
            {caderno.mutations.excluir.error?.message || 'Não foi possível excluir o registro.'}
          </Text>
        ) : null}

        <Text style={styles.secaoTitulo}>Adicionar registro do usuário</Text>
        <Card style={styles.formCard}>
          <Text style={styles.formAjuda}>
            Anote rotinas e observações que você deseja guardar sobre {caderno.pet?.nome || 'este animal'}.
          </Text>
          <TextInput label="Título" value={form.titulo} onChangeText={form.setTitulo} placeholder="Ex.: Rotina de alimentação" editable={!form.isSubmitting} />
          {form.erros.titulo ? <Text accessibilityRole="alert" style={ui.error}>{form.erros.titulo}</Text> : null}
          <TextInput
            label="Descrição"
            value={form.descricao}
            onChangeText={form.setDescricao}
            placeholder="Escreva a observação que deseja registrar"
            multiline
            editable={!form.isSubmitting}
          />
          {form.erros.descricao ? <Text accessibilityRole="alert" style={ui.error}>{form.erros.descricao}</Text> : null}
          {form.erros.petId ? <Text accessibilityRole="alert" style={ui.error}>{form.erros.petId}</Text> : null}
          {form.error ? <Text accessibilityRole="alert" style={ui.error}>{form.error}</Text> : null}
          {form.success ? (
            <Text accessibilityLiveRegion="polite" style={styles.success}>{form.success}</Text>
          ) : null}
          {form.isSubmitting ? (
            <View accessibilityLiveRegion="polite" style={styles.statusLinha}>
              <ActivityIndicator size="small" color={cores.principalEscuro} />
              <Text style={styles.statusTexto}>Salvando registro…</Text>
            </View>
          ) : null}
          <Button
            title={form.isSubmitting ? 'Salvando…' : 'Adicionar ao caderno'}
            icon={form.isSubmitting ? undefined : 'add-circle-outline'}
            disabled={form.isSubmitting || !caderno.petId}
            onPress={form.salvar}
          />
        </Card>
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  acoesTopo: { marginBottom: 22 },
  acaoTopo: { width: '100%' },
  secaoTitulo: { color: cores.marrom, fontSize: 19, fontWeight: '900', marginBottom: 10, marginTop: 4 },
  secaoTituloSemMargem: { color: cores.marrom, fontSize: 19, fontWeight: '900' },
  cuidadoCard: { marginBottom: 22 },
  cardCabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconeCuidado: { width: 42, height: 42, borderRadius: 21, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  cardTituloArea: { flex: 1 },
  cardEtiqueta: { color: cores.principalEscuro, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  cardTitulo: { color: cores.marrom, fontSize: 18, fontWeight: '900', marginTop: 2 },
  cardDescricao: { color: cores.texto, fontSize: 16, lineHeight: 24 },
  cardEstado: { alignItems: 'center', marginBottom: 22, paddingVertical: 22 },
  estadoTexto: { color: cores.textoClaro, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  botaoCompacto: { alignSelf: 'stretch', marginTop: 10 },
  formCard: { marginBottom: 24 },
  formAjuda: { color: cores.textoClaro, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  listaCabecalho: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  contador: { color: cores.textoClaro, fontSize: 13, fontWeight: '700', marginTop: 3 },
  success: { color: '#2E6B32', fontSize: 15, fontWeight: '800', lineHeight: 22, marginBottom: 14 },
  statusLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusTexto: { color: cores.textoClaro, fontSize: 15, fontWeight: '800', marginLeft: 8 },
  busca: { minHeight: 52, backgroundColor: cores.branco, borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 14 },
  buscaInput: { flex: 1, color: cores.texto, fontSize: 16, marginLeft: 8 },
  notaCard: { marginBottom: 12 },
  notaTopo: { flexDirection: 'row', alignItems: 'flex-start' },
  notaTituloArea: { flex: 1, paddingRight: 8 },
  registroEtiqueta: { alignSelf: 'flex-start', color: cores.texto, backgroundColor: cores.amareloClaro, borderRadius: 8, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  notaTitulo: { color: cores.marrom, fontSize: 18, fontWeight: '900' },
  notaDescricao: { color: cores.texto, fontSize: 16, lineHeight: 24, marginTop: 10 },
  excluir: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF1F1', borderWidth: 1, borderColor: '#F6C7C7', alignItems: 'center', justifyContent: 'center' },
  pressionado: { opacity: 0.72 },
});
