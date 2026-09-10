import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Header from '../components/Header';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';

import {
  obterAgendamentos,
  obterPets,
  obterPontos,
  obterUsuario
} from '../storage/armazenamento';

import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';
import { useAuth } from '../hooks/useAuth';

export default function PerfilUsuario({ navigation }) {
  const { logout } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [pets, setPets] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const [usuarioSalvo, pontosSalvos, petsSalvos, agendamentosSalvos] = await Promise.all([
          obterUsuario(),
          obterPontos(),
          obterPets(),
          obterAgendamentos(),
        ]);
        const nomeVeterinario = (usuarioSalvo?.nome || '').trim().toLowerCase();
        const animaisAtendidos = new Set(
          agendamentosSalvos
            .filter((item) => (item.veterinario || '').trim().toLowerCase() === nomeVeterinario)
            .map((item) => (item.pet || '').trim().toLowerCase())
        );
        const petsFiltrados =
          usuarioSalvo?.tipoConta === 'veterinario'
            ? petsSalvos.filter((pet) => animaisAtendidos.has((pet.nome || '').trim().toLowerCase()))
            : petsSalvos.filter((pet) => pet.responsavelId === usuarioSalvo?.id);

        setUsuario(usuarioSalvo);
        setPontos(pontosSalvos || 0);
        setPets(petsFiltrados || []);
      }

      carregar();
    }, [])
  );

  async function sair() {
    try {
      await logout();
    } catch {
      Alert.alert('Erro ao sair', 'Não foi possível remover a sessão salva.', [
        { text: 'Tentar novamente', onPress: sair },
      ]);
    }
  }

  function confirmarExcluirConta() {
    Alert.alert('Excluir conta', 'A exclusão da conta ainda não está disponível nesta versão.');
  }

  const fotoValida =
    typeof usuario?.foto === 'string' ? usuario.foto : null;
  const ehVeterinario = usuario?.tipoConta === 'veterinario';
  const registroProfissional = usuario?.crmv
    ? `CRMV-${usuario?.ufCrmv || 'UF'} ${usuario.crmv}`
    : 'CRMV não informado';

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>

        <Header
          navigation={navigation}
          title="Perfil Dobu"
          subtitle="Resumo do perfil"
        />

        <Card style={styles.painel}>
          <View style={styles.avatar}>
            {fotoValida ? (
              <Image source={{ uri: fotoValida }} style={styles.foto} />
            ) : (
              <Ionicons name="person" size={58} color={cores.branco} />
            )}
          </View>

          <Text style={styles.nome}>
            {usuario?.nome || 'Perfil Dobu'}
          </Text>

          <Text style={styles.email}>
            {usuario?.email || 'email não informado'}
          </Text>

          <Text style={styles.tipoConta}>
            {ehVeterinario ? 'Conta veterinária' : 'Conta responsável'}
          </Text>

          {ehVeterinario ? (
            <View style={styles.profissional}>
              <Text style={styles.profissionalTexto}>{registroProfissional}</Text>
            </View>
          ) : null}

          <View style={styles.metricas}>
            <View style={styles.metrica}>
              <Text style={styles.numero}>{pontos}</Text>
              <Text style={styles.rotulo}>pontos</Text>
            </View>

            <View style={styles.metrica}>
              <Text style={styles.numero}>{pets.length}</Text>
              <Text style={styles.rotulo}>{ehVeterinario ? 'pacientes' : 'animais'}</Text>
            </View>
          </View>
        </Card>

        <Button
          title={ehVeterinario ? 'Voltar para painel' : 'Voltar para início'}
          icon="home-outline"
          onPress={() => navigation.navigate(ehVeterinario ? 'PerfilVeterinario' : 'Inicio')}
          style={styles.botao}
        />

        <Button
          title="Sair"
          icon="log-out-outline"
          cor="branco"
          onPress={sair}
          style={styles.botaoSecundario}
        />

        <Button
          title="Deletar conta"
          icon="trash-outline"
          cor="vermelho"
          onPress={confirmarExcluirConta}
          style={styles.botaoExcluir}
        />
      </ScrollView>

      <BottomNavigation
        navigation={navigation}
        active="perfil"
        homeRoute={ehVeterinario ? 'PerfilVeterinario' : 'Inicio'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  painel: {
    alignItems: 'center',
    backgroundColor: cores.branco,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: cores.cinzaEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: cores.principal,
    marginBottom: 14,
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  nome: {
    color: cores.marrom,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  email: {
    color: cores.textoClaro,
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  tipoConta: {
    color: cores.principalEscuro,
    fontWeight: '900',
    marginTop: 10,
  },
  profissional: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: cores.areia,
    borderWidth: 1,
    borderColor: cores.areia,
    padding: 12,
    marginTop: 14,
  },
  profissionalTexto: {
    color: cores.branco,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 3,
  },
  metricas: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  metrica: {
    minWidth: 92,
    borderRadius: 8,
    backgroundColor: cores.fundoClaro,
    borderWidth: 1,
    borderColor: cores.cinza,
    paddingVertical: 12,
    alignItems: 'center',
  },
  numero: {
    color: cores.principalEscuro,
    fontSize: 24,
    fontWeight: '900',
  },
  rotulo: {
    color: cores.textoClaro,
    fontWeight: '800',
    marginTop: 2,
  },
  botao: {
    marginTop: 18,
  },
  botaoSecundario: {
    marginTop: 12,
  },
  botaoExcluir: {
    marginTop: 12,
    marginBottom: 12,
  },
});
