# Dobu Mobile — Sprint 3

Escopo aprovado na conversa: concluir a entrega mobile usando os contratos .NET como referência, com commits por funcionalidade, e tornar Informações útil.

## Fluxos e limites

- Manter Expo 54, JavaScript, React Navigation e a identidade visual Dobu.
- Login/cadastro HTTP, SecureStore, logout e grupos protegidos existentes.
- Pets: listar, consultar, criar, editar e excluir por HTTP. Campos: nome, idade, raça e responsável. Espécies/raças vêm da API.
- Agendamentos: listar, criar, editar e excluir por HTTP. Campos: data/hora, status, pet e veterinário.
- Informações: caderno por animal com título/descrição persistidos na API, busca sem distinção de acentos, seleção de pet, cadastro/exclusão de notas e atalho para agendar. Mostrar cuidados da raça quando disponíveis na API. O backend não oferece edição de notas; os dois CRUDs avaliativos são pets e agendamentos.
- Início, perfis e lembretes derivam os dados do mesmo cache da API; sem pontos, clínicas fictícias ou persistência local de entidades.
- Dobu-Cam consulta registros reais da API; remover simulação de presença.
- As pastas .NET/DevOps são referências temporárias, não entram nos commits mobile nem são necessárias para empacotar o app.

## Arquitetura

`src/api` centraliza HTTP e contratos. `src/services` define queries/mutations testáveis e seleção dos dados. `src/hooks` conecta TanStack Query, sessão e formulários à UI. `src/components` reúne estados assíncronos, seleção pesquisável, cartões e estrutura de página. Telas só compõem UI e ações dos hooks.

Chaves de cache incluem o usuário. Mutations invalidam as consultas afetadas; sem copiar resultados para useState. Formulários podem usar estado local para rascunhos. Exclusões exigem confirmação. Erro, vazio, carregamento e atualização têm estados próprios. Rotas passam IDs, sem cópias de entidades.

## Verificação e entrega

Testes de contratos, validação, filtros por ID, invalidação e sessão; integração contra a API .NET local com banco de desenvolvimento descartável quando executável; exportação Android/iOS pelo Metro. Documentar URL, catálogo necessário, testes, limitações e roteiro de vídeo até 5 minutos. A gravação/publicação do vídeo e submissão no Classroom dependem do grupo.
