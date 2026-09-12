import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { catalogosApi } from '../api/catalogos';
import { catalogosQuery, petMutationOptions, petQuery, petsQuery } from '../services/queries';

export function usePets() {
  const { user } = useAuth();
  return useQuery(petsQuery(user));
}

export function usePet(id) {
  const { user } = useAuth();
  return useQuery(petQuery(user, id));
}

export function useCatalogos() {
  const { user } = useAuth();
  return useQuery(catalogosQuery(user));
}

export function usePetMutations() {
  const { user } = useAuth();
  const client = useQueryClient();
  return {
    salvar: useMutation(petMutationOptions(client, user, 'salvar')),
    excluir: useMutation(petMutationOptions(client, user, 'excluir')),
  };
}

export function useCatalogoBasicoMutation() {
  const { user } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (catalogos = {}) => {
      const especies = catalogos.especies || [];
      const racas = catalogos.racas || [];
      const especiesPorNome = new Map(especies.map((item) => [normalizarNome(item.nome), item]));
      const jaTemRaca = (nome) => racas.some((item) => String(item.nome).toLowerCase() === nome.toLowerCase());
      const criacoes = [];

      for (const especieBase of CATALOGO_BASE) {
        const chave = normalizarNome(especieBase.nome);
        const especie = especiesPorNome.get(chave) || await catalogosApi.criarEspecie({
          nome: especieBase.nome,
          descricao: especieBase.descricao,
        });
        especiesPorNome.set(chave, especie);

        for (const raca of especieBase.racas) {
          if (!jaTemRaca(raca.nome)) {
            criacoes.push(catalogosApi.criarRaca({ ...raca, especieId: especie.id }));
          }
        }
      }

      await Promise.all(criacoes);
    },
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: ['dobu', user?.id, 'catalogos'] }),
  });
}

function normalizarNome(nome) {
  return String(nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const CATALOGO_BASE = [
  {
    nome: 'Cachorro',
    descricao: 'Cães domésticos de diferentes portes e níveis de energia.',
    racas: [
      {
        nome: 'Vira-lata',
        porte: 'Médio',
        expectativaVida: 14,
        descricao: 'Animal sem raça definida, comum em lares brasileiros.',
        cuidados: 'Manter vacinação em dia, oferecer alimentação balanceada e fazer consultas regulares.',
      },
      {
        nome: 'Golden Retriever',
        porte: 'Grande',
        expectativaVida: 12,
        descricao: 'Cão dócil, ativo e sociável, comum em famílias.',
        cuidados: 'Escovação frequente, exercícios diários, controle de peso e atenção a quadril e pele.',
      },
      {
        nome: 'Shih-tzu',
        porte: 'Pequeno',
        expectativaVida: 13,
        descricao: 'Cão de companhia, calmo e adaptável a apartamentos.',
        cuidados: 'Escovar os pelos, limpar olhos e focinho, cuidar dos dentes e evitar calor excessivo.',
      },
      {
        nome: 'Poodle',
        porte: 'Pequeno',
        expectativaVida: 15,
        descricao: 'Cão inteligente, ativo e de pelagem encaracolada.',
        cuidados: 'Tosa regular, estímulo mental, escovação e acompanhamento de saúde oral.',
      },
      {
        nome: 'Bulldog Francês',
        porte: 'Pequeno',
        expectativaVida: 11,
        descricao: 'Cão braquicefálico, companheiro e de baixa tolerância ao calor.',
        cuidados: 'Evitar calor e exercício intenso, limpar dobras, controlar peso e observar respiração.',
      },
      {
        nome: 'Labrador Retriever',
        porte: 'Grande',
        expectativaVida: 12,
        descricao: 'Cão ativo, brincalhão e muito sociável.',
        cuidados: 'Exercícios diários, controle de alimentação, enriquecimento ambiental e cuidado articular.',
      },
    ],
  },
  {
    nome: 'Gato',
    descricao: 'Felinos domésticos com rotina independente e necessidade de enriquecimento ambiental.',
    racas: [
      {
        nome: 'Siamês',
        porte: 'Pequeno',
        expectativaVida: 15,
        descricao: 'Gato sociável, comunicativo e apegado aos tutores.',
        cuidados: 'Enriquecimento ambiental, vacinação, consultas preventivas e controle de estresse.',
      },
      {
        nome: 'Persa',
        porte: 'Médio',
        expectativaVida: 14,
        descricao: 'Gato de pelagem longa e temperamento tranquilo.',
        cuidados: 'Escovação diária, limpeza ocular, controle de bolas de pelo e atenção respiratória.',
      },
      {
        nome: 'Maine Coon',
        porte: 'Grande',
        expectativaVida: 13,
        descricao: 'Gato grande, sociável e de pelagem densa.',
        cuidados: 'Escovação frequente, brinquedos interativos, controle de peso e acompanhamento cardíaco.',
      },
      {
        nome: 'SRD Felino',
        porte: 'Médio',
        expectativaVida: 16,
        descricao: 'Gato sem raça definida, geralmente resistente e adaptável.',
        cuidados: 'Vacinas, vermifugação, castração, telas de proteção e estímulo para brincar.',
      },
    ],
  },
  {
    nome: 'Ave',
    descricao: 'Aves domésticas que precisam de ambiente seguro, higiene e dieta adequada.',
    racas: [
      {
        nome: 'Calopsita',
        porte: 'Pequeno',
        expectativaVida: 15,
        descricao: 'Ave sociável e inteligente, comum como animal de companhia.',
        cuidados: 'Oferecer gaiola espaçosa, poleiros, banho, sementes com moderação e verduras permitidas.',
      },
      {
        nome: 'Periquito Australiano',
        porte: 'Pequeno',
        expectativaVida: 10,
        descricao: 'Ave pequena, ativa e sociável.',
        cuidados: 'Manter companhia, brinquedos, alimentação variada e evitar correntes de ar.',
      },
      {
        nome: 'Canário',
        porte: 'Pequeno',
        expectativaVida: 10,
        descricao: 'Ave conhecida pelo canto e por rotina mais tranquila.',
        cuidados: 'Ambiente limpo, alimentação própria, banho regular e local sem fumaça ou vento forte.',
      },
    ],
  },
  {
    nome: 'Coelho',
    descricao: 'Lagomorfos domésticos sensíveis, com necessidade de fibras e ambiente seguro.',
    racas: [
      {
        nome: 'Mini Lion',
        porte: 'Pequeno',
        expectativaVida: 8,
        descricao: 'Coelho pequeno, de pelagem volumosa na cabeça.',
        cuidados: 'Feno sempre disponível, escovação, corte de unhas e evitar piso escorregadio.',
      },
      {
        nome: 'Holland Lop',
        porte: 'Pequeno',
        expectativaVida: 9,
        descricao: 'Coelho de orelhas caídas, dócil e popular como pet.',
        cuidados: 'Dieta rica em feno, verduras seguras, espaço para exercício e cuidado odontológico.',
      },
    ],
  },
  {
    nome: 'Roedor',
    descricao: 'Pequenos mamíferos com rotina de manejo delicada e ambiente enriquecido.',
    racas: [
      {
        nome: 'Hamster Sírio',
        porte: 'Pequeno',
        expectativaVida: 3,
        descricao: 'Roedor solitário, noturno e ativo.',
        cuidados: 'Gaiola espaçosa, roda adequada, substrato seguro e manejo calmo.',
      },
      {
        nome: 'Porquinho-da-índia',
        porte: 'Pequeno',
        expectativaVida: 6,
        descricao: 'Roedor sociável que vive melhor com companhia da mesma espécie.',
        cuidados: 'Vitamina C na dieta, feno constante, esconderijos e limpeza frequente do ambiente.',
      },
    ],
  },
];
