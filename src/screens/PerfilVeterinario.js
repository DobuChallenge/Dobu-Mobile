import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '../components/BottomNavigation';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import NavigationCard from '../components/NavigationCard';
import { obterAgendamentos, obterPets, obterUsuario } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

function normalizarTexto(valor) {
  return (valor || '').trim().toLowerCase();
}

function parseDataDigitada(valor) {
  const partes = valor?.match(/\d+/g);
  if (!partes || partes.length < 3) return null;

  const [dia, mes, ano] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);
  const dataExiste =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;

  return dataExiste ? data : null;
}

export default function PerfilVeterinario({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [pets, setPets] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const [usuarioSalvo, agendamentosSalvos, petsSalvos] = await Promise.all([
          obterUsuario(),
          obterAgendamentos(),
          obterPets(),
        ]);

        setUsuario(usuarioSalvo);
        setAgendamentos(agendamentosSalvos || []);
        setPets(petsSalvos || []);
      }

      carregar();
    }, [])
  );

  const agendamentosDoVeterinario = useMemo(() => {
    const nomeVeterinario = normalizarTexto(usuario?.nome);
    if (!nomeVeterinario) return [];

    return agendamentos.filter((item) => {
      if (item.veterinarioId === usuario?.id) return true;

      const veterinarioAgendamento = normalizarTexto(item.veterinario);
      if (!veterinarioAgendamento) return false;

      return (
        veterinarioAgendamento === nomeVeterinario ||
        veterinarioAgendamento.includes(nomeVeterinario) ||
        nomeVeterinario.includes(veterinarioAgendamento)
      );
    });
  }, [agendamentos, usuario?.id, usuario?.nome]);

  const proximosAgendamentos = useMemo(() => {
    return agendamentosDoVeterinario
      .map((item) => ({ ...item, dataObj: parseDataDigitada(item.data) }))
      .filter((item) => item.dataObj)
      .sort((a, b) => a.dataObj - b.dataObj)
      .slice(0, 3);
  }, [agendamentosDoVeterinario]);

  const pacientesAtendidos = useMemo(() => {
    const idsPets = new Set(agendamentosDoVeterinario.map((item) => item.petId).filter(Boolean));
    const nomesPets = new Set(agendamentosDoVeterinario.map((item) => normalizarTexto(item.pet)));
    return pets
      .filter((pet) => idsPets.has(pet.id) || nomesPets.has(normalizarTexto(pet.nome)))
      .slice(0, 3);
  }, [agendamentosDoVeterinario, pets]);

  const existemAgendamentosSemEsteVeterinario = agendamentos.length > 0 && agendamentosDoVeterinario.length === 0;
  const registroProfissional = usuario?.crmv
    ? `CRMV-${usuario?.ufCrmv || 'UF'} ${usuario.crmv}`
    : 'CRMV não informado';

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo small />
        </View>

        <Header navigation={navigation} title="Veterinário" subtitle="Agenda e informações dos pacientes" />

        <View style={styles.heroHome}>
          <View style={styles.textoHero}>
            <Text style={styles.tituloHome}>Olá, {usuario?.nome || 'Veterinário'}!</Text>
            <Text style={styles.chamada}>{registroProfissional}</Text>
            <Text style={styles.pontosMini}>
              {agendamentosDoVeterinario.length} agendamento(s) - {pacientesAtendidos.length} paciente(s)
            </Text>
          </View>
          <View style={styles.avatar}>
            {usuario?.foto ? (
              <Image source={{ uri: usuario.foto }} style={styles.foto} />
            ) : (
              <Image source={require('../../assets/gato.png')} style={styles.foto} />
            )}
          </View>
        </View>

        <View style={estilos.grade}>
          <NavigationCard
            title="Perfil"
            description="Conta e CRMV"
            icon="person-outline"
            highlight
            onPress={() => navigation.navigate('PerfilUsuario')}
          />
          <NavigationCard
            title="Agenda"
            description="Consultas"
            icon="calendar-outline"
            highlight
            onPress={() => navigation.navigate('Agendamentos')}
          />
          <NavigationCard
            title="Pacientes"
            description="Animais atendidos"
            icon="paw-outline"
            onPress={() => navigation.navigate('ListaPets')}
          />
          <NavigationCard
            title="Lembretes"
            description="Cuidados do dia"
            icon="notifications-outline"
            onPress={() => navigation.navigate('Lembretes')}
          />
          <NavigationCard
            title="Informações"
            description="Saúde e notícias"
            icon="information-outline"
            highlight
            onPress={() => navigation.navigate('Informacoes')}
          />
        </View>

        <Text style={styles.secao}>Próximos atendimentos</Text>
        {proximosAgendamentos.length === 0 ? (
          <Card style={styles.vazio}>
            <Ionicons name="calendar-clear-outline" size={34} color={cores.principalEscuro} />
            <Text style={styles.vazioTitulo}>Agenda vazia</Text>
            <Text style={styles.vazioTexto}>Agendamentos com o seu nome aparecem aqui.</Text>
          </Card>
        ) : (
          proximosAgendamentos.map((item) => (
            <View key={item.id} style={styles.itemAgenda}>
              <View style={styles.hora}>
                <Text style={styles.horaTexto}>{item.horario}</Text>
              </View>
              <View style={styles.infoAgenda}>
                <Text style={styles.tituloAgenda}>{item.tipo}</Text>
                <Text style={styles.descricaoAgenda}>{item.pet} - {item.data}</Text>
                <Text style={styles.descricaoAgenda}>{item.clinica || 'Clínica não informada'}</Text>
              </View>
            </View>
          ))
        )}

        {existemAgendamentosSemEsteVeterinario ? (
          <Text style={styles.avisoFiltro}>
            Existem agendamentos salvos, mas nenhum está com o seu nome no campo Veterinário.
          </Text>
        ) : null}

        <Text style={styles.secao}>Pacientes recentes</Text>
        {pacientesAtendidos.length === 0 ? (
          <Card style={styles.vazio}>
            <Ionicons name="paw-outline" size={34} color={cores.principalEscuro} />
            <Text style={styles.vazioTitulo}>Nenhum paciente vinculado</Text>
            <Text style={styles.vazioTexto}>O animal aparece aqui quando houver agendamento com este veterinário.</Text>
          </Card>
        ) : (
          pacientesAtendidos.map((pet) => (
            <Pressable
              key={pet.id}
              onPress={() => navigation.navigate('PerfilPet', { pet })}
              style={({ pressed }) => [styles.petItem, pressed && styles.pressionado]}
            >
              <View style={styles.petAvatar}>
                {pet.foto ? (
                  <Image source={{ uri: pet.foto }} style={styles.foto} />
                ) : (
                  <Ionicons name="paw" size={24} color={cores.principalEscuro} />
                )}
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petNome}>{pet.nome}</Text>
                <Text style={styles.petDescricao}>{pet.especie} - {pet.raca || 'raça não informada'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={cores.textoClaro} />
            </Pressable>
          ))
        )}
      </ScrollView>
      <BottomNavigation navigation={navigation} active="home" homeRoute="PerfilVeterinario" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroHome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 150,
    marginBottom: 24,
  },
  textoHero: { flex: 1 },
  tituloHome: {
    color: cores.marrom,
    fontSize: 32,
    fontWeight: '500',
  },
  chamada: {
    color: cores.principalEscuro,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 10,
    maxWidth: 220,
  },
  pontosMini: {
    color: cores.textoClaro,
    fontSize: 16,
    marginTop: 8,
  },
  avatar: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foto: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  secao: {
    color: cores.marrom,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 22,
    marginBottom: 10,
  },
  itemAgenda: {
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
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  horaTexto: {
    color: cores.principalEscuro,
    fontWeight: '900',
  },
  infoAgenda: {
    flex: 1,
  },
  tituloAgenda: {
    color: cores.marrom,
    fontSize: 17,
    fontWeight: '900',
  },
  descricaoAgenda: {
    color: cores.textoClaro,
    marginTop: 3,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    backgroundColor: cores.branco,
  },
  vazioTitulo: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  vazioTexto: {
    color: cores.textoClaro,
    textAlign: 'center',
    marginTop: 5,
  },
  avisoFiltro: {
    color: cores.textoClaro,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: -6,
    marginBottom: 16,
  },
  petItem: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressionado: {
    opacity: 0.82,
  },
  petAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: cores.fundoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  petInfo: {
    flex: 1,
  },
  petNome: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
  },
  petDescricao: {
    color: cores.textoClaro,
    marginTop: 3,
  },
});
