import { Text } from 'react-native';
import Screen from '../components/Screen';
import QueryState from '../components/QueryState';
import SelectField from '../components/SelectField';
import Card from '../components/Card';
import { useCameras } from '../hooks/useCameras';
import { formatAppointmentDate } from '../utils/agendamentoValidation';
import { ui } from '../styles/ui';

export default function DobuCam({ navigation }) {
  const { pets, cameras, petId, setSelected } = useCameras();
  return <Screen navigation={navigation} title="Dobu-Cam" subtitle="Registros de monitoramento por animal">
    <QueryState query={pets} empty={!pets.data?.length} emptyTitle="Nenhum animal cadastrado" emptyMessage="Cadastre um animal para consultar os registros de suas câmeras.">
      <SelectField label="Animal" value={petId} onChange={setSelected} options={(pets.data || []).map((pet) => ({ value: pet.id, label: pet.nome }))} />
      <Text style={ui.caption}>Consulte o último status registrado pela câmera. Esta tela não transmite vídeo ao vivo.</Text>
      {petId ? <QueryState query={cameras} empty={!cameras.data?.length} emptyTitle="Nenhuma câmera vinculada" emptyMessage="Os registros aparecerão aqui quando uma câmera for vinculada a este animal no serviço Dobu-Cam.">
        {cameras.data?.map((camera) => <Card key={camera.id}>
          <Text style={ui.title}>{camera.localizacao}</Text>
          <Text style={ui.badge}>{camera.statusCamera}</Text>
          <Text style={ui.body}>Última movimentação: {camera.dataUltimaMovimentacao ? formatAppointmentDate(camera.dataUltimaMovimentacao) : 'Sem registro'}</Text>
        </Card>)}
      </QueryState> : null}
    </QueryState>
  </Screen>;
}
