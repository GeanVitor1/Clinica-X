import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/pacientes-list/pacientes-list.component').then(m => m.PacientesListComponent),
  },
] as Routes;
