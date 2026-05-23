# Dobu Mobile

Dobu Mobile é um protótipo funcional desenvolvido em React Native com Expo. A proposta é ajudar responsáveis e profissionais veterinários a organizar informações importantes da rotina de cuidado dos animais.

O aplicativo reúne cadastro de usuários, login simulado, gerenciamento de pets, lembretes, agendamentos, guia de informações e uma simulação de monitoramento pela Dobu-Cam. O projeto usa navegação entre telas, formulários controlados com `useState` e persistência local com AsyncStorage.

---

# Objetivo do Projeto

O objetivo do Dobu Mobile é centralizar dados importantes da vida do animal e apoiar o cuidado preventivo no dia a dia.

Com o app, o usuário consegue:

- cadastrar responsáveis e veterinários;
- fazer login simulado;
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
- Expo Image Picker
- Expo File System
- @expo/vector-icons

---

# Funcionalidades Implementadas

## Navegação e Autenticação

- Tela de carregamento;
- Tela inicial;
- Cadastro de usuário;
- Login simulado;
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

- usuário logado;
- lista de usuários;
- pets;
- agendamentos;
- monitoramento;
- pontos por usuário.

Ao recarregar ou reiniciar o aplicativo, o app consulta o usuário salvo e retorna ao fluxo correto. Os dados cadastrados continuam disponíveis localmente.

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
@dobu:usuario
@dobu:usuarios
@dobu:pets
@dobu:agendamentos
@dobu:monitoramento
@dobu:pontos
```

---

## Links:

- Youtube: https://youtu.be/XzJ-ypr5y4I?si=5H6fLvWJC_rbiyBX
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
