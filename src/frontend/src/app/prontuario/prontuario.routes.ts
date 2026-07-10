import { Routes } from '@angular/router';

export default [
  {
    path: ':pacienteId',
    loadComponent: () => import('./pages/prontuario-paciente/prontuario-paciente.component').then(m => m.ProntuarioPacienteComponent),
  },
] as Routes;
