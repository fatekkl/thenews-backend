# 📰 **TheNews Backend**

Este é o backend para o **TheNews**, responsável por processar requisições recebidas periodicamente de um webhook, armazenando informações de usuários e posts no banco de dados **Cloudflare D1**. Implementa também um sistema de **Streak**, para rastrear a sequência de aberturas da *newsletter*.

---

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

