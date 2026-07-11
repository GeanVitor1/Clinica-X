import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card">
        <h1>Redefinir senha</h1>
        <p class="subtitle">Escolha uma nova senha para {{ email }}</p>

        @if (done()) {
          <p class="success">Senha redefinida com sucesso!</p>
          <a routerLink="/auth/login" class="back">Ir para o login</a>
        } @else {
          <form (ngSubmit)="submit()" class="form">
            <div class="field">
              <label for="senha">Nova senha</label>
              <input id="senha" type="password" [(ngModel)]="novaSenha" name="senha" required minlength="4" />
            </div>
            <div class="field">
              <label for="confirma">Confirmar senha</label>
              <input id="confirma" type="password" [(ngModel)]="confirma" name="confirma" required />
            </div>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Salvando...' : 'Redefinir senha' }}
            </button>
            @if (error()) {
              <p class="error">{{ error() }}</p>
            }
          </form>
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
    .subtitle { color: var(--clx-text-muted); font-size: 0.9rem; margin-bottom: 28px; word-break: break-all; }
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
    .back { display: inline-block; margin-top: 20px; color: var(--clx-accent); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
    .back:hover { color: var(--clx-accent-light); }
  `],
})
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  email = '';
  token = '';
  novaSenha = '';
  confirma = '';
  loading = signal(false);
  done = signal(false);
  error = signal('');

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.email || !this.token) {
      this.error.set('Link inválido ou incompleto.');
    }
  }

  submit() {
    if (!this.email || !this.token) return;
    if (this.novaSenha.length < 4) {
      this.error.set('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (this.novaSenha !== this.confirma) {
      this.error.set('As senhas não coincidem.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.resetPassword({ email: this.email, token: this.token, novaSenha: this.novaSenha }).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error || 'Não foi possível redefinir a senha. O link pode ter expirado.');
      },
    });
  }
}
