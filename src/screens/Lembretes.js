import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';
import Card from '../components/Card';
import { obterAgendamentos, obterPets, obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

const cuidadosFixos = [
  { titulo: 'Vacina', descricao: 'Marcar uma vacina para o animal.', icone: 'medkit-outline', tipoAgendamento: 'Vacina' },
  { titulo: 'Vermífugo', descricao: 'Marcar vermífugo preventivo.', icone: 'shield-checkmark-outline', tipoAgendamento: 'Vermífugo' },
  { titulo: 'Check-up', descricao: 'Marcar consulta preventiva.', icone: 'heart-outline', tipoAgendamento: 'Check-up' },
];

function normalizarTexto(valor) {
  return (valor || '').trim().toLowerCase();
}

export default function Lembretes({ navigation }) {
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
      }

      carregar();
    }, [])
  );

  const ehVeterinario = usuario?.tipoConta === 'veterinario';

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

  const lembretesAgenda = useMemo(
    () =>
      agendamentosVisiveis.map((item) => ({
        titulo: item.tipo,
        descricao: `${item.pet} - ${item.data} às ${item.horario}`,
        detalhe: `${item.clinica || 'Clínica não informada'} | ${item.observacao || 'Sem observações'}`,
        icone: 'alarm-outline',
        prioridade: item.prioridade,
      })),
    [agendamentosVisiveis]
  );

  function agendarCuidado(item) {
    navigation.navigate('AdicionarAgendamento', {
      tipo: item.tipoAgendamento || item.titulo,
      origem: 'cuidados-recomendados',
      atualizadoEm: Date.now(),
    });
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>
        <Header navigation={navigation} title="Lembretes" subtitle="Cuidados salvos e rotina preventiva" />

        {lembretesAgenda.length === 0 ? (
          <Card style={styles.vazio}>
            <Ionicons name="notifications-outline" size={38} color={cores.principalEscuro} />
            <Text style={styles.vazioTitulo}>Nenhum lembrete de consulta</Text>
            <Text style={styles.vazioTexto}>Os agendamentos salvos aparecem aqui automaticamente.</Text>
          </Card>
        ) : (
          lembretesAgenda.map((item, index) => (
            <Lembrete
              key={`${item.titulo}-${index}`}
              item={item}
              destaque
              onPress={() => navigation.navigate('Agendamentos')}
            />
          ))
        )}

        {ehVeterinario ? null : (
          <>
            <Text style={styles.secao}>Cuidados recomendados</Text>
            {cuidadosFixos.map((item) => (
              <CuidadoRecomendado
                key={item.titulo}
                item={item}
                onPress={() => agendarCuidado(item)}
              />
            ))}
          </>
        )}
      </ScrollView>
      <BottomNavigation
        navigation={navigation}
        active="lembretes"
        homeRoute={ehVeterinario ? 'PerfilVeterinario' : 'Inicio'}
      />
    </SafeAreaView>
  );
}

function CuidadoRecomendado({ item, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.titulo}. Toque para agendar.`}
      style={[styles.card, styles.cardRotina, styles.cardClicavel]}
    >
      <View style={styles.icone}>
        <Ionicons name={item.icone} size={24} color={cores.principalEscuro} />
      </View>
      <View style={styles.info}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descricao}>{item.descricao}</Text>
      </View>
      <View style={styles.acao}>
        <Text style={styles.acaoTexto}>Agendar</Text>
        <Ionicons name="chevron-forward" size={18} color={cores.branco} />
      </View>
    </TouchableOpacity>
  );
}

function Lembrete({ item, destaque, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={onPress ? `${item.titulo}. Toque para agendar.` : item.titulo}
      hitSlop={6}
      style={({ pressed }) => [
        styles.card,
        destaque ? styles.cardAgenda : styles.cardRotina,
        pressed && styles.pressionado,
      ]}
    >
      <View style={styles.icone}>
        <Ionicons name={item.icone} size={24} color={cores.principalEscuro} />
      </View>
      <View style={styles.info}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descricao}>{item.descricao}</Text>
        {item.detalhe ? <Text style={styles.detalhe}>{item.detalhe}</Text> : null}
        {item.prioridade ? <Text style={styles.prioridade}>Prioridade: {item.prioridade}</Text> : null}
      </View>
      {onPress ? (
        <View style={styles.acao}>
          <Text style={styles.acaoTexto}>Agendar</Text>
          <Ionicons name="chevron-forward" size={18} color={cores.branco} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    minHeight: 72,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardAgenda: {
    backgroundColor: cores.principal,
  },
  cardRotina: {
    backgroundColor: cores.areia,
  },
  cardClicavel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  pressionado: {
    opacity: 0.82,
  },
  icone: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titulo: {
    color: cores.branco,
    fontSize: 17,
    fontWeight: '900',
  },
  descricao: {
    color: cores.branco,
    marginTop: 4,
    lineHeight: 20,
  },
  detalhe: {
    color: cores.branco,
    marginTop: 4,
    opacity: 0.9,
  },
  prioridade: {
    color: cores.branco,
    fontWeight: '900',
    marginTop: 5,
  },
  acao: {
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    marginLeft: 10,
  },
  acaoTexto: {
    color: cores.branco,
    fontSize: 12,
    fontWeight: '900',
  },
  secao: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 10,
  },
  vazio: {
    alignItems: 'center',
    marginBottom: 16,
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
