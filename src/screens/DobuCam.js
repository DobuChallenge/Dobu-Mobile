import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import QueryState from '../components/QueryState';
import Screen from '../components/Screen';
import SelectField from '../components/SelectField';
import { dobuCamApi } from '../api/dobuCam';
import { useCameras } from '../hooks/useCameras';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';
import { formatAppointmentDate } from '../utils/agendamentoValidation';

const endpointPadrao = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://127.0.0.1:5000';

export default function DobuCam({ navigation }) {
  const { pets, cameras, petId, setSelected } = useCameras();
  const [endpoint, setEndpoint] = useState(endpointPadrao);
  const [statusUrl, setStatusUrl] = useState('');
  const [frameUrl, setFrameUrl] = useState('');
  const [presente, setPresente] = useState(false);
  const [emMovimento, setEmMovimento] = useState(false);
  const [estadoAtividade, setEstadoAtividade] = useState('Aguardando leitura');
  const [ultimaLeitura, setUltimaLeitura] = useState('');
  const [origem, setOrigem] = useState('Sem conexão');
  const [confianca, setConfianca] = useState('');
  const [eventos, setEventos] = useState([]);
  const [frameAtualizadoEm, setFrameAtualizadoEm] = useState(Date.now());
  const [conectando, setConectando] = useState(false);

  const urls = useMemo(() => montarUrls(endpoint), [endpoint]);
  const imagemCamera = frameUrl ? `${frameUrl}${frameUrl.includes('?') ? '&' : '?'}t=${frameAtualizadoEm}` : '';

  useEffect(() => {
    if (!frameUrl) return undefined;
    const timer = setInterval(() => setFrameAtualizadoEm(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [frameUrl]);

  useEffect(() => {
    if (!statusUrl) return undefined;
    lerStatusDobuCam(statusUrl);
    const timer = setInterval(() => lerStatusDobuCam(statusUrl, true), 8000);
    return () => clearInterval(timer);
  }, [statusUrl]);

  function aplicarLeitura(leitura) {
    const normalizada = normalizarLeitura(leitura);
    setPresente(normalizada.presente);
    setEmMovimento(normalizada.movimento);
    setEstadoAtividade(normalizada.atividade);
    setOrigem(normalizada.origem);
    setConfianca(normalizada.confianca);
    setUltimaLeitura(new Date().toLocaleString('pt-BR'));
    setEventos((atuais) => [
      { id: `${Date.now()}`, texto: normalizada.mensagem, tipo: normalizada.presente ? 'presente' : 'ausente' },
      ...atuais,
    ].slice(0, 5));
  }

  async function lerStatusDobuCam(url = statusUrl || urls.status, silencioso = false) {
    if (!url) return;
    setConectando(true);
    try {
      const leitura = await dobuCamApi.lerStatus(url);
      aplicarLeitura(leitura);
      if (!silencioso) Alert.alert('Dobu-Cam', 'Leitura atualizada com sucesso.');
    } catch (error) {
      if (!silencioso) {
        Alert.alert('Dobu-Cam indisponível', 'Não consegui conectar à câmera agora. Você ainda pode ver como o monitoramento aparece no app.');
      }
    } finally {
      setConectando(false);
    }
  }

  function conectarEndpoint() {
    const montadas = montarUrls(endpoint);
    if (!montadas.status || !montadas.frame) {
      Alert.alert('Endereço inválido', 'Confira o endereço da Dobu-Cam e tente novamente.');
      return;
    }
    setStatusUrl(montadas.status);
    setFrameUrl(montadas.frame);
    setOrigem('Dispositivo Dobu-Cam');
    setFrameAtualizadoEm(Date.now());
    lerStatusDobuCam(montadas.status);
  }

  function simularDeteccao() {
    aplicarLeitura({
      presente: !presente,
      movimento: !emMovimento,
      atividade: presente ? 'Animal fora do campo da câmera' : 'Animal detectado em movimento',
      origem: 'Simulação local',
      confianca: 94,
    });
  }

  return (
    <Screen navigation={navigation} title="Dobu-Cam" subtitle="Monitoramento do animal" active="home">
      <Card style={styles.cameraCard}>
        <View style={styles.cameraTop}>
          <View>
            <Text style={styles.cameraTitle}>Câmera ao vivo</Text>
            <Text style={styles.cameraSubtitle}>{origem}</Text>
          </View>
          <StatusPill active={presente} />
        </View>

        <View style={styles.preview}>
          {imagemCamera ? (
            <Image source={{ uri: imagemCamera }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="videocam-outline" size={52} color={cores.branco} />
              <Text style={styles.previewText}>Conecte a Dobu-Cam ou visualize um exemplo</Text>
            </View>
          )}
        </View>

        <View style={styles.statusGrid}>
          <Metric icon="paw-outline" label="Presença" value={presente ? 'Detectado' : 'Sem presença'} active={presente} />
          <Metric icon="walk-outline" label="Movimento" value={emMovimento ? 'Com movimento' : 'Parado'} active={emMovimento} />
        </View>

        <Text style={styles.atividade}>{estadoAtividade}</Text>
        <Text style={ui.caption}>Última leitura: {ultimaLeitura || 'ainda não realizada'}</Text>
        {confianca ? <Text style={ui.caption}>Confiança: {confianca}</Text> : null}
      </Card>

      <Card>
        <Text style={ui.title}>Conectar Dobu-Cam</Text>
        <Text style={ui.caption}>Digite o endereço da câmera quando ela estiver ligada na mesma rede.</Text>
        <TextInput
          value={endpoint}
          onChangeText={setEndpoint}
          placeholder="http://10.0.2.2:5000"
          placeholderTextColor="#8E8984"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />
        <View style={styles.actions}>
          <Button title={conectando ? 'Conectando...' : 'Atualizar câmera'} icon="refresh-outline" onPress={conectando ? undefined : conectarEndpoint} disabled={conectando} />
          <Button title="Visualizar exemplo" icon="pulse-outline" cor="cinzaEscuro" onPress={simularDeteccao} />
        </View>
      </Card>

      <Text style={ui.heading}>Eventos recentes</Text>
      {!eventos.length ? (
        <Card>
          <Text style={ui.body}>Nenhum evento lido ainda. A primeira leitura aparecerá aqui.</Text>
        </Card>
      ) : eventos.map((evento) => (
        <Card key={evento.id} style={styles.eventCard}>
          <View style={styles.eventRow}>
            <Ionicons name={evento.tipo === 'presente' ? 'checkmark-circle' : 'alert-circle'} size={23} color={evento.tipo === 'presente' ? cores.verde : cores.principalEscuro} />
            <Text style={styles.eventText}>{evento.texto}</Text>
          </View>
        </Card>
      ))}

      <Text style={ui.heading}>Histórico da Dobu-Cam</Text>
      <QueryState query={pets} empty={!pets.data?.length} emptyTitle="Nenhum animal cadastrado" emptyMessage="Cadastre um animal para consultar os registros de suas câmeras.">
        <SelectField label="Animal" value={petId} onChange={setSelected} options={(pets.data || []).map((pet) => ({ value: pet.id, label: pet.nome }))} />
        {petId ? (
          <QueryState query={cameras} empty={!cameras.data?.length} emptyTitle="Nenhuma câmera cadastrada" emptyMessage="Quando este animal tiver uma Dobu-Cam, o histórico aparecerá aqui.">
            {cameras.data?.map((camera) => (
              <Card key={camera.id}>
                <Text style={ui.title}>{camera.localizacao || 'Dobu-Cam'}</Text>
                <Text style={ui.badge}>{camera.statusCamera || 'Sem status'}</Text>
                <Text style={ui.body}>Última movimentação: {camera.dataUltimaMovimentacao ? formatAppointmentDate(camera.dataUltimaMovimentacao) : 'Sem registro'}</Text>
              </Card>
            ))}
          </QueryState>
        ) : null}
      </QueryState>
    </Screen>
  );
}

function StatusPill({ active }) {
  return (
    <View style={[styles.statusPill, active && styles.statusPillActive]}>
      <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={16} color={active ? cores.verde : cores.textoClaro} />
      <Text style={[styles.statusPillText, active && styles.statusPillTextActive]}>{active ? 'Online' : 'Aguardando'}</Text>
    </View>
  );
}

function Metric({ icon, label, value, active }) {
  return (
    <View style={[styles.metric, active && styles.metricActive]}>
      <Ionicons name={icon} size={24} color={active ? cores.verde : cores.textoClaro} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function montarUrls(valor) {
  try {
    const base = new URL(String(valor || '').trim());
    if (!['http:', 'https:'].includes(base.protocol)) throw new Error();
    const clean = base.href.replace(/\/+$/, '');
    return {
      status: `${clean}/status`,
      frame: `${clean}/frame`,
    };
  } catch {
    return { status: '', frame: '' };
  }
}

function normalizarLeitura(leitura = {}) {
  const presente = interpretarBoolean(leitura.presente ?? leitura.detectado ?? leitura.animalPresente ?? leitura.motion);
  const movimento = interpretarBoolean(leitura.movimento ?? leitura.emMovimento ?? leitura.motion ?? leitura.moving);
  const atividade = leitura.atividade || leitura.status || (presente ? 'Animal detectado pela Dobu-Cam' : 'Nenhum animal no campo da câmera');
  const confianca = leitura.confianca || leitura.confidence;
  return {
    presente,
    movimento,
    atividade,
    origem: leitura.origem || leitura.device || 'Dispositivo Dobu-Cam',
    confianca: confianca ? `${confianca}%` : '',
    mensagem: `${atividade}${movimento ? ' com movimento.' : '.'}`,
  };
}

function interpretarBoolean(valor) {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor > 0;
  if (typeof valor === 'string') return ['true', '1', 'sim', 'yes', 'detectado', 'presente', 'movimento'].includes(valor.trim().toLowerCase());
  return false;
}

const styles = StyleSheet.create({
  cameraCard: {
    backgroundColor: cores.texto,
  },
  cameraTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  cameraTitle: {
    color: cores.branco,
    fontSize: 22,
    fontWeight: '900',
  },
  cameraSubtitle: {
    color: '#E8E0D8',
    fontSize: 14,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: cores.branco,
  },
  statusPillActive: {
    backgroundColor: '#E7F7EA',
  },
  statusPillText: {
    color: cores.textoClaro,
    fontWeight: '900',
  },
  statusPillTextActive: {
    color: cores.verde,
  },
  preview: {
    height: 210,
    borderRadius: 22,
    backgroundColor: '#2F2D2A',
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  previewText: {
    color: cores.branco,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  metricActive: {
    backgroundColor: '#EAF7EC',
  },
  metricLabel: {
    color: cores.textoClaro,
    fontSize: 13,
    fontWeight: '800',
  },
  metricValue: {
    color: cores.texto,
    fontSize: 15,
    fontWeight: '900',
  },
  atividade: {
    color: cores.branco,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#F6F1EC',
    color: cores.texto,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  actions: {
    gap: 10,
  },
  eventCard: {
    paddingVertical: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventText: {
    flex: 1,
    color: cores.texto,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
});
