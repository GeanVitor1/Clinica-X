import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/relatorios-page/relatorios-page.component').then(m => m.RelatoriosPageComponent),
  },
] as Routes;
