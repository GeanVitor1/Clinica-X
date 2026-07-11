import { Routes } from '@angular/router';
import { landingGuard } from './landing.guard';

export default [
  {
    path: '',
    canActivate: [landingGuard],
    loadComponent: () =>
      import('./pages/landing-page.component').then((m) => m.LandingPageComponent),
  },
] as Routes;
