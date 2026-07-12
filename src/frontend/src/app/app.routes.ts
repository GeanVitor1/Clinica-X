import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./landing/landing.routes'),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'confirmar/:token',
    loadComponent: () =>
      import('./public/confirmar-consulta.component').then((m) => m.ConfirmarConsultaComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes'),
      },
      {
        path: 'pacientes',
        loadChildren: () => import('./pacientes/pacientes.routes'),
      },
      {
        path: 'servicos',
        loadChildren: () => import('./servicos/servicos.routes'),
      },
      {
        path: 'agenda',
        loadChildren: () => import('./agenda/agenda.routes'),
      },
      {
        path: 'prontuario',
        loadChildren: () => import('./prontuario/prontuario.routes'),
      },
      {
        path: 'relatorios',
        loadChildren: () => import('./relatorios/relatorios.routes'),
      },
      {
        path: 'config',
        loadChildren: () => import('./config/config.routes'),
      },
      {
        path: 'modulos',
        loadChildren: () => import('./modulos/modulos.routes'),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
