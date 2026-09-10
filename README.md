# Dobu Mobile

Dobu Mobile é um protótipo funcional desenvolvido em React Native com Expo. A proposta é ajudar responsáveis e profissionais veterinários a organizar informações importantes da rotina de cuidado dos animais.

O aplicativo reúne cadastro e login pela API, gerenciamento de pets, lembretes, agendamentos, guia de informações e uma simulação de monitoramento pela Dobu-Cam. A sessão usa Expo SecureStore; pets, agendamentos e monitoramento continuam armazenados localmente com AsyncStorage.

---

# Objetivo do Projeto

O objetivo do Dobu Mobile é centralizar dados importantes da vida do animal e apoiar o cuidado preventivo no dia a dia.

Com o app, o usuário consegue:

- cadastrar responsáveis e veterinários;
- fazer login pela API;
- cadastrar e visualizar animais;
- organizar consultas, vacinas, retornos, exames e outros cuidados;
- consultar lembretes e agendamentos;
- acessar orientações de cuidado animal;
- simular leituras da Dobu-Cam;
- manter os dados salvos localmente no dispositivo.

Também existe um fluxo para veterinários, com visualização de agenda, pacientes e informações úteis para atendimento.

---

# Sobre a Dobu-Cam

A Dobu-Cam representa uma proposta de monitoramento geral do ambiente do animal. Ela não pertence a um pet individual; funciona como um recurso do sistema para acompanhar presença, movimento e status simulado.

Na tela da Dobu-Cam é possível:

- simular detecção de presença;
- conectar uma URL de dispositivo IoT;
- exibir o status da leitura;
- salvar leituras localmente com AsyncStorage.

---

# Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo SecureStore
- TanStack Query
- Expo Image Picker
- Expo File System
- @expo/vector-icons

---

# Funcionalidades Implementadas

## Navegação e Autenticação

- Tela de carregamento;
- Tela inicial;
- Cadastro de usuário;
- Login e cadastro reais pela API;
- Restauração da sessão e logout;
- Fluxo para responsável;
- Fluxo para veterinário;
- Mais de cinco rotas navegáveis usando React Navigation.

## Gerenciamento de Pets

- Cadastro de animais;
- Prévia dinâmica dos dados enquanto o usuário digita;
- Manipulação de estado com `useState`;
- Lista de animais cadastrados;
- Perfil individual do animal;
- Exclusão de animal.

## Rotina e Agendamentos

- Calendário de agendamentos;
- Cadastro de consulta, vacina, retorno, check-up, exame, vermífugo e banho/tosa;
- Seleção de pet, médico, tipo, data, horário, clínica e prioridade;
- Lembretes gerados a partir dos agendamentos;
- Vínculo entre agendamentos, pets, responsáveis e veterinários.

## Guia de Informações

- Conteúdos sobre cuidado animal;
- Filtros para responsável, médico e urgência;
- Busca por temas;
- Orientações práticas sobre rotina, prevenção, comportamento, alimentação e sinais de alerta.

## Sistema de Pontuação

O aplicativo possui uma lógica simples de pontuação para incentivar o cuidado contínuo.

O usuário ganha pontos ao:

- cadastrar novos animais;
- criar agendamentos.

Cada usuário possui sua própria pontuação.

## Persistência Local

Os dados são persistidos com AsyncStorage:

- pets;
- agendamentos;
- monitoramento;
- pontos por usuário.

A sessão é persistida separadamente no SecureStore, sem senha. Ao reiniciar, o app restaura uma sessão não expirada e retorna ao fluxo do perfil. Os registros antigos de usuários simulados são removidos; não são usados como credenciais.

---

# Conceitos Aplicados

- Navegação entre telas;
- Manipulação de estado com `useState`;
- Componentização;
- Formulários controlados;
- Persistência local com AsyncStorage;
- Tratamento de erros em operações principais de cadastro, login, foto, agendamento e armazenamento;
- Uso de bibliotecas do Expo;
- Organização de fluxo mobile;
- Dados mockados e simulações funcionais.

---

# Estrutura do Projeto

```bash
src/
  api/
  hooks/
  providers/
  utils/
  components/
  screens/
  storage/
  styles/
assets/
App.js
app.json
index.js
package.json
```

---

# Como Executar o Projeto

## Instalar dependências

```bash
npm install
```

## Ambiente para a futura integração (Sprint 3)

O TanStack Query está instalado e seu provider envolve a aplicação. A camada
HTTP está disponível em `src/api`. Login e cadastro estão conectados ao backend;
as telas de pets e agendamentos continuam usando dados locais.

Copie `.env.example` para `.env.local` na raiz e, quando a API estiver disponível,
preencha a URL base fornecida pela equipe, sem o sufixo `/api`:

```dotenv
EXPO_PUBLIC_API_URL=
```

`src/api/config.js` centraliza essa configuração. A URL precisa estar configurada
e acessível pelo dispositivo para realizar login ou cadastro. Não há login local
quando a API está indisponível. Em celular físico, `localhost` aponta para o próprio
celular: use o endereço acessível do servidor na rede.
Nunca coloque tokens, senhas ou secrets em variáveis `EXPO_PUBLIC_`, pois seus
valores ficam visíveis no aplicativo. `.env.local` é ignorado pelo Git.
Após alterar a variável, recarregue completamente o app.

## Camada HTTP

`authApi` (`src/api/auth.js`) expõe `login` e `cadastrar` conforme `AuthController`
e `AuthDtos` do backend. As respostas contêm `token`, `usuarioId`, `nome`, `email`
e `tipoUsuario`. Essas funções não iniciam uma sessão automaticamente.

`petsApi` e `agendamentosApi` expõem listagem, consulta por ID, criação,
atualização, exclusão e os filtros definidos nos respectivos controllers.
Os corpos enviados contêm apenas os campos dos contratos `PetRequest` e
`AgendamentoRequest`. As respostas JSON são devolvidas sem adaptação aos modelos
locais; exclusões com status 204 retornam `undefined`.

O controlador de sessão configura o Bearer no cliente HTTP após login, cadastro
ou restauração. Login e cadastro não enviam esse header. O backend não fornece
refresh token; uma sessão expirada exige novo login.

## Autenticação e sessão

`AuthProvider` expõe `user`, `isAuthenticated`, `restoring`, `restoreError`,
`restore` e `logout` por `useAuth`. `useLogin` e `useRegister` usam mutations sem
retry automático. As telas validam campos antes do envio e apresentam mensagens
de carregamento, sucesso e erro. O backend continua sendo a autoridade de validação.

O SecureStore persiste apenas `token`, `usuarioId`, `nome`, `email` e `tipoUsuario`.
Senhas não são persistidas ou registradas no console. A restauração verifica a
expiração do JWT localmente; a API valida sua assinatura nas chamadas protegidas.
O logout remove a sessão segura, limpa o token em memória e cancela/limpa o cache.
A proteção completa das rotas ainda não foi implementada.

O cadastro solicita os quatro campos aceitos pela API: nome, email, senha e tipo
de usuário. Foto, CPF e CRMV não fazem parte desse contrato. A exclusão de conta
pela interface ainda não está integrada. A antiga lista local de usuários foi
removida; a seleção de veterinários consulta `/api/usuarios` sem persistir contas.

Para verificar no Android/iOS: configure a API, cadastre uma conta, saia, teste
uma senha incorreta, entre com a senha correta, feche e reabra o app e confirme
o perfil restaurado. Saia novamente e reabra para confirmar que a sessão foi removida.

O teste `node --test tests/auth.integration.test.js` usa `EXPO_PUBLIC_API_URL`
do ambiente, cadastra uma conta temporária com credenciais aleatórias e a remove
ao terminar. Execute somente contra uma base de desenvolvimento descartável.
Ele valida o cliente e o ciclo de sessão contra o backend real; o armazenamento
nesse teste é um arquivo temporário. A persistência nativa do SecureStore requer
validação em dispositivo ou emulador. Não há credenciais de demonstração no app.

O cliente centraliza JSON, headers e timeout de 15 segundos. Uma chamada sem URL
válida produz `ApiError`; os erros expõem `message`, `code` e `status` seguros,
sem incluir corpos de erro do servidor ou credenciais.

Execute `npm test` com Node.js 22.7 ou superior para validar a camada sem servidor.
Os testes substituem o transporte de rede somente durante sua execução.
A leitura IoT usa `src/api/dobuCam.js` e o mesmo transporte HTTP centralizado.
O endereço do dispositivo continua sendo informado na tela, separado da URL base
do backend configurada no ambiente. Requisições ao dispositivo nunca enviam o
token de autenticação do backend.

## Iniciar o projeto

```bash
npx expo start
```

## Executar no Android

Com o Metro aberto, pressione:

```bash
a
```

Também é possível abrir pelo Expo Go usando o QR Code exibido no terminal.

Para limpar o cache durante testes:

```bash
npx expo start -c
```

---

# Teste do AsyncStorage

Para validar a persistência local:

1. Crie um usuário.
2. Cadastre um animal.
3. Crie um agendamento.
4. Confira os pontos no perfil ou na tela inicial.
5. Recarregue ou reinicie o aplicativo.
6. Abra novamente e confirme se usuário, animal, agendamento e pontos continuam salvos.

## Chaves Utilizadas

```js
@dobu:pets
@dobu:agendamentos
@dobu:monitoramento
@dobu:pontos
```

---

## Links:

- Youtube: https://youtu.be/Z82Qn_hXZEY?si=1N98I5WYqMi_j_AL
- Protótipo figma: https://www.figma.com/design/mOXmQd2t8nKM3tjBE9g5Dn/Challenge?node-id=0-1&t=0iOFcpAzaf11TImb-1
- Repositório: https://github.com/DobuChallenge/Dobu-Mobile

---

# Integrantes

- Amandha Yumi Toyota Artulino - RM: 563549
- Giovanna Bardella Gomes - RM: 561439
- Erick Takeshi Nakajune - RM: 566059

---

# Observações

Este projeto foi desenvolvido para fins acadêmicos na disciplina de Mobile Application Development. Os dados são simulados e armazenados localmente para demonstrar o funcionamento do protótipo.
