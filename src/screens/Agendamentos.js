import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '../components/BottomNavigation';
import Button from '../components/Button';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import { excluirAgendamento, obterAgendamentos, obterPets, obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

const nomesMeses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function chaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function parseDataDigitada(valor) {
  const partes = valor?.match(/\d+/g);
  if (!partes || partes.length < 3) return null;

  const [dia, mes, ano] = partes.map(Number);
  if (!dia || !mes || !ano) return null;

  const data = new Date(ano, mes - 1, dia);
  const dataExiste =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;

  return dataExiste ? data : null;
}

function gerarDiasDoMes(dataBase) {
  const ano = dataBase.getFullYear();
  const mes = dataBase.getMonth();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const dias = [];

  for (let i = 0; i < primeiroDiaSemana; i += 1) {
    dias.push(null);
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    dias.push(new Date(ano, mes, dia));
  }

  return dias;
}

function normalizarTexto(valor) {
  return (valor || '').trim().toLowerCase();
}

export default function Agendamentos({ navigation, route }) {
  const hoje = useMemo(() => new Date(), []);
  const [mesVisivel, setMesVisivel] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [agendamentos, setAgendamentos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [pets, setPets] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const [agendamentosSalvos, usuarioSalvo, petsSalvos] = await Promise.all([
          obterAgendamentos(),
          obterUsuario(),
          obterPets(),
        ]);
        setAgendamentos(agendamentosSalvos);
        setUsuario(usuarioSalvo);
        setPets(petsSalvos || []);

        const dataRecebida = parseDataDigitada(route.params?.dataSelecionada);
        if (dataRecebida) {
          selecionarData(dataRecebida);
        }
      }

      carregar();
    }, [route.params?.dataSelecionada, route.params?.atualizadoEm])
  );

  const diasDoMes = useMemo(() => gerarDiasDoMes(mesVisivel), [mesVisivel]);

  const agendamentosVisiveis = useMemo(() => {
    if (!usuario) return [];

    if (usuario.tipoConta === 'veterinario') {
      const nomeVeterinario = normalizarTexto(usuario.nome);
      return agendamentos.filter(
        (item) => item.veterinarioId === usuario.id || normalizarTexto(item.veterinario) === nomeVeterinario
      );
    }

    const petsDoUsuario = pets.filter((petItem) => petItem.responsavelId === usuario.id);
    const idsPets = new Set(petsDoUsuario.map((petItem) => petItem.id));
    const nomesPets = new Set(petsDoUsuario.map((petItem) => normalizarTexto(petItem.nome)));

    return agendamentos.filter(
      (item) =>
        item.responsavelId === usuario.id ||
        idsPets.has(item.petId) ||
        nomesPets.has(normalizarTexto(item.pet))
    );
  }, [agendamentos, pets, usuario]);

  const agendamentosComData = useMemo(
    () =>
      agendamentosVisiveis.map((item) => ({
        ...item,
        dataObj: parseDataDigitada(item.data),
      })),
    [agendamentosVisiveis]
  );

  const diasComAgendamento = useMemo(() => {
    const mapa = {};
    agendamentosComData.forEach((item) => {
      if (item.dataObj) {
        mapa[chaveData(item.dataObj)] = true;
      }
    });
    return mapa;
  }, [agendamentosComData]);

  const agendamentosDoDia = useMemo(() => {
    const chaveSelecionada = chaveData(dataSelecionada);
    return agendamentosComData.filter((item) => item.dataObj && chaveData(item.dataObj) === chaveSelecionada);
  }, [agendamentosComData, dataSelecionada]);

  function mudarMes(direcao) {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + direcao, 1));
  }

  function selecionarData(data) {
    setDataSelecionada(data);
    setMesVisivel(new Date(data.getFullYear(), data.getMonth(), 1));
  }

  function confirmarExcluirAgendamento(agendamento) {
    Alert.alert(
      'Apagar consulta',
      `Deseja apagar ${agendamento.tipo || 'este agendamento'} de ${agendamento.pet || 'animal'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirAgendamento(agendamento.id);
              setAgendamentos((atuais) => atuais.filter((item) => item.id !== agendamento.id));
            } catch (error) {
              console.log('ERRO AO EXCLUIR AGENDAMENTO:', error);
              Alert.alert('Erro', 'Não foi possível apagar o agendamento.');
            }
          },
        },
      ]
    );
  }

  const tituloMes = `${nomesMeses[mesVisivel.getMonth()]} ${mesVisivel.getFullYear()}`;
  const dataSelecionadaTexto = dataSelecionada.toLocaleDateString('pt-BR');

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>
        <Header navigation={navigation} title="Agendamentos" subtitle="Consultas, vacinas e retornos" />

        <View style={styles.calendario}>
          <View style={styles.calendarioTopo}>
            <Pressable onPress={() => mudarMes(-1)} style={styles.seta}>
              <Ionicons name="chevron-back" size={22} color={cores.marrom} />
            </Pressable>
            <Text style={styles.mesTitulo}>{tituloMes}</Text>
            <Pressable onPress={() => mudarMes(1)} style={styles.seta}>
              <Ionicons name="chevron-forward" size={22} color={cores.marrom} />
            </Pressable>
          </View>

          <View style={styles.semanaLinha}>
            {diasSemana.map((dia, index) => (
              <Text key={`${dia}-${index}`} style={styles.semanaTexto}>{dia}</Text>
            ))}
          </View>

          <View style={styles.gradeDias}>
            {diasDoMes.map((data, index) => {
              const selecionado = data && chaveData(data) === chaveData(dataSelecionada);
              const temAgendamento = data && diasComAgendamento[chaveData(data)];

              return (
                <Pressable
                  key={data ? chaveData(data) : `vazio-${index}`}
                  disabled={!data}
                  onPress={() => selecionarData(data)}
                  style={[styles.dia, selecionado && styles.diaSelecionado, !data && styles.diaVazio]}
                >
                  {data ? (
                    <>
                      <Text style={[styles.diaTexto, selecionado && styles.diaTextoSelecionado]}>
                        {data.getDate()}
                      </Text>
                      {temAgendamento ? <View style={[styles.marcador, selecionado && styles.marcadorSelecionado]} /> : null}
                    </>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          title="Adicionar agendamento"
          icon="add-circle-outline"
          onPress={() => navigation.navigate('AdicionarAgendamento')}
          style={styles.botao}
        />

        <View style={styles.resumoLinha}>
          <Text style={styles.resumoTitulo}>{dataSelecionadaTexto}</Text>
          <Text style={styles.resumoContador}>{agendamentosDoDia.length} compromisso(s)</Text>
        </View>

        {agendamentosVisiveis.length === 0 ? (
          <Card style={styles.vazio}>
            <Ionicons name="calendar-outline" size={40} color={cores.principalEscuro} />
            <Text style={styles.vazioTitulo}>Nenhum agendamento salvo</Text>
            <Text style={styles.vazioTexto}>Adicione uma consulta, vacina ou retorno.</Text>
          </Card>
        ) : agendamentosDoDia.length === 0 ? (
          <View style={styles.semDia}>
            <Ionicons name="calendar-clear-outline" size={24} color={cores.textoClaro} />
            <Text style={styles.semDiaTexto}>Nenhum compromisso para este dia.</Text>
          </View>
        ) : (
          agendamentosDoDia.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.hora}>
                <Text style={styles.horaTexto}>{item.horario}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.titulo}>{item.tipo}</Text>
                <Text style={styles.descricao}>{item.pet}</Text>
                <Text style={styles.descricao}>
                  {item.clinica || 'Clínica não informada'} | {item.veterinario || 'Veterinário não informado'}
                </Text>
                {item.observacao ? <Text style={styles.obs}>{item.observacao}</Text> : null}
              </View>
              <View style={styles.acoesItem}>
                {item.prioridade ? <Text style={styles.tag}>{item.prioridade}</Text> : null}
                <Pressable
                  onPress={() => confirmarExcluirAgendamento(item)}
                  style={styles.botaoExcluir}
                  accessibilityRole="button"
                  accessibilityLabel="Apagar agendamento"
                >
                  <Ionicons name="trash-outline" size={20} color={cores.vermelho} />
                </Pressable>
              </View>
            </View>
          ))
        )}
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
  calendario: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    padding: 14,
    marginBottom: 16,
  },
  calendarioTopo: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seta: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesTitulo: {
    color: cores.marrom,
    fontSize: 19,
    fontWeight: '900',
  },
  semanaLinha: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  semanaTexto: {
    flex: 1,
    textAlign: 'center',
    color: cores.textoClaro,
    fontWeight: '900',
  },
  gradeDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dia: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  diaVazio: {
    opacity: 0,
  },
  diaSelecionado: {
    backgroundColor: cores.principal,
  },
  diaTexto: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  diaTextoSelecionado: {
    color: cores.branco,
  },
  marcador: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.principalEscuro,
    marginTop: 3,
  },
  marcadorSelecionado: {
    backgroundColor: cores.branco,
  },
  botao: {
    marginBottom: 16,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumoTitulo: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
  },
  resumoContador: {
    color: cores.textoClaro,
    fontWeight: '800',
  },
  item: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  hora: {
    minWidth: 58,
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  horaTexto: {
    color: cores.principalEscuro,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  titulo: {
    color: cores.marrom,
    fontSize: 17,
    fontWeight: '900',
  },
  descricao: {
    color: cores.textoClaro,
    marginTop: 3,
  },
  obs: {
    color: cores.texto,
    marginTop: 6,
    lineHeight: 20,
  },
  tag: {
    color: cores.branco,
    backgroundColor: cores.principalEscuro,
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '900',
  },
  acoesItem: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 8,
  },
  botaoExcluir: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F6C7C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semDia: {
    minHeight: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  semDiaTexto: {
    color: cores.textoClaro,
    fontWeight: '800',
    marginTop: 8,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  vazioTitulo: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  vazioTexto: {
    color: cores.textoClaro,
    textAlign: 'center',
    marginTop: 6,
  },
});
