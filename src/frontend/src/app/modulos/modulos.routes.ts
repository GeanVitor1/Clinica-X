import { Routes } from '@angular/router';

export default [
  {
    path: 'financeiro',
    loadComponent: () =>
      import('./pages/financeiro-page.component').then((m) => m.FinanceiroPageComponent),
  },
  {
    path: 'whatsapp',
    loadComponent: () =>
      import('./pages/whatsapp-page.component').then((m) => m.WhatsappPageComponent),
  },
  {
    path: 'anamneses',
    loadComponent: () =>
      import('./pages/anamneses-page.component').then((m) => m.AnamnesesPageComponent),
  },
  {
    path: 'contratos',
    loadComponent: () =>
      import('./pages/modulo-generico.component').then((m) => m.ModuloGenericoComponent),
    data: { modulo: 'contratos' },
  },
  {
    path: 'injetaveis',
    loadComponent: () =>
      import('./pages/injetaveis-page.component').then((m) => m.InjetaveisPageComponent),
  },
  {
    path: 'telemedicina',
    loadComponent: () =>
      import('./pages/telemedicina-page.component').then((m) => m.TelemedicinaPageComponent),
  },
  {
    path: 'vendas',
    loadComponent: () =>
      import('./pages/vendas-page.component').then((m) => m.VendasPageComponent),
  },
  {
    path: 'estoque',
    loadComponent: () =>
      import('./pages/estoque-page.component').then((m) => m.EstoquePageComponent),
  },
  {
    path: 'notas',
    loadComponent: () =>
      import('./pages/notas-page.component').then((m) => m.NotasPageComponent),
  },
  {
    path: 'transcricoes',
    loadComponent: () =>
      import('./pages/transcricoes-page.component').then((m) => m.TranscricoesPageComponent),
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./pages/portal-page.component').then((m) => m.PortalPageComponent),
  },
  {
    path: 'avaliacao-facial',
    loadComponent: () =>
      import('./pages/avaliacao-facial-page.component').then((m) => m.AvaliacaoFacialPageComponent),
  },
  {
    path: 'tarefas',
    loadComponent: () =>
      import('./pages/tarefas-page.component').then((m) => m.TarefasPageComponent),
  },
  {
    path: 'ia-textos',
    loadComponent: () =>
      import('./pages/ia-textos-page.component').then((m) => m.IaTextosPageComponent),
  },
] as Routes;
