import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page.component').then(m => m.LandingPageComponent),
  },
] as Routes;
