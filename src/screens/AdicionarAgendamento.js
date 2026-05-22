import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput as NativeTextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';
import {
  adicionarPontos,
  obterPets,
  obterUsuario,
  obterUsuarios,
  salvarAgendamento,
} from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

function normalizarTexto(valor) {
  return (valor || '').trim().toLowerCase();
}

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

const tiposAgendamento = ['Consulta', 'Vacina', 'Retorno', 'Check-up', 'Exame', 'Vermífugo', 'Banho e tosa'];
const clinicas = ['Dobu Vet Centro', 'Dobu Vet Norte', 'Dobu Vet Sul', 'Atendimento domiciliar'];
const prioridades = ['Baixa', 'Média', 'Alta'];
const horariosDisponiveis = Array.from({ length: 21 }, (_, index) => {
  const totalMinutos = 8 * 60 + index * 30;
  const hora = String(Math.floor(totalMinutos / 60)).padStart(2, '0');
  const minuto = String(totalMinutos % 60).padStart(2, '0');
  return `${hora}:${minuto}`;
});

function formatarData(dataSelecionada) {
  const dia = String(dataSelecionada.getDate()).padStart(2, '0');
  const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
  const ano = dataSelecionada.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function chaveData(dataSelecionada) {
  const ano = dataSelecionada.getFullYear();
  const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
  const dia = String(dataSelecionada.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
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

export default function AdicionarAgendamento({ navigation, route }) {
  const [pet, setPet] = useState('');
  const [tipo, setTipo] = useState(route.params?.tipo || '');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [mesVisivel, setMesVisivel] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [observacao, setObservacao] = useState('');
  const [clinica, setClinica] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [pets, setPets] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectAberto, setSelectAberto] = useState(null);
  const [buscas, setBuscas] = useState({ pet: '', medico: '', tipo: '', horario: '', clinica: '', prioridade: '' });

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          const [usuarioSalvo, petsSalvos, usuariosSalvos] = await Promise.all([
            obterUsuario(),
            obterPets(),
            obterUsuarios(),
          ]);
          const veterinariosSalvos = usuariosSalvos.filter((item) => item.tipoConta === 'veterinario');
          const petsDoUsuario =
            usuarioSalvo?.tipoConta === 'veterinario'
              ? petsSalvos
              : petsSalvos.filter((item) => item.responsavelId === usuarioSalvo?.id);

          setUsuario(usuarioSalvo);
          setPets(petsDoUsuario);
          setVeterinarios(veterinariosSalvos);
          setTipo(route.params?.tipo || '');

          if (usuarioSalvo?.tipoConta === 'veterinario') {
            setVeterinario(usuarioSalvo.id);
          }
        } catch (error) {
          console.log('ERRO AO CARREGAR AGENDAMENTO:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do agendamento.');
        }
      }

      carregar();
    }, [route.params?.tipo, route.params?.atualizadoEm])
  );

  const diasDoMes = useMemo(() => gerarDiasDoMes(mesVisivel), [mesVisivel]);

  function mudarMes(direcao) {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + direcao, 1));
  }

  function selecionarData(dataSelecionada) {
    setData(formatarData(dataSelecionada));
    setMesVisivel(new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1));
  }

  async function salvar() {
    const petSelecionado = pets.find(
      (item) => item.id === pet || normalizarTexto(item.nome) === normalizarTexto(pet)
    );
    const veterinarioSelecionado = veterinarios.find((item) => item.id === veterinario);
    const veterinarioAgendamento =
      usuario?.tipoConta === 'veterinario'
        ? usuario.nome
        : veterinarioSelecionado?.nome || veterinario;

    if (!petSelecionado || !tipo || !data || !horario || !veterinarioAgendamento) {
      Alert.alert('Agendamento incompleto', 'Preencha animal, médico, tipo, data e horário.');
      return;
    }

    try {
      await salvarAgendamento({
        pet: petSelecionado.nome,
        tipo,
        data,
        horario,
        observacao: observacao.trim(),
        clinica,
        veterinario: veterinarioAgendamento,
        prioridade,
        petId: petSelecionado.id,
        responsavelId: petSelecionado.responsavelId || null,
        veterinarioId: usuario?.tipoConta === 'veterinario' ? usuario.id : veterinarioSelecionado?.id || null,
        criadoPorId: usuario?.id || null,
      });
      await adicionarPontos(15);
      Alert.alert('Agendamento salvo', 'Você ganhou 15 pontos por planejar um cuidado.');
      navigation.replace('Agendamentos', {
        dataSelecionada: data,
        atualizadoEm: Date.now(),
      });
    } catch (error) {
      console.log('ERRO AO SALVAR AGENDAMENTO:', error);
      Alert.alert('Erro', 'Não foi possível salvar o agendamento. Tente novamente.');
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>
        <Header navigation={navigation} title="Novo agendamento" subtitle="Organize o próximo cuidado" />

        <Card style={{ backgroundColor: '#FFB84D', borderRadius: 18, paddingVertical: 22 }}>
          <SelectPesquisavel
            label="Animal"
            vazio={usuario?.tipoConta === 'veterinario' ? 'Nenhum animal atendido ainda.' : 'Cadastre um animal antes de agendar.'}
            placeholder="Selecione o animal"
            buscaPlaceholder="Buscar por nome, ID, espécie ou raça"
            busca={buscas.pet}
            onBuscar={(valor) => setBuscas((atual) => ({ ...atual, pet: valor }))}
            aberto={selectAberto === 'pet'}
            onToggle={() => setSelectAberto(selectAberto === 'pet' ? null : 'pet')}
            options={pets.map((item) => ({
              label: `${item.nome} - ID ${String(item.id).slice(-5)}`,
              detalhe: `${item.especie || 'espécie'}${item.raca ? ` - ${item.raca}` : ''}`,
              searchText: `${item.nome} ${item.id} ${String(item.id).slice(-5)} ${item.especie || ''} ${item.raca || ''}`,
              value: item.id,
            }))}
            value={pet}
            onChange={(valor) => {
              setPet(valor);
              setSelectAberto(null);
              setBuscas((atual) => ({ ...atual, pet: '' }));
            }}
          />
          {usuario?.tipoConta === 'veterinario' ? (
            <SelectPesquisavel
              label="Médico"
              placeholder="Médico logado"
              aberto={false}
              onToggle={() => {}}
              options={[{
                label: usuario?.crmv
                  ? `${usuario.nome} - CRMV-${usuario.ufCrmv || 'UF'} ${usuario.crmv}`
                  : usuario?.nome || 'Veterinário',
                detalhe: usuario?.crmv ? 'Médico logado' : 'CRMV não informado',
                searchText: `${usuario?.nome || ''} ${usuario?.id || ''} ${String(usuario?.id || '').slice(-5)} ${usuario?.crmv || ''} ${usuario?.ufCrmv || ''}`,
                value: usuario?.id || '',
              }]}
              value={usuario?.id || ''}
              onChange={() => {}}
              disabled
            />
          ) : (
            <SelectPesquisavel
              label="Médico"
              vazio="Cadastre uma conta veterinária para selecionar."
              placeholder="Selecione o veterinário"
              buscaPlaceholder="Buscar por nome, ID, CRMV ou UF"
              busca={buscas.medico}
              onBuscar={(valor) => setBuscas((atual) => ({ ...atual, medico: valor }))}
              aberto={selectAberto === 'medico'}
              onToggle={() => setSelectAberto(selectAberto === 'medico' ? null : 'medico')}
              options={veterinarios.map((item) => ({
                label: item.nome,
                detalhe: item.crmv ? `CRMV-${item.ufCrmv || 'UF'} ${item.crmv}` : 'CRMV não informado',
                searchText: `${item.nome} ${item.id} ${String(item.id).slice(-5)} ${item.crmv || ''} ${item.ufCrmv || ''}`,
                value: item.id,
              }))}
              value={veterinario}
              onChange={(valor) => {
                setVeterinario(valor);
                setSelectAberto(null);
                setBuscas((atual) => ({ ...atual, medico: '' }));
              }}
            />
          )}
          <SelectPesquisavel
            label="Tipo"
            placeholder="Selecione o tipo"
            buscaPlaceholder="Buscar tipo"
            busca={buscas.tipo}
            onBuscar={(valor) => setBuscas((atual) => ({ ...atual, tipo: valor }))}
            aberto={selectAberto === 'tipo'}
            onToggle={() => setSelectAberto(selectAberto === 'tipo' ? null : 'tipo')}
            options={tiposAgendamento.map((item) => ({ label: item, value: item, searchText: item }))}
            value={tipo}
            onChange={(valor) => {
              setTipo(valor);
              setSelectAberto(null);
              setBuscas((atual) => ({ ...atual, tipo: '' }));
            }}
          />
          <CalendarioAgendamento
            dataSelecionada={data}
            diasDoMes={diasDoMes}
            mesVisivel={mesVisivel}
            onMudarMes={mudarMes}
            onSelecionarData={selecionarData}
          />
          <SelectPesquisavel
            label="Horário"
            placeholder="Selecione o horário"
            buscaPlaceholder="Buscar horário"
            busca={buscas.horario}
            onBuscar={(valor) => setBuscas((atual) => ({ ...atual, horario: valor }))}
            aberto={selectAberto === 'horario'}
            onToggle={() => setSelectAberto(selectAberto === 'horario' ? null : 'horario')}
            options={horariosDisponiveis.map((item) => ({ label: item, value: item, searchText: item }))}
            value={horario}
            onChange={(valor) => {
              setHorario(valor);
              setSelectAberto(null);
              setBuscas((atual) => ({ ...atual, horario: '' }));
            }}
          />
          <SelectPesquisavel
            label="Clínica"
            placeholder="Selecione a clínica"
            buscaPlaceholder="Buscar clínica"
            busca={buscas.clinica}
            onBuscar={(valor) => setBuscas((atual) => ({ ...atual, clinica: valor }))}
            aberto={selectAberto === 'clinica'}
            onToggle={() => setSelectAberto(selectAberto === 'clinica' ? null : 'clinica')}
            options={clinicas.map((item) => ({ label: item, value: item, searchText: item }))}
            value={clinica}
            onChange={(valor) => {
              setClinica(valor);
              setSelectAberto(null);
              setBuscas((atual) => ({ ...atual, clinica: '' }));
            }}
          />
          <SelectPesquisavel
            label="Prioridade"
            placeholder="Selecione a prioridade"
            buscaPlaceholder="Buscar prioridade"
            busca={buscas.prioridade}
            onBuscar={(valor) => setBuscas((atual) => ({ ...atual, prioridade: valor }))}
            aberto={selectAberto === 'prioridade'}
            onToggle={() => setSelectAberto(selectAberto === 'prioridade' ? null : 'prioridade')}
            options={prioridades.map((item) => ({ label: item, value: item, searchText: item }))}
            value={prioridade}
            onChange={(valor) => {
              setPrioridade(valor);
              setSelectAberto(null);
              setBuscas((atual) => ({ ...atual, prioridade: '' }));
            }}
          />
          <TextInput
            label="Motivo e observação"
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Digite a observação..."
            multiline
          />
          <Button title="Adicionar agendamento" cor="cinzaEscuro" onPress={salvar} style={{ marginHorizontal: 22 }} />
        </Card>

      </ScrollView>
      <BottomNavigation
        navigation={navigation}
        active="home"
        homeRoute={usuario?.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'Inicio'}
      />
    </SafeAreaView>
  );
}

function CalendarioAgendamento({
  dataSelecionada,
  diasDoMes,
  mesVisivel,
  onMudarMes,
  onSelecionarData,
}) {
  const tituloMes = `${nomesMeses[mesVisivel.getMonth()]} ${mesVisivel.getFullYear()}`;

  return (
    <View style={styles.grupoSelect}>
      <Text style={styles.labelSelect}>Data</Text>
      <View style={styles.calendario}>
        <View style={styles.calendarioTopo}>
          <Pressable onPress={() => onMudarMes(-1)} style={styles.setaCalendario}>
            <Ionicons name="chevron-back" size={20} color={cores.marrom} />
          </Pressable>
          <Text style={styles.mesTitulo}>{tituloMes}</Text>
          <Pressable onPress={() => onMudarMes(1)} style={styles.setaCalendario}>
            <Ionicons name="chevron-forward" size={20} color={cores.marrom} />
          </Pressable>
        </View>

        <View style={styles.semanaLinha}>
          {diasSemana.map((dia, index) => (
            <Text key={`${dia}-${index}`} style={styles.semanaTexto}>{dia}</Text>
          ))}
        </View>

        <View style={styles.gradeDias}>
          {diasDoMes.map((dia, index) => {
            const selecionado = dia && formatarData(dia) === dataSelecionada;

            return (
              <Pressable
                key={dia ? chaveData(dia) : `vazio-${index}`}
                disabled={!dia}
                onPress={() => onSelecionarData(dia)}
                style={[styles.diaCalendario, selecionado && styles.diaSelecionado, !dia && styles.diaVazio]}
              >
                {dia ? (
                  <Text style={[styles.diaTexto, selecionado && styles.diaTextoSelecionado]}>
                    {dia.getDate()}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function SelectPesquisavel({
  label,
  options,
  value,
  onChange,
  vazio,
  disabled,
  placeholder,
  aberto,
  onToggle,
  busca = '',
  onBuscar,
  buscaPlaceholder,
}) {
  const selecionado = options.find((option) => option.value === value);
  const termo = busca.trim().toLowerCase();
  const opcoesFiltradas = termo
    ? options.filter((option) => `${option.label} ${option.detalhe || ''} ${option.searchText || ''}`.toLowerCase().includes(termo))
    : options;

  return (
    <View style={styles.grupoSelect}>
      <Text style={styles.labelSelect}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.vazioSelect}>{vazio}</Text>
      ) : (
        <>
          <Pressable
            disabled={disabled}
            onPress={onToggle}
            style={[styles.selectCampo, disabled && styles.opcaoDesabilitada]}
          >
            <View style={styles.selectTextoArea}>
              <Text style={[styles.selectValor, !selecionado && styles.selectPlaceholder]}>
                {selecionado?.label || placeholder}
              </Text>
              {selecionado?.detalhe ? <Text style={styles.selectDetalhe}>{selecionado.detalhe}</Text> : null}
            </View>
            {!disabled ? <Text style={styles.selectSeta}>{aberto ? '▲' : '▼'}</Text> : null}
          </Pressable>

          {aberto ? (
            <View style={styles.opcoes}>
              <NativeTextInput
                value={busca}
                onChangeText={onBuscar}
                placeholder={buscaPlaceholder || 'Buscar'}
                placeholderTextColor={cores.textoClaro}
                autoCapitalize="none"
                style={styles.buscaSelect}
              />
              {opcoesFiltradas.length === 0 ? (
                <Text style={styles.semResultado}>Nenhum resultado encontrado.</Text>
              ) : null}
              {opcoesFiltradas.map((option) => {
                const ativo = value === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    style={[styles.opcao, ativo && styles.opcaoAtiva]}
                  >
                    <Text style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]}>{option.label}</Text>
                    {option.detalhe ? (
                      <Text style={[styles.opcaoDetalhe, ativo && styles.opcaoTextoAtivo]}>{option.detalhe}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grupoSelect: {
    marginBottom: 18,
  },
  labelSelect: {
    color: cores.texto,
    fontWeight: '800',
    marginBottom: 7,
    fontSize: 15,
  },
  selectCampo: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: cores.branco,
    borderWidth: 0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValor: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  selectTextoArea: {
    flex: 1,
  },
  selectDetalhe: {
    color: cores.textoClaro,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  selectPlaceholder: {
    color: cores.textoClaro,
    fontWeight: '500',
  },
  selectSeta: {
    color: cores.marrom,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 8,
  },
  opcoes: {
    borderRadius: 8,
    backgroundColor: cores.branco,
    borderWidth: 0,
    overflow: 'hidden',
    marginTop: 6,
  },
  buscaSelect: {
    minHeight: 46,
    color: cores.texto,
    backgroundColor: cores.fundoClaro,
    borderBottomWidth: 1,
    borderBottomColor: cores.cinza,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
  },
  semResultado: {
    color: cores.textoClaro,
    padding: 14,
    fontWeight: '800',
  },
  opcao: {
    minHeight: 48,
    backgroundColor: cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: cores.cinza,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  opcaoAtiva: {
    backgroundColor: cores.cinzaEscuro,
    borderColor: cores.cinzaEscuro,
  },
  opcaoDesabilitada: {
    opacity: 0.92,
  },
  opcaoTexto: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  opcaoTextoAtivo: {
    color: cores.branco,
  },
  opcaoDetalhe: {
    color: cores.textoClaro,
    fontSize: 13,
    marginTop: 3,
    fontWeight: '700',
  },
  vazioSelect: {
    color: cores.marrom,
    backgroundColor: cores.branco,
    borderRadius: 8,
    padding: 12,
    fontWeight: '800',
  },
  calendario: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    padding: 12,
  },
  calendarioTopo: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  setaCalendario: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesTitulo: {
    color: cores.marrom,
    fontSize: 17,
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
  diaCalendario: {
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
    backgroundColor: cores.cinzaEscuro,
  },
  diaTexto: {
    color: cores.texto,
    fontSize: 15,
    fontWeight: '800',
  },
  diaTextoSelecionado: {
    color: cores.branco,
  },
});
