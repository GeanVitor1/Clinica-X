import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

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
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAnimationsAsync(),
    { provide: APP_INITIALIZER, useFactory: loadIconSprite, multi: true },
  ],
};
