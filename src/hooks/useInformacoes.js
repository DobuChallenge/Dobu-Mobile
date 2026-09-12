import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './useAuth';
import { useCatalogos, usePets } from './usePets';
import {
  cuidadoDaRaca,
  criarControleSubmissao,
  criarGuardaRascunho,
  filtrarRacas,
  filtrarInformacoes,
  filtrarVacinas,
  informacaoMutationOptions,
  informacoesQuery,
  selecionarPetDisponivel,
  vacinasQuery,
  validarInformacao,
} from '../services/informacoes';

export function useInformacoes(petId) {
  const { user } = useAuth();
  return useQuery(informacoesQuery(user, petId));
}

export function useInformacaoMutations() {
  const { user } = useAuth();
  const client = useQueryClient();
  return {
    criar: useMutation(informacaoMutationOptions(client, user, 'criar')),
    excluir: useMutation(informacaoMutationOptions(client, user, 'excluir')),
  };
}

export function useInformacoesCaderno(petIdDaRota) {
  const { user } = useAuth();
  const petsQuery = usePets();
  const catalogosQuery = useCatalogos();
  const mutations = useInformacaoMutations();
  const vacinasQueryResult = useQuery(vacinasQuery(user));
  const [petId, setPetId] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [pesquisaRaca, setPesquisaRaca] = useState('');
  const [pesquisaVacina, setPesquisaVacina] = useState('');
  const rotaAplicada = useRef('');
  const pets = petsQuery.data || [];
  const petIdSolicitado = String(petIdDaRota || '');

  useEffect(() => {
    if (!petsQuery.data) return;
    const rotaMudou = Boolean(petIdSolicitado && rotaAplicada.current !== petIdSolicitado);
    setPetId((atual) => selecionarPetDisponivel(petsQuery.data, rotaMudou ? '' : atual, petIdSolicitado));
    rotaAplicada.current = petIdSolicitado;
  }, [petIdSolicitado, petsQuery.data]);

  const petIdVisivel = pets.some((pet) => pet.id === petId) ? petId : '';
  const pet = pets.find((item) => item.id === petIdVisivel) || null;
  const informacoesQueryResult = useInformacoes(petIdVisivel);
  const informacoes = informacoesQueryResult.data || [];
  const informacoesFiltradas = useMemo(
    () => filtrarInformacoes(informacoes, pesquisa),
    [informacoes, pesquisa]
  );
  const racasFiltradas = useMemo(
    () => filtrarRacas(catalogosQuery.data?.racas, catalogosQuery.data?.especies, pesquisaRaca),
    [catalogosQuery.data?.especies, catalogosQuery.data?.racas, pesquisaRaca]
  );
  const vacinasFiltradas = useMemo(
    () => filtrarVacinas(vacinasQueryResult.data, pets, pesquisaVacina, petIdVisivel),
    [petIdVisivel, pesquisaVacina, pets, vacinasQueryResult.data]
  );
  const cuidado = useMemo(
    () => cuidadoDaRaca(pet, catalogosQuery.data),
    [catalogosQuery.data, pet]
  );
  const petOptions = useMemo(
    () => pets.map((item) => ({ value: item.id, label: item.nome || 'Animal sem nome' })),
    [pets]
  );

  const confirmarExclusao = useCallback((informacao) => {
    if (!informacao?.id || !petIdVisivel || mutations.excluir.isPending) return;
    Alert.alert(
      'Excluir registro',
      `Deseja excluir “${informacao.titulo || 'Registro'}” do caderno de ${pet?.nome || 'este animal'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => mutations.excluir.mutate({ id: informacao.id, petId: petIdVisivel }),
        },
      ]
    );
  }, [mutations.excluir, pet?.nome, petIdVisivel]);

  return {
    petsQuery,
    catalogosQuery,
    vacinasQuery: vacinasQueryResult,
    informacoesQuery: informacoesQueryResult,
    mutations,
    pet,
    petId: petIdVisivel,
    petOptions,
    setPetId,
    pesquisa,
    setPesquisa,
    pesquisaRaca,
    setPesquisaRaca,
    pesquisaVacina,
    setPesquisaVacina,
    informacoes,
    informacoesFiltradas,
    racasFiltradas,
    vacinasFiltradas,
    cuidado,
    confirmarExclusao,
  };
}

export function useInformacaoForm(petId, criarMutation) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const controleEnvio = useRef(null);
  const guardaRascunho = useRef(null);
  if (!controleEnvio.current) controleEnvio.current = criarControleSubmissao();
  if (!guardaRascunho.current) guardaRascunho.current = criarGuardaRascunho(petId);
  guardaRascunho.current.atualizar(petId);

  useEffect(() => {
    setTitulo('');
    setDescricao('');
    setErros({});
    setErroEnvio(null);
    setMensagemSucesso('');
  }, [petId]);

  const alterarTitulo = useCallback((valor) => {
    setTitulo(valor);
    setErroEnvio(null);
    setMensagemSucesso('');
  }, []);

  const alterarDescricao = useCallback((valor) => {
    setDescricao(valor);
    setErroEnvio(null);
    setMensagemSucesso('');
  }, []);

  const salvar = useCallback(async () => {
    if (criarMutation.isPending) return false;
    const resultado = validarInformacao({ titulo, descricao, petId });
    setErros(resultado.erros);
    setErroEnvio(null);
    setMensagemSucesso('');
    if (!resultado.valida) return false;
    const contextoDoEnvio = petId;

    return controleEnvio.current.executar(async () => {
      try {
        await criarMutation.mutateAsync(resultado.dados);
        if (guardaRascunho.current.pertence(contextoDoEnvio)) {
          setTitulo('');
          setDescricao('');
          setErros({});
          setMensagemSucesso('Registro adicionado ao caderno.');
        }
        return true;
      } catch (error) {
        if (guardaRascunho.current.pertence(contextoDoEnvio)) {
          setErroEnvio(error?.message || 'Não foi possível salvar o registro. Tente novamente.');
        }
        return false;
      }
    });
  }, [criarMutation, descricao, petId, titulo]);

  return {
    titulo,
    setTitulo: alterarTitulo,
    descricao,
    setDescricao: alterarDescricao,
    erros,
    salvar,
    isSubmitting: criarMutation.isPending,
    error: erroEnvio,
    success: mensagemSucesso,
  };
}
