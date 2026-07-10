import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
  },
] as Routes;
