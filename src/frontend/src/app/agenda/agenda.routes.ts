import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/agenda-view/agenda-view.component').then(m => m.AgendaViewComponent),
  },
] as Routes;
