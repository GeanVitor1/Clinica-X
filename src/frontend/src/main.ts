import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

// SW só em produção — em dev costuma cachear bundle antigo e “esconder” dados até hard refresh
if (environment.production && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ngsw-worker.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Limpa SWs de sessões anteriores em desenvolvimento
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((r) => void r.unregister());
  });
}
