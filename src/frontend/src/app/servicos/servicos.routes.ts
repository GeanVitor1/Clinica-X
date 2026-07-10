import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/servicos-list/servicos-list.component').then(m => m.ServicosListComponent),
  },
] as Routes;
