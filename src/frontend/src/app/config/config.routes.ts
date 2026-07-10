import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/config-page/config-page.component').then(m => m.ConfigPageComponent),
  },
] as Routes;
