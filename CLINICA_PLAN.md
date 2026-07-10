# ClinicaX — Sistema de Gestão Inteligente para Clínicas

## Conceito

SaaS single-tenant. O **dono da clínica** (dentista, médico, etc.) assina e gerencia tudo sozinho. Ele cadastra pacientes, agenda consultas, e o sistema envia lembretes automáticos via WhatsApp. **Pacientes não acessam o sistema.**

---

## Stack

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 10 | Web API minimalista |
| Clean Architecture | — | Domain / Application / Persistence / API |
| EF Core | 10 | ORM |
| PostgreSQL | 17 | Banco de dados principal |
| JWT + Identity | — | Auth do dono da clínica (role única) |
| FluentValidation | 11 | Validação de DTOs |
| Mapster | — | Mapeamento rápido (no lugar de AutoMapper) |
| FluentResults | — | Result Pattern sem exceptions para fluxos esperados |
| Serilog | — | Logging estruturado |
| SignalR | — | Notificações em tempo real no dashboard |
| Quartz.NET | — | Job: enviar WhatsApp no horário do lembrete |
| HttpClient (nativo) | — | Consumir WhatsApp Cloud API (Meta) |
| xUnit + Moq | — | Testes unitários |

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Angular | 21 | Standalone, lazy loading, Signals |
| Angular CDK | 21 | Overlay, acessibilidade |
| TypeScript | 5.9 | Tipagem forte |
| GSAP | 3.15 | Animações da landing (split text, stagger, scroll) |
| ScrollTrigger | — | Animações ativadas por scroll |
| Lenis | — | Smooth scrolling personalizável |
| Three.js | — | Partículas 3D no background do hero |
| ApexCharts | — | Gráficos do dashboard |
| Angular Signals | — | Estado local sem RxJS desnecessário |
| Vitest | — | Testes unitários |
| Prettier | — | Formatação |
| @angular/pwa | — | Transforma o sistema em app instalável no celular |
| html2canvas + jsPDF | — | Exportar relatório PDF com gráfico embutido |

### Infra
| Tecnologia | Uso |
|------------|-----|
| Docker + Compose | PostgreSQL + API + Web + Redis |
| Redis | Cache de consultas |
| Nginx | Servir build Angular |
| GitHub Actions | CI: lint → test → build |

---

## Landing Page — Especificação Completa

### Paleta de cores (design tokens)
```scss
:root {
  --clx-primary:        #0f172a;
  --clx-primary-light:  #1e3a5f;
  --clx-accent:         #14b8a6;
  --clx-accent-light:   #2dd4bf;
  --clx-accent-glow:    rgba(20, 184, 166, 0.3);
  --clx-bg:             #ffffff;
  --clx-bg-alt:         #f8fafc;
  --clx-text:           #0f172a;
  --clx-text-muted:     #64748b;
  --clx-text-light:     #f8fafc;
  --clx-border:         #e2e8f0;
  --clx-radius:         16px;
  --clx-shadow:         0 4px 24px rgba(15, 23, 42, 0.08);
  --clx-glow:           0 0 40px var(--clx-accent-glow);
  --clx-font:           'Inter', sans-serif;
}

[data-theme="dark"] {
  --clx-bg:             #0f172a;
  --clx-bg-alt:         #1e293b;
  --clx-text:           #f8fafc;
  --clx-text-muted:     #94a3b8;
  --clx-border:         #334155;
}
```

### Estrutura de componentes

```
landing/
├── pages/
│   └── landing-page.component.ts
├── components/
│   ├── navbar/
│   │   ├── navbar.component.ts        → transparente → blur no scroll, toggle dark
│   │   └── navbar.component.scss
│   ├── hero/
│   │   ├── hero.component.ts          → título split + partículas 3D + mockup
│   │   ├── hero.component.scss
│   │   └── hero-particles.ts          → classe Three.js dedicada
│   ├── how-it-works/
│   │   ├── how-it-works.component.ts  → 3 passos com contador + SVG conector
│   │   └── how-it-works.component.scss
│   ├── features/
│   │   ├── features.component.ts      → grid stagger on scroll
│   │   ├── features.component.scss
│   │   └── feature-card.component.ts  → card com hover tilt 3D
│   ├── pricing/
│   │   ├── pricing.component.ts       → toggle mensal/anual
│   │   ├── pricing.component.scss
│   │   └── pricing-card.component.ts  → glow + selo "recomendado"
│   ├── cta/
│   │   ├── cta.component.ts           → gradiente full + botão pulsante
│   │   └── cta.component.scss
│   ├── demo-access/
│   │   ├── demo-access.component.ts   → quick login único
│   │   └── demo-access.component.scss
│   └── footer/
│       ├── footer.component.ts
│       └── footer.component.scss
├── directives/
│   ├── magnetic.directive.ts          → botão persegue o mouse
│   ├── parallax.directive.ts          → parallax com ScrollTrigger
│   ├── tilt.directive.ts              → card inclina conforme mouse
│   ├── split-text.directive.ts        → quebra texto em spans + anima
│   └── animate-on-scroll.directive.ts → wrapper ScrollTrigger
└── services/
    └── landing-animation.service.ts   → centraliza timelines GSAP
```

### Seção a seção

**Navbar**
- Logo à esquerda, links à direita (Funcionalidades · Planos · Demo)
- Background `transparent` no topo → ao scroll passa para `--clx-bg` com `backdrop-filter: blur(12px)`
- Botão toggle dark mode (🌙/☀️) com ícone girando 360deg na troca e transição suave de cores (CSS `transition` em todas as variáveis)
- Modo escuro mantém a identidade visual, só inverte fundo/texto e suaviza as cores

**Hero (fullscreen)**
- Background: Canvas Three.js com ~200 partículas esferas `#14b8a6` / `#2dd4bf`, opacidade 0.15, conectadas por linhas quando distância < 120px. Câmera rotaciona 0.001 rad/frame. Mouse desvia partículas próximas. Fallback: `prefers-reduced-motion` desliga Three.js e mostra gradiente fixo.
- Título: `split-text.directive` → cada palavra `opacity 0→1` + `y 40→0` + `rotateX 10deg→0`, stagger 0.08s, ease `power3.out`
- Subtítulo: fade-in com delay 1.2s
- Mockup (imagem do dashboard): `NgOptimizedImage` priority, floating `float 4s ease-in-out infinite`, parallax mouse 2%
- CTA "Começar grátis": `magnetic.directive` (15px max), pulse infinito no box-shadow

**Como funciona (3 passos)**
- ScrollTrigger: ativa quando entra na viewport
- Números circulares animam de 0 → N com `countUp`
- Cards entram com stagger 0.2s, `opacity 0→1` + `x -30→0`
- SVG conector entre os cards com path desenhando animadamente

**Funcionalidades (grid 3×2)**
- ScrollTrigger: `from { scale: 0.9, y: 40, opacity: 0 }` → `to { scale: 1, y: 0, opacity: 1 }`, stagger 0.1s
- Feature card: ícone SVG animado (stroke-dashoffset), `tilt.directive` (rotateX/Y até 8deg, perspective 800px)

**Planos**
- Toggle Mensal / Anual com sliding pill animado
- Card recomendado: borda gradiente rotacionando (`conic-gradient` + `@property`), `translateY(-8px)`, glow
- Entrada: scale 0.8→1, stagger 0.15s

**CTA Final**
- Gradiente `linear-gradient(135deg, #0f172a, #14b8a6)` com `background-size 200% 200%` shift lento
- Botão branco com `magnetic.directive` + seta SVG que desliza no hover

**Demo Access**
- "Acessar demo da clínica" → redireciona pro sistema logado com dados fictícios

**Footer**
- Links rápidos, contato, "Feito para clínicas"

### Skeleton Loading (padrão em todas as telas)
- Enquanto dados carregam, exibe esqueletos pulsantes no formato exato dos cards, tabelas e gráficos
- Implementado como um componente reutilizável `app-skeleton` com variações: `skeleton-card`, `skeleton-table`, `skeleton-chart`, `skeleton-text`
- Controlado pelo sinal `loading()` do componente — sem闪烁 brusca, transição suave de skeleton → conteúdo real
- Aplica-se em: Dashboard, lista de pacientes, agenda, prontuário, relatórios

### Empty States Ilustrados
- Cada tela sem dados exibe uma ilustração SVG temática + texto motivacional
- Ex: "Nenhum paciente cadastrado ainda." com ilustração de prancheta + botão "Adicionar paciente"
- Ex: "Nenhum agendamento hoje." com calendário vazio + "Que tal agendar agora?"
- Ilustrações em SVG inline (leves, sem dependência externa)

### Toast Notifications
- Sistema de toasts no canto superior direito com 4 variações: sucesso (verde), erro (vermelho), aviso (amarelo), info (azul)
- Ícone + mensagem + botão fechar
- Auto-dismiss após 5s com barra de progresso decrescente
- Animação de entrada (slide-in) e saída (fade-out) com GSAP
- Implementado como um `injectable()` service + componente dinâmico

### Responsividade
- Layout adaptável: mobile (1 col), tablet (2 col), desktop (3 col)
- Navbar vira hamburger menu em mobile
- Tabelas com scroll horizontal em telas pequenas
- Calendário mantém usabilidade em mobile (toque no lugar de drag)

### Busca com Debounce
- Campo de busca em pacientes com debounce de 300ms
- Usa `toSignal` + `switchMap` para cancelar requisições anteriores
- Feedback visual: enquanto busca, mostra spinner no input

### Micro-interação nos Botões
- Botão "Salvar" tem 3 estados: normal → spinner (salvando) → check verde (sucesso) → volta ao normal
- Botão "Cancelar" com shake sutil ao clicar se houver dados não salvos
- Animações com GSAP (`timeline` com 3 fases)

### Login com Partículas
- Tela de login reutiliza o mesmo fundo de partículas Three.js da landing (mais sutil, opacidade 0.08)
- Formulário centralizado com card vidro (glassmorphism: `backdrop-filter: blur(16px)`, borda translúcida)

### Acessibilidade
```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
- ARIA labels em CTAs e navegação
- Tabindex zero em cards interativos
- Three.js carregado com import dinâmico
- Imagens com `NgOptimizedImage` + lazy loading
- Seções abaixo da dobra com `@defer (on viewport)`

---

## Funcionalidades do Sistema (pós-login)

### 1. Dashboard
- Consultas de hoje (card com lista + horários)
- Próximos 7 dias (visão rápida)
- Faturamento do mês
- Últimas notificações enviadas (WhatsApp)
- Gráfico de ocupação da semana (ApexCharts)
- **Animações GSAP:** cards e gráficos entram com stagger + fade ao scroll. Ao trocar mês/semana, números contam de 0 até o valor real (countUp)
- Background gradiente animado: gradiente sutíl (`--clx-primary` → `--clx-accent`) se move lentamente em loop de 30s no fundo do dashboard

### 2. Pacientes
- Cadastro completo (nome, CPF, telefone, data nascimento, observações)
- Avatar com iniciais: círculo com as 2 primeiras letras do nome + cor única gerada hash do nome (ex: "João Silva" → "JS" em fundo azul)
- Cartão expansivo: cada paciente é um card que ao clicar expande (accordion) mostrando último agendamento, telefone e botão "Agendar" — sem sair da tela
- Busca por nome / CPF / telefone
- Histórico de consultas do paciente
- Acesso ao prontuário do paciente
- Audit log: modal "Histórico de alterações" do paciente (criação, edição, agendamentos, notificações enviadas) com timestamp

### 3. Agenda (calendário)
- Visão dia / semana / mês com Angular CDK
- Indicador de horários livres: slots disponíveis com fundo verde claro pulsando suavemente, ocupados em vermelho, passados em cinza
- Criar agendamento (paciente + serviço + horário)
- Arrastar para remarcar (drag & drop)
- Cancelar agendamento (com motivo)
- Ver conflitos de horário
- Confetti ao criar agendamento: soltar confetes (biblioteca `canvas-confetti` ou CSS puro) ao agendar com sucesso

### 4. Serviços
- Cadastro de serviços da clínica (ex: Consulta, Limpeza, Canal, Raio-X)
- Cada serviço: nome, duração (min), valor, cor (identifica no calendário)

### 5. Prontuário
- Timeline estilo feed vertical: cada consulta vira um card com bolinha na lateral e linha conectando (estilo Instagram/feed)
- Registro por consulta: descrição, diagnóstico, prescrição
- Anexar arquivos (exames, receitas, imagens) — PDF, JPG, PNG

### 6. Notificações WhatsApp
- **Confirmação de agendamento:** dispara na criação do agendamento
- **Lembrete de consulta:** job Quartz dispara 1h antes
- **Cancelamento:** dispara na hora que o dono cancela
- **Remarcação:** dispara na hora que o dono altera a data/hora
- Histórico de mensagens com status (enviada / falha / lida)

**Templates de mensagem:**

| Evento | Mensagem |
|--------|----------|
| Confirmação | `Olá {Paciente}! Sua consulta foi agendada na {Clinica} 📅` `Dia: {data} às {hora}` `Serviço: {servico}` `Endereço: {endereco}` `Qualquer imprevisto, avisamos por aqui. 😊` |
| Lembrete | `Lembrete! Sua consulta na {Clinica} é amanhã/hoje às {hora} ⏰` `Paciente: {Paciente}` `Serviço: {servico}` `Confirme presença respondendo "OK" ou cancele respondendo "CANCELAR".` `Estamos te esperando! 🦷` |
| Cancelamento | `Olá {Paciente}, infelizmente sua consulta do dia {data} às {hora} na {Clinica} precisou ser cancelada. ❌` `Motivo: {motivo}` `Entre em contato para reagendar: {telefone}` `Desculpe pelo transtorno!` |
| Remarcação | `Olá {Paciente}, sua consulta foi reagendada 📅` `Nova data: {novaData} às {novaHora}` `Local: {Clinica} — {endereco}` `Se tiver algum problema, é só nos avisar.` `Confirmado? 😊` |

### 7. Relatórios
- Financeiro: faturamento por período, por serviço, por paciente
- Ocupação: horários de pico, dias mais movimentados
- Exportar PDF com gráfico embutido (html2canvas captura o gráfico ApexCharts + jsPDF monta o documento)
- Exportar CSV (dados brutos da tabela)

### 8. Configurações
- Dados da clínica (nome, endereço, telefone)
- Horário de funcionamento (abertura/fechamento, dias da semana)
- Plano atual (Mensal / Anual)
- Alterar senha

### 9. Login
- Login com email + senha
- Esqueci minha senha (envio de link)

### 10. Timeline de Atividades
- Feed cronológico no canto do dashboard
- Mostra ações recentes: "Você agendou João para 15/07", "Lembrete enviado para Maria", "Cancelou consulta de Pedro"
- Cada ação com ícone, data/hora relativa ("há 2 min", "há 1 hora")
- Ordenado do mais recente para o mais antigo
- Fonte única de dados: eventos gerados pelos serviços (AgendamentoService, NotificacaoService)

---

## Campos por Funcionalidade (o que o dono preenche)

### Cadastro da Clínica (primeiro acesso / config)
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome da clínica | Texto | Sim |
| Email | Email | Sim |
| Telefone | Telefone | Sim |
| Endereço | Texto | Sim |
| Horário abertura | Hora | Sim |
| Horário fechamento | Hora | Sim |
| Dias de funcionamento | Checkbox (seg-sex) | Sim |

### Cadastro de Paciente
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | Texto | Sim |
| CPF | CPF (validado) | Sim |
| Telefone | Telefone | Sim |
| Data de nascimento | Data | Não |
| Observações | Textarea | Não |

### Cadastro de Serviço
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome do serviço | Texto | Sim |
| Descrição | Textarea | Não |
| Duração (minutos) | Número | Sim |
| Valor (R$) | Moeda | Sim |
| Cor (calendário) | Color picker | Não |

### Novo Agendamento
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Paciente | Select (busca) | Sim |
| Serviço | Select | Sim |
| Data | Datepicker | Sim |
| Horário | Timepicker | Sim |
| Observação | Textarea | Não |

### Cancelar Agendamento
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Motivo do cancelamento | Textarea | Sim |

### Remarcar Agendamento (drag ou manual)
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nova data | Datepicker | Sim |
| Novo horário | Timepicker | Sim |

### Prontuário (por consulta)
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Data da consulta | Data (auto) | Sim |
| Descrição | Textarea | Não |
| Diagnóstico | Textarea | Não |
| Prescrição | Textarea | Não |
| Anexos | Upload (PDF/JPG/PNG) | Não |

### Configurações
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome da clínica | Texto | Sim |
| Email | Email | Sim |
| Telefone | Telefone | Sim |
| Endereço | Texto | Sim |
| Horário abertura | Hora | Sim |
| Horário fechamento | Hora | Sim |
| Dias func. | Checkbox | Sim |
| Plano | Select (Mensal/Anual) | Sim |
| Senha atual | Password | Para alterar senha |
| Nova senha | Password | Para alterar senha |

### Login
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Email | Email | Sim |
| Senha | Password | Sim |

---

## Plano de implementação (48 passos — 10 etapas)

> Cada etapa é autossuficiente e constrói sobre a anterior. Passe uma etapa por vez para a IA.

---

### Etapa 1 — Fundação: Projeto, Docker e Auth
- [x] 1. Scaffold backend: solution .NET 10 com Clean Architecture (ClinicaX.API, Application, Domain, Persistence, Identity, Infrastructure)
- [x] 2. Scaffold frontend: Angular 21 standalone com lazy loading e Signals
- [x] 3. Docker Compose: PostgreSQL + Redis + API + Web + Nginx
- [x] 4. Entidade `Clinica` + migration EF Core
- [x] 5. Auth JWT (role única `ClinicaOwner`) + Identity + seed de clínica demo
- [x] 6. Tela de login com partículas Three.js + glassmorphism

---

### Etapa 2 — Landing Page
- [x] 7. Navbar: transparente → blur no scroll, dark mode toggle com ícone girando 360deg
- [x] 8. Hero: Three.js particles + GSAP split text + mockup flutuante + CTA magnético
- [x] 9. Seção "Como funciona": 3 passos com contador animado + SVG conector
- [x] 10. Seção Funcionalidades: grid 3x2 com stagger scroll + tilt hover nos cards
- [x] 11. Seção Planos: toggle mensal/anual + card recomendado com glow animado
- [x] 12. CTA final + Demo Access (1 clique) + Footer

---

### Etapa 3 — Cadastros Base
- [x] 13. Entidade `Paciente` + migration EF Core
- [x] 14. CRUD Pacientes: API + front (tabela com filtro, paginação, ordenação, validar CPF)
- [x] 15. Avatar com iniciais + cartão expansivo (accordion com último agendamento)
- [x] 16. Entidade `Servico` + migration EF Core
- [x] 17. CRUD Serviços: API + front (nome, duração, valor, cor)

---

### Etapa 4 — Agendamento
- [x] 18. Entidade `Agendamento` + migration EF Core
- [x] 19. API Agendamento: criar, listar, remarcar, cancelar + regras de horário comercial e conflito
- [x] 20. Calendário visual com Angular CDK (visões dia / semana / mês)
- [x] 21. Drag & drop para remarcar + indicador de horários livres (verde pulsante)
- [x] 22. Confetti ao criar agendamento com sucesso
- [x] 23. Testes unitários: AgendamentoService (xUnit)

---

### Etapa 5 — Prontuário
- [x] 24. Entidades `Prontuario` e `Anexo` + migration EF Core
- [x] 25. Tela de prontuário com timeline feed vertical (cards + bolinha + linha conectora)
- [x] 26. Upload de arquivos com validação de tipo/tamanho (PDF, JPG, PNG)
- [x] 27. Relacionamento: prontuário vinculado ao agendamento + paciente

---

### Etapa 6 — WhatsApp e Notificações
- [x] 28. Entidade `Notificacao` + migration EF Core
- [x] 29. Interface `INotificationService` + implementações:
      - `WhatsAppCloudApiService` → API real da Meta
      - `WhatsAppSimuladoService` → modo demo (salva sem enviar)
      - Flag `WhatsApp:ModoReal` no `appsettings.json`
- [x] 30. 4 fluxos de disparo:
      - Confirmação (ao criar agendamento)
      - Cancelamento (ao cancelar)
      - Remarcação (ao alterar data/hora)
      - Lembrete (job Quartz a cada 30 min, 1h antes)
- [x] 31. SignalR: badge/toast no dashboard quando notificação é enviada + histórico por paciente

---

### Etapa 7 — Dashboard e Timeline
- [x] 32. Dashboard: cards de consultas hoje, próximos 7 dias, faturamento, gráfico ApexCharts
- [x] 33. Animações GSAP no dashboard (stagger, countUp nos números ao trocar período)
- [x] 34. Background gradiente animado (30s loop) no fundo
- [x] 35. Timeline de atividades: feed cronológico com ações recentes e data relativa
- [x] 36. Toast notifications: service + componente com 4 variações, auto-dismiss 5s, barra de progresso

---

### Etapa 8 — Relatórios
- [x] 37. Relatório financeiro: faturamento por período e por serviço
- [x] 38. Relatório de ocupação: horários de pico e serviços mais agendados
- [x] 39. Exportar PDF com gráfico embutido (html2canvas captura ApexCharts + jsPDF) + CSV

---

### Etapa 9 — Admin e Config
- [x] 40. Tela de configurações: editar dados da clínica, horário comercial, plano, alterar senha
- [x] 41. Botão "Resetar dados demo": limpa e recria dados fictícios
- [x] 42. Audit log: entidade `Evento` salva no banco + modal "Histórico de alterações" no paciente

---

### Etapa 10 — Polimento Final e Deploy
- [x] 43. Componente `app-skeleton` reutilizável (card, table, chart, text) em todas as telas
- [x] 44. Empty states ilustrados (SVG inline) em pacientes, agenda, prontuário, relatórios
- [x] 45. Micro-interação nos botões (3 estados: normal → spinner → check)
- [x] 46. Busca com debounce (300ms, `toSignal` + `switchMap`, spinner no input)
- [x] 47. Responsividade mobile + PWA (service worker + botão "Instalar app")
- [x] 48. CI: GitHub Actions com `dotnet test` + `ng test`
- [x] 49. README com instruções, conta demo e screenshots

---

## Modelo de Dados

```
Clinica          → Id, Nome, Email, Telefone, Endereco, Plano, HorarioAbertura, HorarioFechamento, DiasFuncionamento, Ativo, CriadoEm
Paciente         → Id, ClinicaId, Nome, Cpf, Telefone, DataNascimento, Observacoes, Ativo, CriadoEm
Servico          → Id, ClinicaId, Nome, Descricao, DuracaoMin, Valor, Ativo
Agendamento      → Id, ClinicaId, PacienteId, ServicoId, DataHoraInicio, DataHoraFim, Status, Observacao
Prontuario       → Id, ClinicaId, PacienteId, Data, Descricao, Diagnostico, Prescricao
Anexo            → Id, ProntuarioId, Nome, ContentType, Tamanho, Dados
Notificacao      → Id, ClinicaId, PacienteId, AgendamentoId, Tipo (Confirmacao/Lembrete/Cancelamento/Remarcacao), Mensagem, Status (Pendente/Enviada/Falha), EnviadaEm, Lida, CriadaEm
Evento           → Id, ClinicaId, PacienteId, Tipo (PacienteCriado/PacienteEditado/AgendamentoCriado/AgendamentoCancelado/NotificacaoEnviada), Descricao, CriadoEm
```

---

## Rotas do Frontend

| Rota | Funcionalidade |
|------|----------------|
| `/` | Landing page |
| `/auth/login` | Login |
| `/dashboard` | Home com cards e gráficos do dia |
| `/pacientes` | CRUD pacientes |
| `/agenda` | Calendário de agendamentos |
| `/agenda/novo` | Novo agendamento |
| `/prontuario/:pacienteId` | Prontuário + anexos |
| `/relatorios` | Relatórios financeiros e ocupação |
| `/config` | Configurações da clínica |

---

## Conta demo

| Perfil | Email | Senha |
|--------|-------|-------|
| Dono da clínica | demo@clinica.com | 1234 |
