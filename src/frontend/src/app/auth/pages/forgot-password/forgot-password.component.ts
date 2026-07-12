import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card">
        <h1>Esqueci minha senha</h1>
        <p class="subtitle">Informe o e-mail da clínica. Enviaremos o link de redefinição.</p>

        @if (done()) {
          <p class="success">{{ message() }}</p>
          @if (devResetUrl()) {
            <p class="dev-hint">Modo dev — link gerado:</p>
            <a class="dev-link" [routerLink]="devPath()" [queryParams]="devQuery()">Abrir redefinição</a>
          }
          <div class="back-row">
            <a routerLink="/auth/login" [replaceUrl]="true" class="back">Voltar ao login</a>
            <a routerLink="/" class="back">Voltar ao início</a>
          </div>
        } @else {
          <form (ngSubmit)="submit()" class="form">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" [(ngModel)]="email" name="email" required placeholder="demo@clinica.com" />
            </div>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Enviando...' : 'Enviar link' }}
            </button>
            @if (error()) {
              <p class="error">{{ error() }}</p>
            }
          </form>
          <div class="back-row">
            <a routerLink="/auth/login" [replaceUrl]="true" class="back">Voltar ao login</a>
            <a routerLink="/" class="back">Voltar ao início</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--clx-page-bg);
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 420px;
      padding: 48px 40px;
      background: var(--clx-card-bg);
      border-radius: 18px;
      box-shadow: var(--clx-shadow-card);
      border: 1px solid var(--clx-border);
    }
    h1 { font-size: 1.5rem; margin: 0 0 8px; color: var(--clx-text); font-weight: 700; letter-spacing: -0.02em; }
    .subtitle { color: var(--clx-text-muted); font-size: 0.9rem; margin-bottom: 28px; }
    .form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 0.82rem; font-weight: 600; color: var(--clx-text); }
    .field input {
      padding: 12px 16px;
      border: 1.5px solid var(--clx-border);
      border-radius: var(--clx-radius-sm);
      background: color-mix(in srgb, var(--clx-card-bg-solid) 85%, #fff);
      color: var(--clx-text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field input:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
    .btn-primary { padding: 14px; background: var(--clx-accent); color: #fff; border: none; border-radius: var(--clx-radius-sm); font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.92rem; }
    .btn-primary:hover:not(:disabled) { background: var(--clx-accent-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25); }
    .btn-primary:disabled { opacity: 0.6; }
    .error { color: var(--clx-error); font-size: 0.85rem; padding: 12px; background: rgba(220, 38, 38, 0.06); border-radius: var(--clx-radius-xs); border: 1px solid rgba(220, 38, 38, 0.12); }
    .success { color: var(--clx-success); font-size: 0.85rem; margin-bottom: 16px; padding: 12px; background: rgba(5, 150, 105, 0.06); border-radius: var(--clx-radius-xs); border: 1px solid rgba(5, 150, 105, 0.12); }
    .back-row { display: flex; flex-wrap: wrap; gap: 12px 18px; margin-top: 20px; }
    .back { display: inline-block; color: var(--clx-accent); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
    .back:hover { color: var(--clx-accent-light); }
    .dev-hint { font-size: 0.8rem; color: var(--clx-text-muted); margin: 12px 0 4px; }
    .dev-link { color: var(--clx-accent); font-size: 0.9rem; word-break: break-all; }
  `],
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);

  email = '';
  loading = signal(false);
  done = signal(false);
  message = signal('');
  error = signal('');
  devResetUrl = signal<string | null>(null);
  private emailForReset = '';
  private tokenForReset = '';

  devPath() {
    return '/auth/reset-password';
  }

  devQuery() {
    return { email: this.emailForReset, token: this.tokenForReset };
  }

  submit() {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.forgotPassword(this.email).subscribe({
      next: res => {
        this.loading.set(false);
        this.done.set(true);
        this.message.set(res.message);
        if (res.resetToken && res.resetUrl) {
          this.emailForReset = this.email;
          this.tokenForReset = res.resetToken;
          this.devResetUrl.set(res.resetUrl);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível processar o pedido.');
      },
    });
  }
}
