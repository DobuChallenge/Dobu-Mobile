import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import Button from '../components/Button';
import Card from '../components/Card';
import PhotoPicker from '../components/PhotoPicker';
import Screen from '../components/Screen';
import TextInput from '../components/TextInput';
import { usuariosApi } from '../api/usuarios';
import { useAuth, useUpdateCurrentUser } from '../hooks/useAuth';
import { useProfileExtras } from '../hooks/useProfileExtras';
import { removeProfileExtras, saveProfileExtras } from '../storage/profileExtrasStorage';
import { cores } from '../styles/tema';
import { ui } from '../styles/ui';

export default function EditarPerfil({ navigation }) {
  const { user, logout } = useAuth();
  const extras = useProfileExtras(user);
  const atualizarSessao = useUpdateCurrentUser();
  const atualizarUsuario = useMutation({ mutationFn: ({ id, dados }) => usuariosApi.atualizar(id, dados), retry: false });
  const excluirUsuario = useMutation({ mutationFn: usuariosApi.excluir, retry: false });
  const initialized = useRef(false);
  const [draft, setDraft] = useState({
    nome: user.nome,
    email: user.email,
    senha: '',
    foto: '',
    telefone: '',
    crmv: '',
    ufCrmv: '',
    clinica: '',
    especialidade: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialized.current || !extras.updatedAt) return;
    initialized.current = true;
    setDraft((current) => ({
      ...current,
      foto: extras.foto || '',
      telefone: extras.telefone || '',
      crmv: extras.crmv || '',
      ufCrmv: extras.ufCrmv || '',
      clinica: extras.clinica || '',
      especialidade: extras.especialidade || '',
    }));
  }, [extras]);

  const salvando = atualizarUsuario.isPending || atualizarSessao.isPending;
  const excluindo = excluirUsuario.isPending;

  function setField(field, value) {
    setError('');
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function salvar() {
    const nome = draft.nome.trim();
    const email = draft.email.trim().toLowerCase();
    const alterouConta = nome !== user.nome || email !== user.email;

    if (nome.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Digite um email válido.');
      return;
    }
    if (alterouConta && draft.senha.length < 6) {
      setError('Digite sua senha atual para alterar nome ou email.');
      return;
    }

    const profileExtras = {
      foto: draft.foto,
      telefone: draft.telefone.trim(),
      crmv: draft.crmv.trim(),
      ufCrmv: draft.ufCrmv.trim().toUpperCase(),
      clinica: draft.clinica.trim(),
      especialidade: draft.especialidade.trim(),
      tipoConta: user.tipoConta,
    };

    try {
      if (alterouConta) {
        await atualizarUsuario.mutateAsync({
          id: user.id,
          dados: {
            nome,
            email,
            senha: draft.senha,
            tipoUsuario: user.tipoConta.toUpperCase(),
          },
        });
      }

      await saveProfileExtras({ id: user.id, email }, profileExtras);

      if (alterouConta) {
        if (email !== user.email) await removeProfileExtras({ email: user.email });
        await atualizarSessao.mutateAsync({ nome, email, tipoUsuario: user.tipoConta.toUpperCase() });
      }

      navigation.navigate(user.tipoConta === 'veterinario' ? 'PerfilVeterinario' : 'PerfilUsuario', { profileExtras });
    } catch (saveError) {
      setError(saveError?.message || 'Não foi possível salvar suas alterações.');
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir conta',
      'Deseja excluir sua conta? Se ainda houver animais ou agendamentos no seu perfil, apague eles antes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirUsuario.mutateAsync(user.id);
              await removeProfileExtras(user);
              await logout();
            } catch (deleteError) {
              Alert.alert('Não foi possível excluir', deleteError?.message || 'Apague seus animais e agendamentos e tente novamente.');
            }
          },
        },
      ],
    );
  }

  return (
    <Screen navigation={navigation} title="Editar perfil" subtitle="Atualize seus dados da conta" active="perfil">
      <Card style={styles.card}>
        <PhotoPicker photo={draft.foto} onChangePhoto={(value) => setField('foto', value)} title="Foto de perfil" disabled={salvando || excluindo} />
        <TextInput label="Nome" value={draft.nome} onChangeText={(value) => setField('nome', value)} placeholder="Seu nome" editable={!salvando && !excluindo} />
        <TextInput label="Email" value={draft.email} onChangeText={(value) => setField('email', value)} placeholder="seu@email.com" keyboardType="email-address" editable={!salvando && !excluindo} />
        <TextInput label="Senha atual" value={draft.senha} onChangeText={(value) => setField('senha', value)} placeholder="Digite sua senha atual" secureTextEntry editable={!salvando && !excluindo} />
        <TextInput label="Telefone" value={draft.telefone} onChangeText={(value) => setField('telefone', value)} placeholder="Seu telefone" keyboardType="phone-pad" editable={!salvando && !excluindo} />

        {user.tipoConta === 'veterinario' ? (
          <View style={styles.profissional}>
            <Text style={ui.title}>Dados profissionais</Text>
            <TextInput label="CRMV" value={draft.crmv} onChangeText={(value) => setField('crmv', value)} placeholder="Ex.: 12345" editable={!salvando && !excluindo} />
            <TextInput label="UF do CRMV" value={draft.ufCrmv} onChangeText={(value) => setField('ufCrmv', value.toUpperCase())} placeholder="Ex.: SP" editable={!salvando && !excluindo} />
            <TextInput label="Clínica" value={draft.clinica} onChangeText={(value) => setField('clinica', value)} placeholder="Nome da clínica" editable={!salvando && !excluindo} />
            <TextInput label="Especialidade" value={draft.especialidade} onChangeText={(value) => setField('especialidade', value)} placeholder="Ex.: clínica geral" editable={!salvando && !excluindo} />
          </View>
        ) : null}

        {error ? <Text accessibilityRole="alert" style={ui.error}>{error}</Text> : null}
        <View style={ui.actions}>
          <Button title={salvando ? 'Salvando...' : 'Salvar perfil'} icon="checkmark-circle-outline" cor="cinzaEscuro" onPress={salvando ? undefined : salvar} disabled={salvando || excluindo} />
          <Button title={excluindo ? 'Excluindo...' : 'Excluir conta'} icon="trash-outline" cor="vermelho" onPress={confirmarExclusao} disabled={salvando || excluindo} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.principal,
  },
  profissional: {
    marginTop: 8,
  },
});
