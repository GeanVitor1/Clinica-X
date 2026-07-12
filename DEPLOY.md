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
           SQLite em /app/data  (zero-config)
           ou SQL Server se você configurar
```

---

## 1. Backend no Railway — só plugar o repo

### Passos

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Repo **Clinica-X**
3. **Root Directory:** `src/backend`
4. **Deploy** (sem variáveis obrigatórias)

### O que a API faz sozinha

| Item | Automático |
|------|------------|
| Banco | **SQLite** → `/app/data/clinicax.db` |
| JWT | Gera e salva em `/app/data/jwt.key` |
| Demo | `demo@clinica.com` / `Demo@1234` |
| CORS | Aberto (funciona com Vercel) |
| Porta | `PORT` do Railway |
| Health | `GET /health` |

Teste: `https://SUA-API.up.railway.app/health` → `"status":"healthy"`

### Volume (recomendado)

Railway → serviço API → **Volumes** → mount path: `/app/data`  
Assim os dados e o JWT **não somem** a cada redeploy.

### Variáveis opcionais

| Variável | Uso |
|----------|-----|
| `ConnectionStrings__DefaultConnection` | SQL Server externo (Azure) se quiser sair do SQLite |
| `Jwt__Key` | Chave fixa (≥32 chars) em multi-instância |
| `Seed__EnableDemo` | `false` desliga a demo |
| `Cors__AllowAll` | `false` se quiser restringir origens |

---

## 2. Frontend na Vercel

1. Import **Clinica-X**
2. **Root Directory:** `src/frontend`
3. Env:

```
API_URL=https://SUA-API.up.railway.app
```

(sem `/api` no final)

4. Deploy

Build usa `npm run build:vercel` (já no `vercel.json`).

---

## 3. Conta demo

| Email | Senha |
|--------|--------|
| `demo@clinica.com` | `Demo@1234` |

---

## 4. Checklist

- [ ] `/health` = 200
- [ ] Login demo no site Vercel
- [ ] Dashboard com dados

---

## 5. Troubleshooting

| Problema | Solução |
|----------|---------|
| Build Docker falha | Root Directory = `src/backend` |
| Login 401 | Confirme seed demo e senha `Demo@1234` |
| CORS no browser | API já vem com `Cors__AllowAll=true` |
| API_URL errada | Redeploy Vercel após ajustar env |
| Dados sumiram | Monte Volume em `/app/data` |
