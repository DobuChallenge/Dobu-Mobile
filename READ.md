# Dobu Mobile 🐾

Dobu Mobile é um protótipo mobile desenvolvido em React Native com Expo, criado para auxiliar responsáveis no acompanhamento da rotina e dos cuidados diários com seus pets de forma simples, prática e organizada.

A aplicação reúne funcionalidades voltadas para monitoramento, lembretes, agendamentos veterinários e gerenciamento de informações dos animais, utilizando persistência local e recursos nativos do dispositivo.

O projeto também apresenta a proposta da **Dobu-CAM**, um sistema de monitoramento pensado para pets que necessitam de maior supervisão em ambientes internos.

---

# 📱 Objetivo do Projeto

O objetivo do Dobu Mobile é auxiliar responsáveis por animais no acompanhamento da rotina e dos cuidados diários dos pets de forma simples e organizada.

A aplicação permite que o usuário:

- acompanhe informações importantes sobre o animal;
- organize lembretes e consultas;
- realize agendamentos veterinários;
- monitore a rotina do pet;
- visualize informações e orientações relacionadas ao cuidado animal.

Além da área do responsável, o projeto também possui uma proposta voltada para clínicas e profissionais veterinários, facilitando o acesso a informações e ao gerenciamento de atendimentos de forma prática e acessível.

---

# 🐶 Sobre a Dobu-CAM

A Dobu-CAM foi criada para auxiliar responsáveis no monitoramento de seus pets em ambientes internos, especialmente animais que necessitam de maior supervisão devido à:

- idade avançada;
- problemas de saúde;
- recuperação pós-cirúrgica;
- necessidade de acompanhamento constante.

A proposta é permitir que o usuário acompanhe visualmente o animal e mantenha uma rotina preventiva de cuidados através do aplicativo.

---

# 🚀 Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo Camera
- Expo Image Picker
- Expo File System
- @expo/vector-icons

---

# ✨ Funcionalidades Implementadas

## 🔐 Navegação e Autenticação
- Tela de splash/loading personalizada;
- Tela de boas-vindas;
- Login simulado;
- Cadastro de usuário;
- Navegação entre múltiplas telas utilizando React Navigation.

## 🐾 Gerenciamento de Pets
- Cadastro de pets;
- Pré-visualização dinâmica enquanto o usuário digita;
- Manipulação de estado com `useState`;
- Lista de pets cadastrados;
- Perfil individual de cada pet.

## 📸 Monitoramento e Câmera
- Captura de fotos utilizando a câmera do dispositivo;
- Armazenamento local das imagens;
- Simulação visual de monitoramento pet através da Dobu-CAM.

## 📅 Rotina e Agendamentos
- Sistema de lembretes;
- Agendamento de consultas veterinárias;
- Organização de eventos em calendário simples;
- Mock de vacinas, check-ups, medicamentos e vermífugos.

## 🏆 Sistema de Pontuação
O aplicativo possui uma lógica simples de gamificação para incentivar o cuidado contínuo com os pets.

O usuário ganha pontos ao:

- acessar o aplicativo;
- cadastrar novos pets;
- utilizar funcionalidades do sistema.

A pontuação é exibida na Home e no Perfil do usuário.

## 💾 Persistência Local
Persistência de dados utilizando AsyncStorage:

- Usuário;
- Pets;
- Agendamentos;
- Fotos;
- Pontuação.

Os dados continuam salvos mesmo após reiniciar o aplicativo.

---

# 🧠 Conceitos Aplicados

O projeto aplica conteúdos trabalhados em aula como:

- Navegação entre telas;
- Manipulação de estado com `useState`;
- Componentização;
- Persistência local com AsyncStorage;
- Manipulação de formulários;
- Uso de câmera e arquivos;
- Estruturação de aplicação React Native;
- Fluxo de interface mobile.

---

# 📂 Estrutura do Projeto

```bash
src/
 ├── assets/
 ├── components/
 ├── routes/
 ├── screens/
 ├── storage/
 ├── styles/
 └── services/
```

---

# ▶️ Como Executar o Projeto

## Instalar dependências

```bash
npm install
```

## Iniciar o projeto

```bash
npm expo start
```

## Executar no Android

```bash
a
```

Abra o aplicativo no Expo Go utilizando o QR Code exibido no terminal.

---

# 💾 Teste do AsyncStorage

Para validar a persistência local:

1. Crie um usuário;
2. Cadastre um pet;
3. Tire uma foto utilizando a câmera;
4. Adicione um agendamento;
5. Feche ou recarregue o aplicativo;
6. Abra novamente e verifique se os dados continuam salvos.

## Chaves utilizadas

```js
@dobu:usuario
@dobu:pets
@dobu:agendamentos
@dobu:pontos
```

---

# 🎥 Vídeo Demonstrativo

📎 Link do vídeo no YouTube:  


---

# 👨‍💻 Integrantes

- Amandha Yumi Toyota Artulino — RM: 563549
- Giovanna Bardella Gomes — RM: 561439
- Erick Takeshi Nakajune — RM: 566059

---

# 📌 Observações

Este projeto foi desenvolvido para fins acadêmicos na disciplina de Mobile Application Development, utilizando dados mockados e funcionalidades simuladas para representar a proposta da solução.