import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dobuCamApi } from '../api/dobuCam';
import BottomNavigation from '../components/BottomNavigation';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import Header from '../components/Header';
import { salvarMonitoramento } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';
import { cores } from '../styles/tema';

const endpointPadrao = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://127.0.0.1:5000';

function montarUrls(valor) {
  const url = valor.trim().replace(/\/$/, '');
  const baseUrl = url.endsWith('/status') ? url.replace(/\/status$/, '') : url;

  return {
    baseUrl,
    statusUrl: url.endsWith('/status') ? url : `${baseUrl}/status`,
    frameUrl: `${baseUrl}/camera-frame`,
  };
}

function interpretarBoolean(valor) {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor > 0;
  if (typeof valor === 'string') {
    return ['1', 'true', 'sim', 'presente', 'detected', 'moving', 'em_movimento'].includes(valor.toLowerCase());
  }
  return false;
}

function normalizarLeitura(dados) {
  const presente = interpretarBoolean(dados.pet_detected ?? dados.presente ?? dados.petPresente ?? dados.detectado);
  const emMovimento = interpretarBoolean(dados.pet_moving ?? dados.emMovimento ?? dados.moving);
  const estado = dados.activity_state || (presente ? (emMovimento ? 'em_movimento' : 'parado') : 'ausente');

  return {
    presente,
    emMovimento,
    estado,
    ultimaLeitura: dados.last_seen && dados.last_seen !== '--' ? new Date(dados.last_seen) : new Date(),
    confianca: typeof dados.confidence === 'number' ? dados.confidence : null,
    origem: dados.telemetry?.sensor || dados.source || 'Dobu-Cam',
    eventos: Array.isArray(dados.events) ? dados.events : [],
  };
}

export default function DobuCam({ navigation }) {
  const [presente, setPresente] = useState(true);
  const [emMovimento, setEmMovimento] = useState(false);
  const [estadoAtividade, setEstadoAtividade] = useState('parado');
  const [ultimaLeitura, setUltimaLeitura] = useState(new Date());
  const [endpoint, setEndpoint] = useState(endpointPadrao);
  const [origem, setOrigem] = useState('simulação local');
  const [confianca, setConfianca] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [frameUrl, setFrameUrl] = useState('');
  const [statusUrl, setStatusUrl] = useState('');
  const [frameAtualizadoEm, setFrameAtualizadoEm] = useState(0);
  const [conectando, setConectando] = useState(false);

  useEffect(() => {
    if (!frameUrl) return undefined;

    const intervalo = setInterval(() => {
      setFrameAtualizadoEm(Date.now());
    }, 1200);

    return () => clearInterval(intervalo);
  }, [frameUrl]);

  useEffect(() => {
    if (!statusUrl) return undefined;

    const intervalo = setInterval(() => {
      lerStatusDobuCam(statusUrl, frameUrl).catch((error) => {
        console.log('ERRO DOBU-CAM POLLING:', error);
      });
    }, 3000);

    return () => clearInterval(intervalo);
  }, [statusUrl, frameUrl]);

  const status = !presente
    ? 'Animal ausente'
    : emMovimento
      ? 'Animal presente e se mexendo'
      : 'Animal presente e parado';
  const statusDetalhe = presente
    ? `Leitura recebida por ${origem}.`
    : 'Nenhum animal detectado na última leitura.';

  const ultimaVezVisto = useMemo(() => {
    return ultimaLeitura.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [ultimaLeitura]);

  const confiancaTexto = confianca === null ? 'sem confiança informada' : `${Math.round(confianca * 100)}% de confiança`;
  const imagemCamera = frameUrl ? `${frameUrl}?t=${frameAtualizadoEm}` : '';

  async function registrarLeitura(petPresente, origem = 'simulação') {
    const agora = new Date();
    setPresente(petPresente);
    setEmMovimento(false);
    setEstadoAtividade(petPresente ? 'parado' : 'ausente');
    setUltimaLeitura(agora);
    setOrigem(origem);
    setConfianca(null);
    await salvarMonitoramento({
      presente: petPresente,
      emMovimento: false,
      estadoAtividade: petPresente ? 'parado' : 'ausente',
      origem,
      mensagem: petPresente ? 'Animal detectado pela Dobu-Cam.' : 'Nenhum animal detectado pela Dobu-Cam.',
    });
  }

  function alternarStatus() {
    registrarLeitura(!presente);
  }

  async function aplicarLeitura(leitura, urlFrame) {
    setPresente(leitura.presente);
    setEmMovimento(leitura.emMovimento);
    setEstadoAtividade(leitura.estado);
    setUltimaLeitura(leitura.ultimaLeitura);
    setOrigem(leitura.origem);
    setConfianca(leitura.confianca);
    setEventos(leitura.eventos);
    setFrameUrl(urlFrame);
    setFrameAtualizadoEm(Date.now());

    await salvarMonitoramento({
      presente: leitura.presente,
      emMovimento: leitura.emMovimento,
      estadoAtividade: leitura.estado,
      origem: leitura.origem,
      confianca: leitura.confianca,
      eventos: leitura.eventos,
      frameUrl: urlFrame,
      mensagem: leitura.presente ? 'Animal detectado pela Dobu-Cam.' : 'Nenhum animal detectado pela Dobu-Cam.',
    });
  }

  async function lerStatusDobuCam(urlStatus, urlFrame) {
    const dados = await dobuCamApi.lerStatus(urlStatus);
    const leitura = normalizarLeitura(dados);
    await aplicarLeitura(leitura, urlFrame);
  }

  async function conectarDispositivo(urlInformada = endpoint) {
    const url = urlInformada.trim();

    if (!url) {
      Alert.alert('URL vazia', 'Informe a URL HTTP do seu dispositivo IoT.');
      return;
    }

    try {
      setConectando(true);
      setEndpoint(url);
      const urls = montarUrls(url);
      await lerStatusDobuCam(urls.statusUrl, urls.frameUrl);
      setStatusUrl(urls.statusUrl);
      Alert.alert('Dobu-Cam conectada', 'Leitura recebida do dispositivo IoT.');
    } catch (error) {
      console.log('ERRO DOBU-CAM:', error);
      Alert.alert('Falha na conexão', 'Confira se o celular e o IoT estão na mesma rede e se a URL responde JSON.');
    } finally {
      setConectando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>

        <Header navigation={navigation} title="Dobu-Cam" subtitle="IoT e visão computacional" />

        <View style={styles.camera}>
          <View style={styles.cameraTopo}>
            <View style={styles.ponto} />
            <Text style={styles.cameraTexto}>CAM-01 | {origem}</Text>
          </View>

          <View style={styles.petArea}>
            {imagemCamera ? (
              <Image source={{ uri: imagemCamera }} style={styles.cameraImagem} />
            ) : (
              <>
              </>
            )}
          </View>
        </View>

        <Card style={styles.statusCard}>
          <View style={styles.linhaStatus}>
            <View style={[styles.indicador, presente ? styles.online : styles.offline]} />
            <View style={styles.infoStatus}>
              <Text style={styles.statusTitulo}>{status}</Text>
              <Text style={styles.statusTexto}>{statusDetalhe}</Text>
              <Text style={styles.statusTexto}>Estado: {estadoAtividade.replace('_', ' ')} | {confiancaTexto}</Text>
              <Text style={styles.ultimaVez}>Última vez visto: {ultimaVezVisto}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.conexao}>
          <Text style={styles.conexaoTitulo}>Conectar Dobu-Cam</Text>
          <TextInput
            value={endpoint}
            onChangeText={setEndpoint}
            placeholder="Ex: http://192.168.0.25/status"
            placeholderTextColor={cores.textoClaro}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.inputUrl}
          />
          <Pressable
            onPress={conectando ? undefined : () => conectarDispositivo()}
            style={({ pressed }) => [styles.botaoConectar, pressed && styles.pressionado]}
          >
            <Ionicons name="wifi-outline" size={22} color={cores.branco} />
            <Text style={styles.botaoTexto}>{conectando ? 'Conectando...' : 'Ler dispositivo'}</Text>
          </Pressable>
          {Platform.OS === 'android' ? (
            <Pressable
              onPress={conectando ? undefined : () => conectarDispositivo(endpointPadrao)}
              style={({ pressed }) => [styles.botaoEmulador, pressed && styles.pressionado]}
            >
              <Ionicons name="phone-portrait-outline" size={21} color={cores.principalEscuro} />
              <Text style={styles.botaoEmuladorTexto}>Conectar no emulador</Text>
            </Pressable>
          ) : null}
        </Card>

        {eventos.length > 0 ? (
          <Card style={styles.historico}>
            <Text style={styles.conexaoTitulo}>Histórico recente</Text>
            {eventos.slice().reverse().map((evento, index) => (
              <View key={`${evento.timestamp}-${index}`} style={styles.evento}>
                <Text style={styles.eventoTitulo}>{evento.message || 'Evento da Dobu-Cam'}</Text>
                <Text style={styles.eventoTexto}>{evento.last_seen ? new Date(evento.last_seen).toLocaleString('pt-BR') : 'Sem horário informado'}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Pressable onPress={alternarStatus} style={({ pressed }) => [styles.botaoSimular, pressed && styles.pressionado]}>
          <Ionicons name="sync-outline" size={22} color={cores.branco} />
          <Text style={styles.botaoTexto}>Simular nova detecção</Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation navigation={navigation} active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  camera: {
    minHeight: 230,
    borderRadius: 8,
    backgroundColor: '#3F3F3F',
    overflow: 'hidden',
    marginBottom: 16,
  },
  cameraTopo: {
    minHeight: 42,
    backgroundColor: '#2F2F2F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.verde,
    marginRight: 8,
  },
  cameraTexto: {
    color: cores.branco,
    fontWeight: '800',
  },
  petArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cameraImagem: {
    width: '100%',
    height: '100%',
    minHeight: 188,
    resizeMode: 'cover',
  },
  statusCamera: {
    color: cores.branco,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
  },
  statusCard: {
    backgroundColor: cores.branco,
    marginBottom: 14,
  },
  linhaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicador: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
  },
  online: {
    backgroundColor: cores.verde,
  },
  offline: {
    backgroundColor: cores.vermelho,
  },
  infoStatus: {
    flex: 1,
  },
  statusTitulo: {
    color: cores.marrom,
    fontSize: 19,
    fontWeight: '900',
  },
  statusTexto: {
    color: cores.textoClaro,
    marginTop: 4,
    lineHeight: 20,
  },
  ultimaVez: {
    color: cores.principalEscuro,
    fontWeight: '900',
    marginTop: 8,
  },
  conexao: {
    backgroundColor: cores.branco,
  },
  historico: {
    backgroundColor: cores.branco,
    marginTop: 14,
  },
  conexaoTitulo: {
    color: cores.marrom,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  inputUrl: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.cinza,
    color: cores.texto,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  botaoConectar: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: cores.principalEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  botaoEmulador: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: cores.fundoClaro,
    borderWidth: 1,
    borderColor: cores.cinza,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  botaoEmuladorTexto: {
    color: cores.principalEscuro,
    fontWeight: '900',
    fontSize: 15,
    marginLeft: 8,
  },
  botaoSimular: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: cores.cinzaEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 18,
  },
  evento: {
    borderTopWidth: 1,
    borderTopColor: cores.cinza,
    paddingVertical: 10,
  },
  eventoTitulo: {
    color: cores.marrom,
    fontWeight: '900',
  },
  eventoTexto: {
    color: cores.textoClaro,
    marginTop: 3,
  },
  pressionado: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  botaoTexto: {
    color: cores.branco,
    fontWeight: '900',
    fontSize: 16,
    marginLeft: 8,
  },
});
