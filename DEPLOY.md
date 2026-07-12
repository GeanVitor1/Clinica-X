# Deploy — Railway (API) + Vercel (Frontend)

## Arquitetura

```
Browser ──► Vercel (Angular SPA)
                │
                │ HTTPS + CORS
                ▼
           Railway (ASP.NET API + SignalR)
                │
                ▼
        SQL Server (Azure SQL / Railway / externo)
        Redis (opcional)
```

---

## 1. Backend no Railway

### 1.1 Novo projeto

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Selecione o repositório `Clinica-X`
3. **Root Directory:** `src/backend`
4. Railway deve detectar `Dockerfile` + `railway.toml`

### 1.2 Banco de dados (SQL Server)

A API usa **SQL Server** (EF Core). Opções:

| Opção | Como |
|--------|------|
| **Azure SQL** (recomendado) | Crie um banco free/basic e copie a connection string |
| **SQL Server no Railway** | Add service → Docker image `mcr.microsoft.com/mssql/server:2022-latest` + volume + senha SA |
| **Externo** | Qualquer host SQL Server acessível publicamente |

Exemplo de connection string:

```
Server=tcp:SEU_SERVER.database.windows.net,1433;Initial Catalog=ClinicaX;User ID=...;Password=...;Encrypt=True;TrustServerCertificate=False;MultipleActiveResultSets=true
```

### 1.3 Variáveis de ambiente (API)

No serviço da API no Railway:

| Variável | Obrigatório | Exemplo |
|----------|-------------|---------|
| `ConnectionStrings__DefaultConnection` | **Sim** | (connection string SQL Server) |
| `Jwt__Key` | **Sim** | string aleatória ≥ 32 caracteres |
| `Jwt__Issuer` | Não | `ClinicaX` |
| `Jwt__Audience` | Não | `ClinicaX` |
| `ASPNETCORE_ENVIRONMENT` | Não | `Production` |
| `Seed__EnableDemo` | Não | `true` (conta demo) ou `false` |
| `Cors__Origins__0` | **Sim** | `https://seu-app.vercel.app` |
| `Cors__Origins__1` | Não | `http://localhost:4200` |
| `Cors__AllowVercelPreviews` | Não | `true` (default) |
| `ConnectionStrings__Redis` | Não | vazio = cache em memória |

Gere JWT seguro (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### 1.4 Healthcheck

- Path: `/health`
- A API escuta em `PORT` (Railway injeta automaticamente)

### 1.5 Domínio da API

Após o deploy, copie a URL pública, ex.:

`https://clinica-x-api-production.up.railway.app`

Teste: `https://.../health` → `{ "status": "healthy" }`

---

## 2. Frontend na Vercel

### 2.1 Importar projeto

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub `Clinica-X`
2. Configure:

| Campo | Valor |
|--------|--------|
| **Root Directory** | `src/frontend` |
| **Framework Preset** | Other |
| **Build Command** | `npm run build:vercel` (já no `vercel.json`) |
| **Output Directory** | `dist/clinica-x/browser` |
| **Install Command** | `npm ci` |

### 2.2 Variáveis de ambiente (Vercel)

| Nome | Valor |
|------|--------|
| `API_URL` | `https://SUA-API.up.railway.app` (**sem** `/api` no final) |

O script `scripts/inject-env.mjs` gera:

- `apiUrl` → `https://.../api`
- `hubUrl` → `https://.../hub/notificacoes`

### 2.3 Redeploy

Após salvar `API_URL`, faça **Redeploy** na Vercel.

### 2.4 CORS

Na Railway, defina a origem da Vercel:

```
Cors__Origins__0=https://seu-projeto.vercel.app
```

Previews (`*.vercel.app`) já são aceitos se `Cors__AllowVercelPreviews=true`.

---

## 3. Conta demo (opcional)

Com `Seed__EnableDemo=true` no Railway:

| Email | Senha |
|--------|--------|
| `demo@clinica.com` | `Demo@1234` |

---

## 4. Checklist pós-deploy

- [ ] `GET /health` na API retorna 200
- [ ] Site Vercel abre a landing
- [ ] Login demo funciona
- [ ] Dashboard carrega dados (não tela vazia)
- [ ] Console do browser sem erro CORS
- [ ] SignalR conecta (badge online no sidebar, se aplicável)

---

## 5. Docker local (opcional)

```bash
cp .env.example .env
# edite JWT_KEY e senhas
docker compose up -d --build
```

- Web: http://localhost  
- API: http://localhost:5000/health  

---

## 6. Troubleshooting

| Problema | Solução |
|----------|---------|
| API não sobe | Veja logs Railway: JWT vazio ou connection string inválida |
| CORS blocked | `Cors__Origins__0` = URL exata da Vercel (com https) |
| Login falha / rede | `API_URL` na Vercel aponta para a URL Railway correta; redeploy |
| Migração falha | SQL Server acessível da internet? Firewall Azure permite Azure services / IP Railway? |
| Build Vercel estoura budget | Budgets já ampliados no `angular.json` |
| SignalR falha | Confirme `hubUrl` e que o proxy Railway não bloqueia WebSockets |
