# ClinicaX — Sistema de Gestão Inteligente para Clínicas

SaaS single-tenant para clínicas odontológicas e médicas. O dono da clínica cadastra pacientes, agenda consultas, e o sistema envia lembretes automáticos via WhatsApp.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | ASP.NET Core 10, Clean Architecture, EF Core, PostgreSQL, JWT + Identity, FluentValidation, Mapster, FluentResults, Serilog, SignalR, Quartz.NET |
| Frontend | Angular 21 (Standalone, Signals, Lazy Loading), Angular CDK, TypeScript, GSAP, Three.js, ApexCharts, Lenis |
| Infra | Docker + Compose, Redis, Nginx, GitHub Actions |

---

## Pré-requisitos

- Docker e Docker Compose
- .NET 10 SDK (para desenvolvimento local)
- Node.js 24+ (para desenvolvimento local)

---

## Setup rápido com Docker

```bash
# Clone o repositório
git clone <url>
cd clinica-x

# Inicie todos os serviços
docker compose up -d

# Acesse:
# - Frontend: http://localhost
# - API: http://localhost:5000
```

---

## Setup para desenvolvimento

### Backend

```bash
cd src/backend
dotnet restore ClinicaX.slnx
dotnet build ClinicaX.slnx

# Configure a connection string no appsettings.Development.json
# Execute as migrations
cd ClinicaX.API
dotnet run
```

### Frontend

```bash
cd src/frontend
npm install
npm start
# Acesse http://localhost:4200
```

---

## Conta Demo

| Perfil | Email | Senha |
|--------|-------|-------|
| Dono da clínica | demo@clinica.com | 1234 |

### Esqueci minha senha

Em Development, o endpoint `POST /api/auth/forgot-password` devolve o token de reset no JSON (para testes). Em produção, o token seria enviado por e-mail.

### Cache (Redis)

- Docker Compose: Redis em `redis:6379` (`ConnectionStrings__Redis`)
- Dev local sem Redis: usa `DistributedMemoryCache` automaticamente (string Redis vazia)

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor de desenvolvimento Angular |
| `npm run build` | Build de produção |
| `npm test` | Executa testes unitários (Vitest) |
| `npm run lint` | Verifica formatação com Prettier |
| `dotnet test` | Executa testes do backend (xUnit) |

---

## Estrutura do Projeto

```
src/
├── backend/
│   ├── ClinicaX.API           → Endpoints minimal API, Middleware, Hubs
│   ├── ClinicaX.Application   → Services, DTOs, Validators
│   ├── ClinicaX.Domain        → Entities
│   ├── ClinicaX.Persistence   → EF Core DbContext, Migrations, Repositories
│   ├── ClinicaX.Identity      → JWT, AuthService
│   ├── ClinicaX.Infrastructure → WhatsApp, Quartz Jobs, SignalR Dispatch
│   └── ClinicaX.Tests         → Testes unitários (xUnit + Moq)
└── frontend/
    └── src/app/
        ├── landing/           → Landing page com partículas Three.js
        ├── auth/              → Login + guard + interceptor
        ├── dashboard/         → Dashboard com cards e ApexCharts
        ├── pacientes/         → CRUD pacientes
        ├── agenda/            → Calendário com Angular CDK
        ├── servicos/          → CRUD serviços
        ├── prontuario/        → Timeline feed + anexos
        ├── relatorios/        → Relatórios financeiros e ocupação
        ├── config/            → Configurações da clínica
        ├── core/              → Layout, ApiService, SignalR
        └── shared/            → Skeleton, Toast, Avatar, EmptyState, BtnSubmit
```

---

## Funcionalidades

- Landing page com partículas 3D, animações GSAP e design responsivo
- Autenticação JWT com Identity
- Dashboard com cards, gráficos ApexCharts e timeline de atividades
- CRUD de pacientes com busca debounce, avatar por iniciais, cartão expansivo
- Agenda com visões dia/semana/mês, drag & drop para remarcar
- Prontuário digital com timeline e upload de anexos
- Notificações WhatsApp (confirmação, lembrete, cancelamento, remarcação)
- Relatórios financeiros e de ocupação
- Tema escuro/claro
- PWA instalável no celular
- CI/CD com GitHub Actions
