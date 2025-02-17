# 📰 TheNews Backend

Este é o backend do **TheNews**, responsável por processar requisições recebidas periodicamente de um webhook, armazenando informações de usuários e posts no banco de dados **Cloudflare D1**.

## 📌 **Sumário**
- [📌 Visão Geral](#-visão-geral)
- [🚀 Tecnologias Usadas](#-tecnologias-usadas)
- [⚙️ Configuração do Projeto](#️-configuração-do-projeto)
- [🛠️ Configuração do Banco D1](#️-configuração-do-banco-d1)
- [📡 Endpoints Disponíveis](#-endpoints-disponíveis)
- [📝 Exemplo de Uso](#-exemplo-de-uso)
- [🔧 Contribuição](#-contribuição)

---

## 📌 **Visão Geral**
O backend recebe **requisições a cada 1 hora**, contendo os parâmetros:
- **email** → Endereço de e-mail do usuário
- **id** → Identificador único do post (exemplo: `post_2025-02-16`)
- **utm_source, utm_medium, utm_campaign, utm_channel** → Informações opcionais de tracking

Com base nisso, o sistema:
- **Verifica se o post já existe** → Se não, cadastra no banco.
- **Verifica se o email já existe**:
  - Se **sim**, **incrementa o número de aberturas** e atualiza a data de última abertura.
  - Se **não**, **cadastra o usuário no banco**.

---

## 🚀 **Tecnologias Usadas**
- **Cloudflare Workers** → Servidor sem necessidade de infraestrutura.
- **Cloudflare D1** → Banco de dados relacional baseado em SQLite.
- **TypeScript** → Código tipado e mais seguro.
- **Wrangler** → CLI oficial do Cloudflare para desenvolvimento e deploy.

---

## ⚙️ **Configuração do Projeto**
### **1️⃣ Clone o repositório**
```sh
git clone https://github.com/seu-usuario/thenews-backend.git
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
  "main": "src/index.ts",
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

### **4️⃣ Configure as variáveis de ambiente**
Se precisar de variáveis sensíveis, configure com:
```sh
npx wrangler secret put MINHA_VARIAVEL
```

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
    last_open_date TEXT
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
Processa cada requisição do webhook, cadastrando **posts** e **usuários**.

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
  "user": { "success": true, "code": 201, "data": { "email": "teste@email.com" } },
  "post": { "success": true, "post_id": 1, "resource_id": "post_2025-02-16", "created_at": "2025-02-16T00:00:00.000Z" }
}
```

---

### 🔹 **2️⃣ Criar Usuário**
```http
GET /add_user
```
📌 **Descrição:**  
Cria um novo usuário.

📌 **Parâmetros Query:**
| Parâmetro     | Tipo   | Obrigatório | Descrição |
|--------------|--------|------------|-------------|
| `email`      | `string` | ✅ Sim | Email do usuário |
| `utm_source` | `string` | ❌ Não | Origem da campanha |
| `utm_medium` | `string` | ❌ Não | Meio da campanha |
| `utm_campaign` | `string` | ❌ Não | Nome da campanha |
| `utm_channel` | `string` | ❌ Não | Canal de tráfego |

📌 **Exemplo de Requisição:**
```
GET /add_user?email=teste@email.com&utm_source=google&utm_medium=cpc&utm_campaign=promo&utm_channel=youtube
```
📌 **Exemplo de Resposta:**
```json
{
  "success": true,
  "code": 201,
  "data": { "email": "teste@email.com" }
}
```

---

### 🔹 **3️⃣ Criar Post**
```http
GET /add_post
```
📌 **Descrição:**  
Cria um novo post no banco de dados.

📌 **Parâmetros Query:**
| Parâmetro  | Tipo   | Obrigatório | Descrição |
|------------|--------|------------|-------------|
| `email`    | `string` | ✅ Sim | Email do usuário |
| `id`       | `string` | ✅ Sim | ID único do post |

📌 **Exemplo de Requisição:**
```
GET /add_post?email=teste@email.com&id=post_2025-02-16
```
📌 **Exemplo de Resposta:**
```json
{
  "success": true,
  "post_id": 1,
  "resource_id": "post_2025-02-16",
  "created_at": "2025-02-16T00:00:00.000Z"
}
```

## **TO DO List**  

Uma pequena tabela, com anotações sobre tarefas que tenho que fazer, para minha organização. 😀

### **Backend**  
- [x] Criar estrutura inicial da API  
- [x] Configurar TypeScript e Express  
- [x] Estruturar a recepção dos dados da **beehiiv** para envio ao FrontEnd 
- [x] Parou de encerrar a aplicação, quando o Post já existe. Agora está fazendo log no console, apenas avisando que o post já existe
- [x] Criar rota que recebe os dados diretamente do Webhook do The News e retorna eles em JSON
- [x] Requests repetidas do mesmo e-mail, representam uma abertura a mais daquele email, adicionar contador de aberturas, que aumenta a cada request daquele email
- [x] Atualizar last_opened em users quando addPost() for executado 
- [x] Resolver erros de lógica, na criação de tabelas & gerenciamento dos dados para criar streaks e openings
- [ ] Requests repetidas do mesmo e-mail, em dias diferentes, representam uma streak a mais. Adicionar contador, que reseta a cada 24 horas sem requests.
- [ ] Adicionar lógica na Streak