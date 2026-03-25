# 🚀 InvestPro Backend — Guia de Deploy no Railway

## Pré-requisitos
- Conta no GitHub (gratuita)
- Conta no Railway: https://railway.app (gratuita)

---

## Passo 1 — Subir o backend no GitHub

1. Crie um repositório **privado** no GitHub chamado `investpro-backend`
2. Dentro da pasta `investpro-backend/`, abra o terminal e execute:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/investpro-backend.git
git push -u origin main
```

---

## Passo 2 — Criar o projeto no Railway

1. Acesse https://railway.app e faça login com o GitHub
2. Clique em **"New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione o repositório `investpro-backend`
5. Railway detecta Node.js automaticamente — clique **Deploy**

---

## Passo 3 — Adicionar PostgreSQL

1. No painel do projeto, clique em **"+ New"**
2. Escolha **"Database" → "Add PostgreSQL"**
3. Railway cria o banco e adiciona `DATABASE_URL` automaticamente

---

## Passo 4 — Configurar variáveis de ambiente

No Railway, clique em seu serviço Node → aba **"Variables"** → adicione:

| Variável | Valor |
|---|---|
| `JWT_SECRET` | Execute: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` e cole o resultado |
| `ADMIN_EMAIL` | seu@email.com |
| `ADMIN_PASSWORD` | UmaSenhaForte123! |
| `ADMIN_NAME` | Seu Nome |
| `FRONTEND_URL` | https://seuusuario.github.io |
| `NODE_ENV` | production |

> ⚠️ **IMPORTANTE**: `JWT_SECRET` deve ser longo e aleatório. Nunca compartilhe.

---

## Passo 5 — Obter a URL do backend

1. No Railway, clique em seu serviço → aba **"Settings"**
2. Em "Domains", clique **"Generate Domain"**
3. Você receberá uma URL como: `https://investpro-backend-production.up.railway.app`
4. Teste: `https://SUA_URL/health` → deve retornar `{"status":"ok"}`

---

## Passo 6 — Configurar o frontend

No arquivo `InvestPro.html`, localize a linha:

```javascript
const API_URL = "http://localhost:3001";
```

E substitua pela sua URL do Railway:

```javascript
const API_URL = "https://investpro-backend-production.up.railway.app";
```

---

## Estrutura das rotas da API

### Autenticação (pública)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login com e-mail e senha |
| POST | `/auth/logout` | Logout (invalida token) |
| GET | `/auth/me` | Dados do usuário logado |
| PUT | `/auth/password` | Altera própria senha |

### Admin (só Admin Master)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/users` | Lista todos os usuários |
| POST | `/admin/users` | Cria novo usuário |
| PUT | `/admin/users/:id` | Edita nome/perfil/status |
| PUT | `/admin/users/:id/modules` | Define módulos do usuário |
| DELETE | `/admin/users/:id` | Remove usuário |
| GET | `/admin/modules` | Lista módulos disponíveis |

### Dados (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/data` | Carrega todos os dados do usuário |
| GET | `/data/:key` | Carrega uma chave específica |
| PUT | `/data/:key` | Salva dados (`{ "value": {...} }`) |

---

## Perfis e permissões padrão

| Módulo | Admin | Usuário | Convidado |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Investimentos | ✅ | ✅ | ❌ |
| Minha Renda | ✅ | ✅ | ❌ |
| Aportes | ✅ | ✅ | ❌ |
| Projeção | ✅ | ✅ | ✅ |
| Comparador | ✅ | ✅ | ✅ |
| Cotações | ✅ | ✅ | ✅ |
| Categorias | ✅ | ✅ | ❌ |
| Config / Admin | ✅ | ❌ | ❌ |

---

## Testando localmente

```bash
cd investpro-backend
npm install

# Copie o .env.example para .env e preencha
cp .env.example .env

# Inicie o servidor
npm run dev
```

O servidor sobe em `http://localhost:3001`

Teste o login:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"SuaSenha"}'
```
