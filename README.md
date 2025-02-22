# 📰 TheNews Backend

Este é o backend para o case **TheNews**, responsável por processar requisições recebidas periodicamente de um webhook, armazenando informações de usuários e posts no banco de dados **Cloudflare D1**. Implementando também, um sistema de Streak, para a sequência de aberturas da *newsletter*.

## 📌 **Sumário**
- [📰 TheNews Backend](#-thenews-backend)
  - [📌 **Sumário**](#-sumário)
  - [📌 **Visão Geral**](#-visão-geral)
  - [Hono](#hono)
  - [🚀 **Tecnologias Usadas**](#-tecnologias-usadas)
  - [⚙️ **Configuração do Projeto**](#️-configuração-do-projeto)
    - [**1️⃣ Clone o repositório**](#1️⃣-clone-o-repositório)
    - [**2️⃣ Instale as dependências**](#2️⃣-instale-as-dependências)
    - [**3️⃣ Configure o Wrangler**](#3️⃣-configure-o-wrangler)
    - [**5️⃣ Rode o projeto em ambiente local**](#5️⃣-rode-o-projeto-em-ambiente-local)
  - [🛠️ **Configuração do Banco D1**](#️-configuração-do-banco-d1)
    - [**1️⃣ Criar tabelas**](#1️⃣-criar-tabelas)
    - [**2️⃣ Verificar se o banco foi criado corretamente**](#2️⃣-verificar-se-o-banco-foi-criado-corretamente)
  - [📡 **Endpoints Disponíveis**](#-endpoints-disponíveis)
    - [🔹 **1️⃣ Rota Principal (Webhook)**](#-1️⃣-rota-principal-webhook)
  - [**TO DO List**](#to-do-list)
- [**📋 Relatório de Análise do Backend**](#-relatório-de-análise-do-backend)
  - [📌 **Stacks**](#-stacks)
    - [**Quais as tecnologias usadas?**](#quais-as-tecnologias-usadas)
    - [**Quais problemas você enfrentou ao desenvolver?**](#quais-problemas-você-enfrentou-ao-desenvolver)
    - [**Qual a organização que escolheu e por quê?**](#qual-a-organização-que-escolheu-e-por-quê)
  - [**2️⃣ Dados**](#2️⃣-dados)
    - [**Qual a estrutura do seu SQL?**](#qual-a-estrutura-do-seu-sql)
      - [**📌 Tabela `users` (armazenamento de usuários e streaks)**](#-tabela-users-armazenamento-de-usuários-e-streaks)
      - [**📌 Tabela `posts` (armazenamento de edições de newsletter)**](#-tabela-posts-armazenamento-de-edições-de-newsletter)
    - [**Como você lida com as inserções e consultas dos leitores?**](#como-você-lida-com-as-inserções-e-consultas-dos-leitores)
    - [**Ele é escalável? Explique.**](#ele-é-escalável-explique)
  - [**3️⃣ Testes**](#3️⃣-testes)
    - [**Quais testes você realizou?**](#quais-testes-você-realizou)
    - [**Quanto tempo levou o desenvolvimento e testes?**](#quanto-tempo-levou-o-desenvolvimento-e-testes)
  - [**📌 Conclusão Final**](#-conclusão-final)

---

## 📌 **Visão Geral**
O backend recebe **requisições a cada 1 hora**, contendo os parâmetros:
- **email** → Endereço de e-mail do usuário
- **id** → Identificador único do post (exemplo: `post_2025-02-16`)
- **utm_source, utm_medium, utm_campaign, utm_channel** → Informações opcionais de tracking

Com base nisso, o sistema:
- **Verifica se o post já existe** → Se não, cadastra no banco.
- **Verifica se o email já existe**:
  - Se **sim**, **incrementa o número de aberturas, atualiza o streak, verifica se é uma nova data de postagem, adicionando ou não em readPosts**. Por fim, atualiza a data de última abertura.
  - Se **não**, **cadastra o usuário no banco**.
---


## Hono
Por padrão, a aplicação está utilizando o framework *Hono* para manipulação das rotas, pois vi que vocês utilizam ele para integrações. Porém, como não era algo requerido no projeto e eu não tinha certeza se poderia usar, decidi elaborar duas versões. No arquivo **wrangler.jsonc** você pode alterar o trecho:
```jsonc
  "main": "src/app.ts", // lembrando que caso você esteja utilizando o Hono, os arquivos index.ts e routes.ts, não são utilizados. 
```

para:
```jsonc
  "main": "src/index.ts",
```

Assim, a aplicação não vai utilizar o Hono.


## 🚀 **Tecnologias Usadas**
- **Cloudflare Workers** → Servidor sem necessidade de infraestrutura.
- **Cloudflare D1** → Banco de dados relacional baseado em SQLite.
- **TypeScript** → Código tipado e mais seguro.
- **Wrangler** → CLI oficial do Cloudflare para desenvolvimento e deploy.
- **Hono**  → Criação das rotas e definição das mesmas.

---

## ⚙️ **Configuração do Projeto**
### **1️⃣ Clone o repositório**
```sh
git clone https://github.com/fatekkl/thenews-backend.git
cd thenews-backend
```

### **2️⃣ Instale as dependências**
```sh
npm install
```

### **3️⃣ Configure o Wrangler**
**Edite o arquivo `wrangler.jsonc` para incluir o banco D1:**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "thenews-backend",
  "main": "src/app.ts", // Esse trecho pode estar como  "main": "src/index.ts". não há problema
  "compatibility_date": "2025-02-14",
  "d1_databases": [
    {
      "binding": "D1_DB",
      "database_name": "thenews-database",
      "database_id": "SUA_DATABASE_ID"
    }
  ]
}
```
Obtenha o `database_id` no painel do Cloudflare.


### **5️⃣ Rode o projeto em ambiente local**
```sh
npx wrangler dev
```

---

## 🛠️ **Configuração do Banco D1**
### **1️⃣ Criar tabelas**
Se for a primeira vez rodando o projeto, crie as tabelas:

```sh
npx wrangler d1 execute thenews-database --local --command "
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_channel TEXT,
    openings INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_open_date TEXT,
    read_posts JSON
  );
"
```

```sh
npx wrangler d1 execute thenews-database --local --command "
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    resource_id TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
"
```

### **2️⃣ Verificar se o banco foi criado corretamente**
```sh
npx wrangler d1 execute thenews-database --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 📡 **Endpoints Disponíveis**
### 🔹 **1️⃣ Rota Principal (Webhook)**
```http
GET /
```
📌 **Descrição:**  
Processa cada requisição do webhook, cadastrando **posts** e **usuários**. A rota é feita para receber as requisições do webhook, sendo que cada requests feito pra ela, representa uma leitura, seja de um usuário já cadastrado ou novo.

📌 **Parâmetros Query:**
| Parâmetro     | Tipo   | Obrigatório | Descrição |
|--------------|--------|------------|-------------|
| `email`      | `string` | ✅ Sim | Email do usuário |
| `id`         | `string` | ✅ Sim | ID único do post |
| `utm_source` | `string` | ❌ Não | Origem da campanha |
| `utm_medium` | `string` | ❌ Não | Meio da campanha |
| `utm_campaign` | `string` | ❌ Não | Nome da campanha |
| `utm_channel` | `string` | ❌ Não | Canal de tráfego |

📌 **Exemplo de Requisição:**
```
GET /?email=teste@email.com&id=post_2025-02-16&utm_source=google&utm_medium=cpc&utm_campaign=promo&utm_channel=youtube
```
📌 **Exemplo de Resposta:**
```json
{
    "user": {
        "success": true,
        "email": "teste@email.com",
        "utm_source": "google",
        "utm_medium": "cpc",
        "utm_campaign": "promo",
        "utm_channel": "youtube",
        "openings": 1,
        "streak": 1
    },
    "post": {
        "success": true,
        "resource_id": "post_2025-02-16"
    }
}
```


## **TO DO List**  

Uma pequena tabela, com anotações sobre tarefas que tenho que fazer, para minha organização. 😀

- [x] Criar estrutura inicial da API  
- [x] Configurar TypeScript e Express  
- [x] Estruturar a recepção dos dados da **beehiiv** para envio ao FrontEnd 
- [x] Parou de encerrar a aplicação, quando o Post já existe. Agora está fazendo log no console, apenas avisando que o post já existe
- [x] Criar rota que recebe os dados diretamente do Webhook do The News e retorna eles em JSON
- [x] Requests repetidas do mesmo e-mail, representam uma abertura a mais daquele email, adicionar contador de aberturas, que aumenta a cada request daquele email
- [x] Atualizar last_opened em users quando addPost() for executado 
- [x] Resolver erros de lógica, na criação de tabelas & gerenciamento dos dados para criar streaks e openings
- [x] Verificar forma que os dados estão sendo salvos, relacionados a UTMS 
- [x] Requests repetidas do mesmo e-mail, em dias diferentes, representam uma streak a mais. Adicionar contador, que reseta a cada 24 horas sem requests.
- [x] Adicionar lógica na Streak
- [x] Aplicar boas práticas e criar classes mais fáceis de entender
- [x] Salvar todos os posts lidos do usuário
- [x] Validar dados de forma precisa, Email já esta validado, validar ID
- [x] Criar versão do sem o Hono
- [x] Revisar toda documentação quando o projeto encerrar



# **📋 Relatório de Análise do Backend**


## 📌 **Stacks**
### **Quais as tecnologias usadas?**
✅ **Linguagem & Frameworks**  
- **TypeScript** → Código tipado e mais seguro.  
- **Hono** → Framework minimalista para Cloudflare Workers.  

✅ **Infraestrutura & Banco de Dados**  
- **Cloudflare Workers** → Servidor serverless escalável.  
- **Cloudflare D1** → Banco relacional baseado em SQLite.  
- **Cloudflare Pages** → Hospedagem do frontend.  

✅ **Ferramentas & Deploy**  
- **Wrangler** → CLI oficial do Cloudflare para deploy e desenvolvimento.  
- **Cloudflare Cache** → Para otimização de resposta e redução de carga no banco.  

---

### **Quais problemas você enfrentou ao desenvolver?**

| Problema | Solução |
|----------|---------|
| ❌ Cache inicial não estava funcionando corretamente | **Centralizei a lógica de cache** na função `handleCache()`, evitando redundância. |
| ❌ Queries SQL poderiam ser mais otimizadas | **Usei prepared statements** (`prepare().all()`) para segurança e performance. |
| ❌ O streak não era atualizado corretamente em algumas situações | **Implementei um reset automático de streak** caso o usuário não acessasse em 24 horas. |
| ❌ Cloudflare D1 tem limitações comparado ao SQLite tradicional | **Evitei operações complexas como JOINs pesados** e foquei em consultas mais diretas. |

---

### **Qual a organização que escolheu e por quê?**

📌 **Estrutura Modular e Escalável**
- **`models/types.ts`** → Interfaces que estabelecem regras a serem seguidas no retorno
- **`services/`** → Funções que manipulam a lógica de negócio.  
- **`utils/`** → Funções auxiliares para interações com o banco.  
- **`app.ts`** → Configuração principal do servidor Hono e das rotas.  

✅ **Motivos**: 

✔ Facilita manutenção e reuso de código.  
✔ Reduz acoplamento entre as partes do sistema.  
✔ Permite escalar sem precisar reescrever a API.

---

## **2️⃣ Dados**

### **Qual a estrutura do seu SQL?**

O **banco Cloudflare D1** possui duas tabelas principais:

#### **📌 Tabela `users` (armazenamento de usuários e streaks)**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_channel TEXT,
  openings INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_open_date TEXT,
  read_posts JSON
);
```

#### **📌 Tabela `posts` (armazenamento de edições de newsletter)**
```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  resource_id TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### **Como você lida com as inserções e consultas dos leitores?**

📌 **Fluxo de execução quando um usuário abre um post:**
1. **Verifica se o post já existe** → Se não, cadastra no banco.  
2. **Verifica se o usuário já existe**:
   - Se **sim**, atualiza `openings`, `streak` e `read_posts`.  
   - Se **não**, cadastra o usuário e inicia os contadores.  
3. **Cacheia a resposta no Cloudflare Workers para evitar consultas repetitivas**.

---

### **Ele é escalável? Explique.**

✅ **Sim, a API foi projetada para ser escalável**:

✔ **Uso de Cloudflare Workers** → Sem necessidade de servidores, escalando automaticamente.  
✔ **Banco de dados D1** → Melhor desempenho para consultas rápidas.  
✔ **Cache no Cloudflare Workers** → Reduz consultas ao banco e melhora tempo de resposta.  
✔ **Queries otimizadas com `prepare().all()`** → Evita sobrecarga no D1.  

🔹 **Melhorias para escalabilidade futura**:  
- **Implementar sharding no D1** para distribuir a carga em múltiplas instâncias.  
- **Considerar PostgreSQL via Cloudflare R2** caso a base cresça muito.  

---

## **3️⃣ Testes**

### **Quais testes você realizou?**
✅ **Testes Manuais**  
✔ Inserção e atualização de usuários.  
✔ Teste de streaks com múltiplas datas.  
✔ Validação de cache no Cloudflare Workers.  

✅ **Testes de Performance**  
✔ Comparação do tempo de resposta com e sem cache → **A 2ª requisição foi até 1.5x mais rápida**.  
✔ Simulação de requisições simultâneas para verificar carga no D1.  

---

### **Quanto tempo levou o desenvolvimento e testes?**

🕐 **Tempo total: 9 dias**  

📌 **Linha do Tempo**  
- **Dias 1-4** → Estruturação do projeto e banco de dados.  
- **Dias 5-6** → Implementação das rotas e lógica do streak.  
- **Dias 7-9** → Testes, otimizações e documentação.  

✅ **Resultado Final**: Backend funcional, escalável e otimizado para responder rapidamente às requisições.

---

## **📌 Conclusão Final**
💡 **Principais pontos fortes do backend:**  
✔ Código modular e bem organizado.  
✔ Uso de **cache** para reduzir tempo de resposta.  
✔ **Banco de dados eficiente**, com queries otimizadas.  
✔ **Sistema de streak validado e funcional.**  

📌 **Melhorias futuras:**  
- **Melhorar logs detalhados** para debugging mais eficiente.  
- **Implementar testes automatizados** para evitar regressões.  
- **Explorar PostgreSQL** caso a escala aumente significativamente.  

---

🔹 **Resumo Final:**  
A API foi projetada para **ser rápida, escalável e fácil de manter**, utilizando **Cloudflare Workers, D1 e caching inteligente**. O **sistema de streak funciona corretamente**, e a **infraestrutura pode ser expandida sem grandes modificações**. 🚀🔥  

---
