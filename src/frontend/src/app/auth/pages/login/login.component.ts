import { Component, ElementRef, OnInit, OnDestroy, viewChild, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-grid">
        <div class="login-hero">
          <div class="hero-bg">
            <div class="hero-orb hero-orb--1"></div>
            <div class="hero-orb hero-orb--2"></div>
            <div class="hero-orb hero-orb--3"></div>
            <div class="hero-grid-pattern"></div>
          </div>
          <div class="hero-content">
            <div class="hero-badge">
              <svg width="14" height="14"><use href="#ic-sparkle"/></svg>
              <span>Confian&ccedil;a de +150 cl&iacute;nicas</span>
            </div>
            <h2 class="hero-title">
              Gest&atilde;o inteligente<br/>para sua cl&iacute;nica
            </h2>
            <p class="hero-subtitle">
              Agenda, prontu&aacute;rio, WhatsApp e financeiro integrados em uma plataforma moderna e intuitiva.
            </p>

            <div class="hero-stats">
              <div class="hero-stat">
                <span class="stat-value">85%</span>
                <span class="stat-label">Redu&ccedil;&atilde;o de faltas</span>
              </div>
              <div class="hero-stat">
                <span class="stat-value">10min</span>
                <span class="stat-label">Setup inicial</span>
              </div>
              <div class="hero-stat">
                <span class="stat-value">24/7</span>
                <span class="stat-label">Suporte dedicado</span>
              </div>
            </div>

            <div class="hero-quote">
              <p>&ldquo;O ClinicaX transformou a gest&atilde;o da nossa cl&iacute;nica. Reduzimos faltas em 85% e economizamos horas de trabalho por semana.&rdquo;</p>
              <span class="quote-author">Dra. Ana Paula Costa &mdash; Cl&iacute;nica OdontoCare</span>
            </div>
          </div>
        </div>

        <div class="login-panel">
          <div class="login-panel-wrap">
            <div class="login-brand">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="var(--clx-accent)"/>
                <path d="M8 16l8-8 8 8-8 8z" fill="var(--clx-text-inverse)" opacity="0.4"/>
                <path d="M12 16l4-4 4 4-4 4z" fill="var(--clx-text-inverse)"/>
              </svg>
              <span class="brand-name">ClinicaX</span>
            </div>

            <div class="login-header">
              <h1>Bem-vindo de volta</h1>
              <p>Acesse o painel da sua cl&iacute;nica</p>
            </div>

            <form (ngSubmit)="onSubmit()" class="login-form">
              <div class="field">
                <label for="email">Email</label>
                <div class="field-wrap">
                  <svg class="field-icon" width="16" height="16"><use href="#ic-mail"/></svg>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label for="senha">Senha</label>
                <div class="field-wrap">
                  <svg class="field-icon" width="16" height="16"><use href="#ic-lock"/></svg>
                  <input
                    id="senha"
                    type="password"
                    [(ngModel)]="senha"
                    name="senha"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    autocomplete="current-password"
                    required
                  />
                </div>
              </div>

              <button type="submit" class="btn-login" [disabled]="loading()">
                @if (loading()) {
                  <span class="btn-spinner"></span>
                  <span>Entrando...</span>
                } @else {
                  <span>Acessar painel</span>
                  <svg width="16" height="16"><use href="#ic-arrow-right"/></svg>
                }
              </button>

              @if (error()) {
                <div class="error-msg">
                  <svg width="14" height="14"><use href="#ic-alert"/></svg>
                  {{ error() }}
                </div>
              }
            </form>

            <div class="login-footer">
              <a routerLink="/auth/forgot-password" class="footer-link">Esqueci minha senha</a>
              <button class="footer-link footer-link--demo" (click)="fillDemo()">
                <svg width="14" height="14"><use href="#ic-zap"/></svg>
                Acessar demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: var(--clx-page-bg);
    }

    .login-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      height: 100vh;
    }

    /* ── Hero Panel ── */
    .login-hero {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #0a162e 0%, #122445 40%, #1a3570 100%);
    }

    .hero-grid-pattern {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(147, 197, 253, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(147, 197, 253, 0.05) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse at 60% 50%, black 30%, transparent 70%);
    }

    .hero-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }

    .hero-orb--1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.22), transparent);
      top: -10%; right: -5%;
    }

    .hero-orb--2 {
      width: 350px; height: 350px;
      background: radial-gradient(circle, rgba(109, 90, 240, 0.14), transparent);
      bottom: -5%; left: 10%;
    }

    .hero-orb--3 {
      width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(96, 165, 250, 0.12), transparent);
      top: 40%; left: 0;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      padding: 64px 56px;
      max-width: 540px;
      /* Explicit light text on dark blue hero — not theme tokens */
      color: #f0f4fc;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 8px;
      background: rgba(147, 197, 253, 0.14);
      border: 1px solid rgba(147, 197, 253, 0.28);
      color: #bfdbfe;
      font-size: 0.72rem;
      font-weight: 600;
      margin-bottom: 32px;
    }

    .hero-badge svg { flex-shrink: 0; color: #93c5fd; }

    .hero-title {
      font-size: clamp(2rem, 3.2vw, 2.6rem);
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
      line-height: 1.12;
      margin-bottom: 16px;
    }

    .hero-subtitle {
      font-size: 0.95rem;
      line-height: 1.65;
      color: rgba(226, 236, 252, 0.82);
      margin-bottom: 40px;
    }

    .hero-stats {
      display: flex;
      gap: 32px;
      margin-bottom: 48px;
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 1.3rem;
      font-weight: 800;
      color: #ffffff;
    }

    .stat-label {
      font-size: 0.7rem;
      color: rgba(191, 219, 254, 0.75);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 500;
    }

    .hero-quote {
      border-left: 2px solid rgba(147, 197, 253, 0.45);
      padding-left: 16px;
    }

    .hero-quote p {
      font-size: 0.82rem;
      color: rgba(226, 236, 252, 0.88);
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .quote-author {
      font-size: 0.7rem;
      color: rgba(191, 219, 254, 0.7);
      font-weight: 500;
    }

    /* ── Login Panel ── */
    .login-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background:
        radial-gradient(ellipse 80% 60% at 80% 20%, rgba(40, 80, 160, 0.1), transparent 50%),
        linear-gradient(165deg, #c5d4e8 0%, #b2c4de 100%);
    }
    [data-theme='dark'] .login-panel {
      background:
        radial-gradient(ellipse 80% 60% at 80% 20%, rgba(59, 110, 245, 0.12), transparent 50%),
        linear-gradient(165deg, #152a4d 0%, #122445 100%);
    }

    .login-panel-wrap {
      width: 100%;
      max-width: 400px;
      animation: panelIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes panelIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--clx-text-primary);
      letter-spacing: -0.02em;
    }

    .login-header { margin-bottom: 32px; }

    .login-header h1 {
      font-size: 1.7rem;
      font-weight: 750;
      color: var(--clx-text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }

    .login-header p {
      font-size: 0.9rem;
      color: var(--clx-text-secondary);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--clx-text-secondary);
    }

    .field-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 14px;
      color: var(--clx-text-tertiary);
      pointer-events: none;
    }

    .field input {
      width: 100%;
      padding: 11px 14px 11px 40px;
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-md);
      background: color-mix(in srgb, var(--clx-card-bg-solid) 90%, #fff);
      color: var(--clx-text-primary);
      font-size: 0.9rem;
      font-family: var(--clx-font);
      outline: none;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25) inset;
      transition: all var(--clx-transition-base);
    }

    .field input:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }

    .field input::placeholder {
      color: var(--clx-text-tertiary);
    }

    .btn-login {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 20px;
      border: none;
      border-radius: var(--clx-radius-md);
      background: var(--clx-accent);
      color: #fff;
      font-size: 0.92rem;
      font-weight: 600;
      font-family: var(--clx-font);
      cursor: pointer;
      transition: all var(--clx-transition-base);
      margin-top: 4px;
    }

    .btn-login:hover:not(:disabled) {
      background: var(--clx-accent-hover);
      box-shadow: var(--clx-shadow-glow);
      transform: translateY(-1px);
    }

    .btn-login:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-login svg { transition: transform var(--clx-transition-base); }
    .btn-login:hover:not(:disabled) svg { transform: translateX(3px); }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 14px;
      border-radius: var(--clx-radius-sm);
      background: var(--clx-error-muted);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: var(--clx-error);
      font-size: 0.82rem;
      font-weight: 500;
    }

    .error-msg svg { flex-shrink: 0; }

    .login-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 28px;
      padding-top: 22px;
      border-top: 1px solid var(--clx-border);
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--clx-text-tertiary);
      font-size: 0.8rem;
      text-decoration: none;
      font-weight: 500;
      transition: color var(--clx-transition-fast);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--clx-font);
    }

    .footer-link:hover { color: var(--clx-accent); }

    .footer-link--demo {
      color: var(--clx-accent);
      font-weight: 600;
    }

    .footer-link--demo:hover { color: var(--clx-accent-hover); }

    @media (max-width: 900px) {
      .login-grid { grid-template-columns: 1fr; }
      .login-hero { display: none; }
      .login-panel { padding: 32px 24px; }
    }
  `],
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  senha = signal('');
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.route.queryParams.subscribe(params => {
      if (params['demo'] === 'true') {
        this.fillDemo();
      }
    });
  }

  ngOnDestroy() {}

  fillDemo() {
    this.email.set('demo@clinica.com');
    this.senha.set('1234');
    this.onSubmit();
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.authService.login({ email: this.email(), senha: this.senha() }).subscribe({
      next: (response) => {
        this.authService.setSession(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.error.set('Email ou senha inválidos.');
        } else {
          this.error.set('Erro de conexão com o servidor. Tente novamente.');
        }
      },
    });
  }
}
