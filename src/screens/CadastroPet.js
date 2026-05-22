import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Card from '../components/Card';
import DobuLogo from '../components/DobuLogo';
import BottomNavigation from '../components/BottomNavigation';
import PhotoPicker from '../components/PhotoPicker';
import { adicionarPontos, salvarPet } from '../storage/armazenamento';
import { estilos } from '../styles/globalStyles';

function formatarDataNascimento(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);
  const dia = numeros.slice(0, 2);
  const mes = numeros.slice(2, 4);
  const ano = numeros.slice(4, 8);

  if (numeros.length > 4) return `${dia}/${mes}/${ano}`;
  if (numeros.length === 4) return `${dia}/${mes}/`;
  if (numeros.length > 2) return `${dia}/${mes}`;
  if (numeros.length === 2) return `${dia}/`;
  return dia;
}

function dataValida(valor) {
  const [dia, mes, ano] = valor.split('/').map(Number);
  if (!dia || !mes || !ano || ano < 1900) return false;

  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= hoje
  );
}

export default function CadastroPet({ navigation }) {
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [raca, setRaca] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [foto, setFoto] = useState('');
  const [peso, setPeso] = useState('');
  const [alergias, setAlergias] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [observacoes, setObservacoes] = useState('');

  function alterarNascimento(valor) {
    setNascimento(formatarDataNascimento(valor));
  }

  async function salvar() {
    if (!nome.trim() || !especie.trim() || !raca.trim() || !nascimento.trim()) {
      Alert.alert('Cadastro incompleto', 'Preencha nome, espécie, raça e data de nascimento.');
      return;
    }

    if (!dataValida(nascimento)) {
      Alert.alert('Data inválida', 'Informe a data de nascimento no formato DD/MM/AAAA.');
      return;
    }

    try {
      await salvarPet({
        nome: nome.trim(),
        especie: especie.trim(),
        raca: raca.trim(),
        nascimento: nascimento.trim(),
        foto,
        peso: peso.trim(),
        alergias: alergias.trim(),
        medicamentos: medicamentos.trim(),
        observacoes: observacoes.trim(),
      });
      await adicionarPontos(10);
      Alert.alert('Animal cadastrado', 'Você ganhou 10 pontos pelo cuidado preventivo.');
      navigation.replace('ListaPets', { atualizadoEm: Date.now() });
    } catch (error) {
      console.log('ERRO AO CADASTRAR PET:', error);
      Alert.alert('Erro', 'Não foi possível salvar o animal. Tente novamente.');
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.topoLogo}>
          <DobuLogo />
        </View>
        <Header navigation={navigation} title="Cadastrar Animal" subtitle="Complete o perfil do animal" />

        <Card style={{ backgroundColor: '#FFB84D', borderRadius: 18, paddingVertical: 22 }}>
          <PhotoPicker photo={foto} onChangePhoto={setFoto} title="Foto do animal" type="pet" />
          <TextInput label="Nome do animal" value={nome} onChangeText={setNome} placeholder="Digite o nome do animal..." />
          <TextInput label="Espécie" value={especie} onChangeText={setEspecie} placeholder="Ex: cachorro, gato..." />
          <TextInput label="Raça" value={raca} onChangeText={setRaca} placeholder="Digite a raça..." />
          <TextInput
            label="Data de nascimento"
            value={nascimento}
            onChangeText={alterarNascimento}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />
          <TextInput label="Peso" value={peso} onChangeText={setPeso} placeholder="Digite o peso..." />
          <TextInput label="Alergias" value={alergias} onChangeText={setAlergias} placeholder="Digite a alergia" />
          <TextInput
            label="Medicamentos em uso"
            value={medicamentos}
            onChangeText={setMedicamentos}
            placeholder="Digite o medicamento..."
          />
          <TextInput
            label="Observações médicas"
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Digite a observação..."
            multiline
          />
          <Button title="Adicionar animal" cor="cinzaEscuro" onPress={salvar} style={{ marginHorizontal: 28 }} />
        </Card>
      </ScrollView>
      <BottomNavigation navigation={navigation} active="home" />
    </SafeAreaView>
  );
}
