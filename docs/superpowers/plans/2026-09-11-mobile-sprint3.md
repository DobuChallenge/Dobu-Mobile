# Mobile Sprint 3 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for coupled integration and superpowers:subagent-driven-development for bounded independent screens. Track steps below.

**Goal:** Entregar os fluxos reais de pets/agendamentos e um caderno de cuidados útil.
**Architecture:** HTTP → serviços de consulta/mutação → hooks → componentes/telas. Cache TanStack Query por sessão, sem persistência local dos dados de negócio.
**Tech Stack:** Expo 54, React Native 0.81, JavaScript, React Navigation 7, TanStack Query 5, SecureStore.
**Spec:** `docs/superpowers/specs/2026-09-11-mobile-sprint3-design.md`

## Global Constraints

- Manter Expo 54, JavaScript, React Navigation e a identidade visual Dobu.
- Não commitar as pastas de referência .NET/DevOps.
- Sem entidades mockadas na aplicação. Operações HTTP via TanStack Query em hooks.
- Preservar histórico existente, commits por etapa funcional.

## Etapas

- [ ] Base: `src/api/catalogos.js`, `src/services/queries.js`, `src/hooks/usePets.js`, `src/hooks/useAgendamentos.js`, componentes `Screen`, `QueryState`, `SelectField`. Testar os contratos e invalidação com QueryClient real e transporte de teste; executar `npm test`; commit da camada de dados.
- [ ] Pets: `src/hooks/usePetForm.js`, `src/utils/petValidation.js`, telas `CadastroPet`, `ListaPets`, `PerfilPet`. ID em params, modo criar/editar, confirmar exclusão, estados assíncronos. Testar idade zero, idade fracionária/inválida, vínculos ausentes; exportar Android; commit de CRUD pets.
- [ ] Agenda: `src/hooks/useAgendamentoForm.js`, `src/utils/agendamentoValidation.js`, telas `AdicionarAgendamento`, `Agendamentos`, cartão reutilizável. Validar calendário real e horários, atualizar cache após POST/PUT/DELETE; commit de CRUD agenda.
- [ ] Informações: API, hooks e regras próprias em `src/api/informacoes.js`, `src/hooks/useInformacoes.js`, `src/services/informacoes.js`; substituir a tela. Testar busca, seleção de pet, payload e invalidação; commit de caderno de cuidados.
- [ ] Visões integradas: migrar `Inicio`, `PerfilUsuario`, `PerfilVeterinario`, `Lembretes`, `DobuCam`, retirar armazenamento antigo e simulações; verificar imports e bundle; commit das visões reais.
- [ ] Entrega: teste de integração HTTP contra backend real, exportação Android/iOS, revisão do código e correções comprovadas. README, matriz dos requisitos e roteiro de vídeo; commit de documentação.

## Interfaces entre etapas

`usePets()` retorna um resultado useQuery com `data` contendo pets visíveis (responsável: somente seus IDs; veterinário: listagem da API). `usePet(id)` consulta um pet visível. `useCatalogos()` retorna query com `data: {racas, especies, usuarios}`. `usePetMutations()` retorna `{salvar, excluir}`; `salvar.mutateAsync({id?, dados})`, `excluir.mutateAsync(id)`.

`useAgendamentos()` retorna agenda visível já associada aos nomes dos pets e veterinários; `useAgendamento(id)` consulta registro por ID; `useAgendamentoMutations()` usa as mesmas assinaturas. Dados brutos da API preservam camelCase e IDs.

`Screen({navigation,title,subtitle,active,children})`, `QueryState({query,empty,emptyTitle,emptyMessage,children})`, `SelectField({label,value,onChange,options:[{value,label}],placeholder,disabled})`. `QueryState` apresenta loading/erro/vazio e só renderiza children quando há dados utilizáveis. Formulários não ficam editáveis quando a consulta inicial falha.

## Evidência inicial

18 testes existentes passaram após `npm ci`. As telas de negócio ainda usam AsyncStorage; o contrato da API não contém fotos, clínicas, prioridades ou pontos. As rotas já são declaradas e protegidas.
