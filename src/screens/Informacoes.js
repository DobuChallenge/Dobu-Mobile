import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '../components/BottomNavigation';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import { obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'responsavel', label: 'Responsável' },
  { id: 'veterinario', label: 'Médico' },
  { id: 'urgencia', label: 'Urgência' },
];

const guias = [
  {
    id: 'triagem',
    publico: 'todos',
    categoria: 'Primeiros sinais',
    titulo: 'Como observar antes de procurar ajuda',
    resumo: 'Veja comportamento, respiração, apetite, água, urina, fezes e dor antes de decidir o próximo passo.',
    icone: 'eye-outline',
    alerta: false,
    passos: [
      'Observe se o animal está alerta, responsivo e andando normalmente.',
      'Conte se a respiração está calma ou com esforço, boca aberta, chiado ou língua arroxeada.',
      'Anote quando comeu, bebeu água, urinou e evacuou pela última vez.',
      'Registre vômitos, diarreia, sangue, tremores, coceira, tosse ou mancar.',
      'Tire fotos ou vídeos curtos para mostrar na consulta.',
    ],
    quandoAgendar: 'Agende consulta se a mudança persistir por mais de um dia ou voltar várias vezes.',
  },
  {
    id: 'urgencia',
    publico: 'urgencia',
    categoria: 'Urgência',
    titulo: 'Sinais que não devem esperar',
    resumo: 'Alguns sinais exigem atendimento veterinário imediato.',
    icone: 'alert-circle-outline',
    alerta: true,
    passos: [
      'Falta de ar, desmaio, convulsão ou dificuldade para ficar em pé.',
      'Sangramento intenso, atropelamento, queda, mordida profunda ou queimadura.',
      'Ingestão de veneno, produto de limpeza, remédio humano, chocolate ou planta tóxica.',
      'Barriga muito inchada, tentativa de vomitar sem conseguir ou dor intensa.',
      'Gato sem urinar, principalmente macho, ou animal tentando urinar com dor.',
    ],
    quandoAgendar: 'Nesses casos, procure atendimento de urgência. Não espere o horário comum de consulta.',
  },
  {
    id: 'consulta-responsavel',
    publico: 'responsavel',
    categoria: 'Consulta',
    titulo: 'O que o responsável deve levar',
    resumo: 'Uma consulta melhora muito quando o histórico chega organizado.',
    icone: 'document-text-outline',
    alerta: false,
    passos: [
      'Carteira de vacina e vermifugação.',
      'Nome e dose de remédios, suplementos e antipulgas usados.',
      'Data de início dos sintomas e o que mudou na rotina.',
      'Fotos de feridas, vômito, fezes, urina ou comportamento estranho.',
      'Exames antigos, receitas e laudos anteriores.',
    ],
    quandoAgendar: 'Use a agenda do Dobu para registrar retorno, vacina, exame e acompanhamento.',
  },
  {
    id: 'consulta-medico',
    publico: 'veterinario',
    categoria: 'Atendimento',
    titulo: 'Roteiro rápido para orientar tutores',
    resumo: 'Perguntas simples ajudam a filtrar urgência, rotina e acompanhamento.',
    icone: 'medical-outline',
    alerta: false,
    passos: [
      'Confirme espécie, idade, peso aproximado, castração e doenças prévias.',
      'Pergunte início, frequência, evolução e fatores que pioram ou melhoram.',
      'Cheque alimentação, água, urina, fezes, vômito, dor e comportamento.',
      'Solicite mídias quando houver lesão, marcha alterada, tosse ou episódio intermitente.',
      'Finalize com orientação clara: observar, agendar consulta, retorno ou urgência.',
    ],
    quandoAgendar: 'Sempre deixe o retorno já marcado quando houver medicação, exame pendente ou risco de piora.',
  },
  {
    id: 'vacinas',
    publico: 'todos',
    categoria: 'Prevenção',
    titulo: 'Vacinas, vermífugo e antipulgas',
    resumo: 'Prevenção organizada evita atrasos e reduz risco de doenças.',
    icone: 'shield-checkmark-outline',
    alerta: false,
    passos: [
      'Cadastre o pet e mantenha os lembretes de vacina atualizados.',
      'Registre lote, data e profissional quando possível.',
      'Não aplique vacina em animal doente sem orientação veterinária.',
      'Vermífugo e antipulgas variam por peso, idade, ambiente e risco.',
      'Filhotes, idosos e animais com doença crônica precisam de acompanhamento mais próximo.',
    ],
    quandoAgendar: 'Agende revisões preventivas mesmo quando o animal parece bem.',
  },
  {
    id: 'alimentacao',
    publico: 'responsavel',
    categoria: 'Rotina',
    titulo: 'Alimentação e água',
    resumo: 'Mudanças em comida e sede costumam ser sinais importantes.',
    icone: 'nutrition-outline',
    alerta: false,
    passos: [
      'Evite trocar ração de uma vez; faça transição gradual quando indicada.',
      'Não ofereça remédio humano, osso cozido, chocolate, uva, cebola ou alho.',
      'Aumento grande de sede ou urina merece avaliação.',
      'Perda de apetite por mais de 24 horas preocupa; em gatos, não espere muito.',
      'Vômitos repetidos, sangue ou perda de peso precisam de consulta.',
    ],
    quandoAgendar: 'Marque avaliação quando apetite, peso, sede ou fezes mudarem sem explicação.',
  },
  {
    id: 'comportamento',
    publico: 'todos',
    categoria: 'Bem-estar',
    titulo: 'Comportamento também é saúde',
    resumo: 'Mudança de comportamento pode indicar dor, medo, estresse ou doença.',
    icone: 'happy-outline',
    alerta: false,
    passos: [
      'Apatia, isolamento ou agressividade repentina merecem atenção.',
      'Coceira intensa, lamber patas ou balançar orelhas pode indicar desconforto.',
      'Mancar, evitar pular ou dificuldade para levantar pode ser dor.',
      'Mudanças na caixa de areia ou xixi fora do lugar podem ser problema urinário.',
      'Ambiente, enriquecimento, rotina e sono fazem parte do cuidado.',
    ],
    quandoAgendar: 'Se o comportamento mudou sem motivo claro, registre no app e converse com o médico.',
  },
  {
    id: 'dobucam',
    publico: 'todos',
    categoria: 'Monitoramento',
    titulo: 'Como usar Dobu-Cam de forma útil',
    resumo: 'A câmera ajuda a contar a história do animal, mas não substitui exame clínico.',
    icone: 'videocam-outline',
    alerta: false,
    passos: [
      'Use videos curtos para mostrar tosse, crise, mancar ou comportamento repetitivo.',
      'Compare repouso, atividade e ausência de movimento com a rotina normal.',
      'Anote horário em que o evento aconteceu.',
      'Leve o registro para a consulta ou retorno.',
      'Se houver sinal de urgência, procure atendimento mesmo sem vídeo.',
    ],
    quandoAgendar: 'Use os registros para decidir melhor o tipo de consulta e prioridade.',
  },
];

function normalizar(valor) {
  return (valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function Informacoes({ navigation }) {
  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState('urgencia');
  const [usuario, setUsuario] = useState(null);

  useFocusEffect(
    useCallback(() => {
      obterUsuario().then(setUsuario);
    }, [])
  );

  const ehVeterinario = usuario?.tipoConta === 'veterinario';

  const filtradas = useMemo(() => {
    const termo = normalizar(pesquisa);

    return guias.filter((item) => {
      const passaPerfil =
        filtro === 'todos' ||
        item.publico === 'todos' ||
        item.publico === filtro;
      const passaBusca =
        !termo ||
        normalizar(`${item.categoria} ${item.titulo} ${item.resumo} ${item.passos.join(' ')}`).includes(termo);

      return passaPerfil && passaBusca;
    });
  }, [filtro, pesquisa]);

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>
        <Header
          navigation={navigation}
          title="Guia de cuidado"
          subtitle={ehVeterinario ? 'Apoio para orientar pacientes' : 'Orientações para a vida animal'}
        />

        <View style={styles.alerta}>
          <Ionicons name="alert-circle-outline" size={24} color={cores.vermelho} />
          <View style={styles.alertaTextoArea}>
            <Text style={styles.alertaTitulo}>Não substitui atendimento veterinário</Text>
            <Text style={styles.alertaTexto}>
              Em falta de ar, convulsão, intoxicação, trauma, sangramento ou dor intensa, procure urgência.
            </Text>
          </View>
        </View>

        <View style={styles.busca}>
          <Ionicons name="search-outline" size={22} color={cores.textoClaro} />
          <TextInput
            value={pesquisa}
            onChangeText={setPesquisa}
            placeholder="Buscar: vacina, vômito, urina, dor..."
            placeholderTextColor={cores.textoClaro}
            style={styles.input}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {filtros.map((item) => {
            const ativo = filtro === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setFiltro(item.id)}
                style={[styles.filtro, ativo && styles.filtroAtivo]}
              >
                <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resumoLinha}>
          <Text style={styles.resultado}>{filtradas.length} guia(s)</Text>
          <Text style={styles.perfil}>{ehVeterinario ? 'Modo médico' : 'Modo responsável'}</Text>
        </View>

        {filtradas.map((item) => {
          const estaAberto = aberto === item.id;
          return (
            <View key={item.id} style={[styles.card, item.alerta && styles.cardAlerta]}>
              <Pressable onPress={() => setAberto(estaAberto ? '' : item.id)} style={styles.cardTopo}>
                <View style={[styles.icone, item.alerta && styles.iconeAlerta]}>
                  <Ionicons
                    name={item.icone}
                    size={22}
                    color={item.alerta ? cores.vermelho : cores.principalEscuro}
                  />
                </View>
                <View style={styles.cardTituloArea}>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                  <Text style={styles.titulo}>{item.titulo}</Text>
                </View>
                <Ionicons
                  name={estaAberto ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={cores.textoClaro}
                />
              </Pressable>

              <Text style={styles.resumo}>{item.resumo}</Text>

              {estaAberto ? (
                <View style={styles.detalhes}>
                  {item.passos.map((passo, index) => (
                    <View key={passo} style={styles.passo}>
                      <Text style={styles.numero}>{index + 1}</Text>
                      <Text style={styles.passoTexto}>{passo}</Text>
                    </View>
                  ))}

                  <View style={styles.acao}>
                    <Ionicons name="calendar-outline" size={18} color={cores.principalEscuro} />
                    <Text style={styles.acaoTexto}>{item.quandoAgendar}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <BottomNavigation
        navigation={navigation}
        active="home"
        homeRoute={usuario?.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  alerta: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3B0B0',
    backgroundColor: '#FFF5F5',
    padding: 12,
    flexDirection: 'row',
    marginBottom: 14,
  },
  alertaTextoArea: {
    flex: 1,
    marginLeft: 10,
  },
  alertaTitulo: {
    color: cores.vermelho,
    fontWeight: '900',
    fontSize: 15,
  },
  alertaTexto: {
    color: cores.texto,
    lineHeight: 20,
    marginTop: 3,
  },
  busca: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: cores.texto,
    fontSize: 16,
    marginLeft: 8,
  },
  filtros: {
    gap: 8,
    paddingBottom: 12,
  },
  filtro: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  filtroAtivo: {
    backgroundColor: cores.cinzaEscuro,
    borderColor: cores.cinzaEscuro,
  },
  filtroTexto: {
    color: cores.texto,
    fontWeight: '900',
  },
  filtroTextoAtivo: {
    color: cores.branco,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultado: {
    color: cores.textoClaro,
    fontWeight: '800',
  },
  perfil: {
    color: cores.principalEscuro,
    fontWeight: '900',
  },
  card: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    padding: 14,
    marginBottom: 12,
  },
  cardAlerta: {
    borderColor: '#F3B0B0',
  },
  cardTopo: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: cores.fundoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconeAlerta: {
    backgroundColor: '#FFF1F1',
  },
  cardTituloArea: {
    flex: 1,
  },
  categoria: {
    color: cores.principalEscuro,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  titulo: {
    color: cores.marrom,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  resumo: {
    color: cores.textoClaro,
    lineHeight: 21,
    marginTop: 10,
  },
  detalhes: {
    marginTop: 12,
  },
  passo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  numero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: cores.principal,
    color: cores.branco,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '900',
    marginRight: 9,
  },
  passoTexto: {
    flex: 1,
    color: cores.texto,
    lineHeight: 21,
  },
  acao: {
    borderRadius: 8,
    backgroundColor: cores.fundo,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginTop: 4,
  },
  acaoTexto: {
    flex: 1,
    color: cores.texto,
    fontWeight: '800',
    lineHeight: 20,
    marginLeft: 8,
  },
});
