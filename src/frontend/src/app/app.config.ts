import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

// CurrencyPipe / DatePipe com 'pt-BR' quebram a view se o locale não estiver registrado
registerLocaleData(localePt, 'pt-BR');

function loadIconSprite(): () => Promise<void> {
  return () =>
    fetch('assets/icon-sprite.svg')
      .then((r) => r.text())
      .then((svg) => {
        const div = document.createElement('div');
        div.innerHTML = svg;
        const svgEl = div.firstElementChild;
        if (svgEl) document.body.prepend(svgEl);
      })
      .catch(() => {});
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // XHR em vez de fetch: evita casos em que a resposta chega e a tela não atualiza até interagir
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: APP_INITIALIZER, useFactory: loadIconSprite, multi: true },
  ],
};
