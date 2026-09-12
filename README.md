# Dobu Mobile

Projeto desenvolvido para a **Sprint 3 de Mobile Application Development**.

O **Dobu** é um aplicativo mobile voltado à organização da rotina de cuidados de pets, permitindo que responsáveis e veterinários gerenciem animais, atendimentos, lembretes, vacinas e outras informações importantes em um único ambiente.

O aplicativo foi desenvolvido em **React Native com Expo** e integrado à **API REST Dobu desenvolvida em .NET**.

---

## Objetivo do Projeto

O objetivo do Dobu Mobile é centralizar informações importantes sobre a saúde e a rotina dos animais, facilitando o acompanhamento por responsáveis e profissionais veterinários.

A aplicação conta com autenticação, gerenciamento de pets e agendamentos, consulta de informações veterinárias e recursos específicos para responsáveis e veterinários.

---

## Funcionalidades

### Autenticação e Navegação

* Cadastro de responsável e veterinário;
* Login integrado à API;
* Sessão persistida com Expo SecureStore;
* Logout;
* Restauração automática da sessão;
* Telas internas protegidas por autenticação;
* Fluxos específicos para responsável e veterinário;
* Navegação utilizando React Navigation.

### Gerenciamento de Pets

CRUD completo de pets integrado à API:

* Cadastro de pets;
* Listagem de pets;
* Consulta individual;
* Atualização dos dados;
* Exclusão;
* Associação do animal a uma raça;
* Perfil individual do animal.

### Agendamentos

CRUD completo de agendamentos integrado à API:

* Cadastro;
* Listagem;
* Consulta;
* Atualização;
* Exclusão;
* Associação com pets;
* Data e horário;
* Status do atendimento;
* Veterinário responsável.

Os agendamentos também são utilizados para gerar lembretes de próximos atendimentos.

### Guia de Raças

O aplicativo permite consultar raças cadastradas na API, apresentando informações como:

* Espécie;
* Porte;
* Expectativa de vida;
* Descrição;
* Cuidados recomendados.

### Vacinas

A tela de informações permite consultar as vacinas cadastradas para cada pet, incluindo:

* Nome da vacina;
* Data de aplicação;
* Data da próxima dose;
* Pet relacionado.

### Caderno de Observações

Cada animal possui um espaço destinado ao registro de observações e informações importantes para acompanhamento de sua rotina.

### Perfil do Usuário

O aplicativo possui telas específicas de perfil para os diferentes tipos de usuário, permitindo visualizar informações da conta e acessar funcionalidades relacionadas ao seu perfil.

### Painel do Veterinário

Veterinários possuem um fluxo próprio no aplicativo, com acesso às informações necessárias para acompanhamento dos animais e atendimentos.

### Dobu-Cam

A Dobu-Cam representa um recurso de monitoramento dentro do ecossistema Dobu, permitindo trabalhar com informações relacionadas ao acompanhamento do ambiente do animal.

---

## Tecnologias

* React Native 0.81;
* Expo SDK 54;
* JavaScript;
* React 19;
* React Navigation;
* TanStack Query;
* Expo SecureStore;
* Expo Image Picker;
* API REST em .NET.

---

## Arquitetura e Organização

O projeto foi dividido em responsabilidades para separar interface, comunicação com a API, autenticação, armazenamento e regras das telas.

```text
src/
  api/          chamadas HTTP
  auth/         sessão e autenticação
  components/   componentes reutilizáveis
  hooks/        lógica de telas e formulários
  navigation/   rotas e proteção de telas
  providers/    Auth e TanStack Query
  screens/      telas do aplicativo
  services/     regras e configurações de queries
  storage/      SecureStore
  styles/       estilos
  utils/        validações e formatação

tests/          testes automatizados
```

---

# Como Executar

Para executar a solução completa, utilize **dois terminais**:

1. Um para a API .NET;
2. Outro para o aplicativo mobile.

## Pré-requisitos

* Node.js 22.7 ou superior;
* npm;
* SDK .NET 9;
* Expo Go compatível com Expo SDK 54;
* Emulador Android ou celular Android conectado à mesma rede do computador.

---

## 1. Executar a API

A API está disponível no repositório `Dobu-.NET` e não precisa estar dentro do repositório do aplicativo mobile.

Caso ainda não tenha o projeto:

```powershell
cd C:\Users\yumizxs\Desktop

git clone https://github.com/DobuChallenge/Dobu-.NET.git
```

Entre no projeto:

```powershell
cd C:\Users\yumizxs\Desktop\Dobu-.NET
```

Configure o ambiente de desenvolvimento:

```powershell
$env:Database__Provider = 'Sqlite'

$env:ConnectionStrings__DobuSqlite = "Data Source=$env:TEMP\dobu-teste-manual.db"

$env:Jwt__Key = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
```

Inicie a API:

```powershell
dotnet run --project "DOBU/Dobu.Api/Dobu.Api.csproj" --no-launch-profile --urls http://0.0.0.0:5099
```

Mantenha esse terminal aberto.

Para verificar se a API está funcionando, acesse:

```text
http://localhost:5099/swagger
```

> Caso exista uma pasta `Dobu-.NET` incompleta dentro do repositório mobile, ela pode ser ignorada. A execução do aplicativo utiliza o repositório da API separadamente.

---

## 2. Configurar o Aplicativo

Abra outro terminal:

```powershell
cd C:\Users\yumizxs\Desktop\Dobu-Mobile

npm.cmd ci
```

Crie o arquivo de configuração local caso ele ainda não exista:

```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Depois, configure a URL da API no arquivo `.env.local`.

### Emulador Android

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:5099
```

O endereço `10.0.2.2` permite que o emulador Android acesse o `localhost` do computador.

### Celular Android

Descubra o IPv4 do computador:

```powershell
ipconfig
```

Configure o `.env.local` utilizando esse endereço:

```dotenv
EXPO_PUBLIC_API_URL=http://IP-DO-COMPUTADOR:5099
```

Exemplo:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.10:5099
```

> No celular físico, não utilize `localhost`, pois ele representa o próprio celular e não o computador onde a API está sendo executada.

---

## 3. Executar o Aplicativo

Execute:

```powershell
npx.cmd expo start -c
```

### Emulador Android

Com o Metro aberto, pressione:

```text
a
```

### Celular Android

Abra o **Expo Go** e escaneie o QR Code apresentado no terminal.

---

# Primeiro Acesso

Ao utilizar uma base de dados nova, inicialmente não existirão usuários, espécies, raças, pets ou vacinas.

Siga esta ordem para preparar os dados:

1. Crie uma conta de **responsável** pelo aplicativo;
2. Crie uma conta de **veterinário** pelo aplicativo;
3. No aplicativo, abra **Cadastrar animal** e use o botão **Preparar catálogo básico** caso ainda não existam espécies e raças;
4. Cadastre um pet utilizando uma das raças disponíveis;
5. Crie agendamentos pelo aplicativo;
6. Para visualizar vacinas na tela de Informações, cadastre uma vacina utilizando `POST /api/vacinas`.

Também é possível cadastrar espécies e raças manualmente pelo Swagger, caso queira usar outros dados na apresentação.

---

## Exemplo de Espécie

```json
{
  "nome": "Canina",
  "descricao": "Espécie dos cães domésticos."
}
```

---

## Exemplo de Raça

Utilize no campo `especieId` o ID retornado ao cadastrar a espécie.

```json
{
  "nome": "Sem raça definida",
  "porte": "Médio",
  "expectativaVida": 12,
  "descricao": "Cadastro usado para teste do aplicativo.",
  "cuidados": "Registrar orientações recebidas no atendimento.",
  "especieId": "ID-DA-ESPECIE"
}
```

---

## Exemplo de Vacina

Utilize no campo `petId` o ID do pet cadastrado.

```json
{
  "nome": "V10",
  "dataAplicacao": "2026-09-12T09:00:00",
  "dataProximaDose": "2027-09-12T09:00:00",
  "petId": "ID-DO-PET"
}
```

---

# Autenticação e Sessão

A autenticação do aplicativo é realizada pela API .NET.

Após login ou cadastro, o aplicativo recebe os dados necessários para estabelecer a sessão do usuário.

A sessão é armazenada utilizando **Expo SecureStore**, sem armazenar a senha do usuário.

Ao reiniciar o aplicativo, uma sessão válida pode ser restaurada automaticamente.

Caso o JWT esteja expirado, será necessário realizar um novo login.

O logout:

* remove a sessão armazenada;
* remove o token utilizado nas chamadas HTTP;
* limpa os dados relacionados à sessão em memória;
* retorna o usuário ao fluxo público da aplicação.

---

# Integração com a API

A configuração da API é centralizada no projeto e utiliza a variável:

```dotenv
EXPO_PUBLIC_API_URL=
```

O aplicativo possui clientes responsáveis pela comunicação com os endpoints da API.

Entre as integrações utilizadas estão:

* autenticação;
* usuários;
* pets;
* agendamentos;
* espécies;
* raças;
* vacinas.

As requisições protegidas utilizam o token JWT da sessão.

> Nunca coloque senhas, tokens privados ou outros secrets diretamente em variáveis `EXPO_PUBLIC_`, pois esses valores podem ficar disponíveis no aplicativo.

---

# Testes

## Testes Automatizados

Execute:

```powershell
npm.cmd test
```

---

## Testes de Integração

Com a API disponível em:

```text
http://127.0.0.1:5099
```

execute:

```powershell
$env:EXPO_PUBLIC_API_URL = 'http://127.0.0.1:5099'

npm.cmd run test:integration

Remove-Item Env:EXPO_PUBLIC_API_URL
```

Os testes de integração utilizam a API real e devem ser executados somente em uma base de desenvolvimento destinada a testes.

---

## Verificar Bundle Android

Execute:

```powershell
npm.cmd run export:android
```

---

# Sobre esta Versão

Nesta Sprint 3, os dois CRUDs completos implementados para atender aos requisitos da disciplina são:

* **Pets**
* **Agendamentos**

Ambos utilizam integração com a API.

A tela **Informações** consulta dados reais de raças e vacinas disponíveis na API e também oferece um caderno de observações por animal.

As fotos utilizadas nos cadastros de usuário e pet são recursos visuais locais do aplicativo. A versão atual da API não realiza persistência dessas imagens.

---

# Links

* **Vídeo da Sprint 3:** 
* **Protótipo no Figma:** https://www.figma.com/design/mOXmQd2t8nKM3tjBE9g5Dn/Challenge
* **Repositório:** https://github.com/DobuChallenge/Dobu-Mobile

---

# Integrantes

* **Amandha Yumi Toyota Artulino** — RM 563549
* **Giovanna Bardella Gomes** — RM 561439
* **Erick Takeshi Nakajune** — RM 566059

---
