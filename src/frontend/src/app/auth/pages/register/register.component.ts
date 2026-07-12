import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-grid">
        <!-- ── Hero (mesmo idioma visual do login / landing) ── -->
        <aside class="register-hero">
          <div class="hero-bg" aria-hidden="true">
            <div class="hero-orb hero-orb--1"></div>
            <div class="hero-orb hero-orb--2"></div>
            <div class="hero-orb hero-orb--3"></div>
            <div class="hero-grid-pattern"></div>
          </div>

          <div class="hero-content">
            <a routerLink="/" class="hero-logo">
              <span class="logo-mark">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect width="28" height="28" rx="8" fill="#3b6ef5"/>
                  <path d="M8 14l6-6 6 6-6 6z" fill="#fff" opacity="0.35"/>
                  <path d="M11 14l3-3 3 3-3 3z" fill="#fff"/>
                </svg>
              </span>
              <span class="logo-text">ClinicaX</span>
            </a>

            <div class="hero-badge">
              <span class="badge-dot"></span>
              Setup em minutos · sem cartão
            </div>

            <h2 class="hero-title">
              Comece a gerir sua clínica<br/>
              <span class="hero-title-accent">como um SaaS de verdade</span>
            </h2>
            <p class="hero-subtitle">
              Conta real com dados no banco: agenda, prontuário, WhatsApp, financeiro e módulos avançados em um único login.
            </p>

            <ul class="hero-benefits">
              <li>
                <span class="benefit-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div>
                  <strong>Agenda + WhatsApp</strong>
                  <span>Lembretes e confirmação em 1 clique</span>
                </div>
              </li>
              <li>
                <span class="benefit-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div>
                  <strong>Prontuário e anamnese</strong>
                  <span>Histórico clínico organizado</span>
                </div>
              </li>
              <li>
                <span class="benefit-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div>
                  <strong>Financeiro integrado</strong>
                  <span>Receitas, comissões e relatórios</span>
                </div>
              </li>
            </ul>

            <div class="hero-steps">
              <div class="step">
                <span class="step-num">1</span>
                <span class="step-label">Cadastre a clínica</span>
              </div>
              <span class="step-line"></span>
              <div class="step">
                <span class="step-num">2</span>
                <span class="step-label">Configure serviços</span>
              </div>
              <span class="step-line"></span>
              <div class="step">
                <span class="step-num">3</span>
                <span class="step-label">Comece a agendar</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- ── Form panel ── -->
        <main class="register-panel">
          <div class="panel-scroll">
            <div class="panel-inner">
              <div class="panel-top">
                <a routerLink="/" class="mobile-brand">
                  <span class="logo-mark sm">
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <rect width="28" height="28" rx="8" fill="#3b6ef5"/>
                      <path d="M11 14l3-3 3 3-3 3z" fill="#fff"/>
                    </svg>
                  </span>
                  ClinicaX
                </a>
                <div class="panel-actions">
                  <a routerLink="/" class="back-home">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Voltar
                  </a>
                  <a routerLink="/auth/login" [replaceUrl]="true" class="back-login">
                    Já tenho conta
                  </a>
                </div>
              </div>

              <header class="panel-header">
                <h1>Criar conta da clínica</h1>
                <p>Conta real — seus dados ficam no banco. A demo usa dados mockados separados.</p>
              </header>

              <form (ngSubmit)="submit()" class="register-form" autocomplete="on">
                <div class="form-section">
                  <span class="section-label">Dados da clínica</span>
                  <div class="field-grid">
                    <label class="field field--full">
                      <span class="field-label">Nome da clínica *</span>
                      <div class="field-wrap">
                        <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>
                        <input
                          [(ngModel)]="nomeClinica"
                          name="nomeClinica"
                          required
                          placeholder="Clínica Exemplo"
                          autocomplete="organization"
                        />
                      </div>
                    </label>

                    <label class="field field--full">
                      <span class="field-label">Nome do responsável</span>
                      <div class="field-wrap">
                        <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <input
                          [(ngModel)]="nomeResponsavel"
                          name="nomeResponsavel"
                          placeholder="Dra. Maria Silva"
                          autocomplete="name"
                        />
                      </div>
                    </label>

                    <label class="field">
                      <span class="field-label">Telefone *</span>
                      <div class="field-wrap">
                        <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <input
                          [(ngModel)]="telefone"
                          name="telefone"
                          required
                          placeholder="(11) 99999-0000"
                          autocomplete="tel"
                        />
                      </div>
                    </label>

                    <label class="field">
                      <span class="field-label">Endereço</span>
                      <div class="field-wrap">
                        <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <input
                          [(ngModel)]="endereco"
                          name="endereco"
                          placeholder="Rua, número — cidade"
                          autocomplete="street-address"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div class="form-section">
                  <span class="section-label">Acesso</span>
                  <div class="field-grid">
                    <label class="field field--full">
                      <span class="field-label">E-mail *</span>
                      <div class="field-wrap">
                        <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <input
                          type="email"
                          [(ngModel)]="email"
                          name="email"
                          required
                          placeholder="voce@clinica.com"
                          autocomplete="email"
                        />
                      </div>
                    </label>

                    <label class="field field--full">
                      <span class="field-label">Senha *</span>
                      <div class="field-wrap">
                        <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <input
                          [type]="showPassword() ? 'text' : 'password'"
                          [(ngModel)]="senha"
                          name="senha"
                          required
                          minlength="8"
                          placeholder="Mínimo 4 caracteres"
                          autocomplete="new-password"
                        />
                        <button
                          type="button"
                          class="toggle-pass"
                          (click)="showPassword.set(!showPassword())"
                          [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                        >
                          @if (showPassword()) {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          } @else {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                      </div>
                      <span class="field-hint">Use uma senha que você lembre — pode alterar depois nas configurações.</span>
                    </label>
                  </div>
                </div>

                @if (error()) {
                  <div class="error-msg" role="alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ error() }}
                  </div>
                }

                <button type="submit" class="btn-submit" [disabled]="loading()">
                  @if (loading()) {
                    <span class="btn-spinner"></span>
                    <span>Criando conta…</span>
                  } @else {
                    <span>Criar conta e entrar</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  }
                </button>

                <p class="legal">
                  Ao criar a conta você concorda em usar o ClinicaX para gestão da sua clínica.
                  Prefere explorar primeiro?
                  <a routerLink="/auth/login" [replaceUrl]="true" [queryParams]="{ demo: true }">Acessar demo</a>
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      min-height: 100dvh;
      background: var(--clx-page-bg, #a9bcd6);
      color: var(--clx-text-primary, #0a1424);
    }

    .register-grid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      min-height: 100vh;
      min-height: 100dvh;
    }

    /* ── Hero ── */
    .register-hero {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 48px 56px;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #0a162e 0%, #122445 42%, #1a3570 100%);
    }
    .hero-grid-pattern {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(147, 197, 253, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(147, 197, 253, 0.055) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse at 55% 45%, #000 25%, transparent 72%);
    }
    .hero-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }
    .hero-orb--1 {
      width: 480px; height: 480px;
      background: radial-gradient(circle, rgba(59, 110, 245, 0.28), transparent 70%);
      top: -12%; right: -8%;
    }
    .hero-orb--2 {
      width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(13, 148, 136, 0.18), transparent 70%);
      bottom: -8%; left: 8%;
    }
    .hero-orb--3 {
      width: 240px; height: 240px;
      background: radial-gradient(circle, rgba(109, 90, 240, 0.16), transparent 70%);
      top: 42%; left: -4%;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 480px;
      color: #e8eef8;
    }

    .hero-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-bottom: 28px;
    }
    .logo-mark {
      display: grid;
      place-items: center;
      filter: drop-shadow(0 6px 16px rgba(59, 110, 245, 0.35));
    }
    .logo-mark.sm svg { width: 22px; height: 22px; }
    .logo-text {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(59, 110, 245, 0.16);
      border: 1px solid rgba(147, 197, 253, 0.22);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #93c5fd;
      margin-bottom: 20px;
    }
    .badge-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5);
      animation: pulse 1.8s ease-out infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.45); }
      70% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
      100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
    }

    .hero-title {
      margin: 0 0 14px;
      font-size: clamp(1.7rem, 2.6vw, 2.25rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.15;
      color: #fff;
    }
    .hero-title-accent {
      background: linear-gradient(90deg, #93c5fd, #5eead4);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .hero-subtitle {
      margin: 0 0 28px;
      font-size: 0.98rem;
      line-height: 1.65;
      color: rgba(232, 238, 248, 0.72);
      max-width: 42ch;
    }

    .hero-benefits {
      list-style: none;
      margin: 0 0 32px;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .hero-benefits li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(147, 197, 253, 0.12);
      backdrop-filter: blur(8px);
    }
    .benefit-icon {
      width: 28px; height: 28px; border-radius: 8px;
      display: grid; place-items: center;
      background: rgba(59, 110, 245, 0.2);
      color: #93c5fd;
      flex-shrink: 0;
    }
    .hero-benefits strong {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .hero-benefits span {
      font-size: 0.8rem;
      color: rgba(232, 238, 248, 0.6);
    }

    .hero-steps {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .step-num {
      width: 24px; height: 24px; border-radius: 50%;
      display: grid; place-items: center;
      font-size: 0.7rem; font-weight: 800;
      background: linear-gradient(135deg, #3b6ef5, #2a56d4);
      color: #fff;
      box-shadow: 0 4px 12px rgba(59, 110, 245, 0.35);
    }
    .step-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(232, 238, 248, 0.8);
    }
    .step-line {
      width: 20px; height: 1px;
      background: linear-gradient(90deg, rgba(147,197,253,0.4), transparent);
    }

    /* ── Panel ── */
    .register-panel {
      display: flex;
      background:
        linear-gradient(165deg, rgba(200, 214, 234, 0.55) 0%, rgba(168, 187, 214, 0.4) 100%),
        var(--clx-page-bg, #a9bcd6);
      min-height: 100vh;
      min-height: 100dvh;
    }
    .panel-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .panel-inner {
      width: min(480px, 100%);
      margin: 0 auto;
      padding: 36px 32px 48px;
    }

    .panel-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 28px;
    }
    .mobile-brand {
      display: none;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-weight: 800;
      color: var(--clx-text-primary, #0a1424);
      letter-spacing: -0.02em;
    }
    .panel-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .back-home, .back-login {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84rem;
      font-weight: 650;
      color: var(--clx-accent, #3b6ef5);
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--clx-accent, #3b6ef5) 22%, transparent);
      background: color-mix(in srgb, var(--clx-accent, #3b6ef5) 8%, transparent);
      transition: background 0.15s ease, transform 0.15s ease;
      white-space: nowrap;
    }
    .back-home:hover, .back-login:hover {
      background: color-mix(in srgb, var(--clx-accent, #3b6ef5) 14%, transparent);
      transform: translateX(-2px);
    }
    .back-login {
      border-color: transparent;
      background: transparent;
    }
    .back-login:hover {
      background: color-mix(in srgb, var(--clx-accent, #3b6ef5) 10%, transparent);
      transform: none;
    }

    .panel-header { margin-bottom: 24px; }
    .panel-header h1 {
      margin: 0 0 8px;
      font-size: clamp(1.45rem, 2.4vw, 1.75rem);
      font-weight: 800;
      letter-spacing: -0.035em;
      color: var(--clx-text-primary, #0a1424);
      line-height: 1.15;
    }
    .panel-header p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.55;
      color: var(--clx-text-secondary, #2f4260);
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(165deg, rgba(255,255,255,0.55), rgba(255,255,255,0.22));
      border: 1px solid rgba(30, 55, 110, 0.12);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.5) inset,
        0 10px 28px rgba(25, 50, 110, 0.06);
    }
    .section-label {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--clx-accent, #3b6ef5);
    }
    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .field--full { grid-column: 1 / -1; }
    .field-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--clx-text-secondary, #2f4260);
    }
    .field-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .field-icon {
      position: absolute;
      left: 12px;
      color: var(--clx-text-muted, #556a8a);
      pointer-events: none;
      opacity: 0.85;
    }
    .field-wrap input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(30, 55, 110, 0.16);
      border-radius: 12px;
      padding: 12px 12px 12px 40px;
      font-size: 0.94rem;
      font-family: inherit;
      color: var(--clx-text-primary, #0a1424);
      background: rgba(255, 255, 255, 0.72);
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .field-wrap input:hover {
      border-color: rgba(30, 55, 110, 0.28);
    }
    .field-wrap input:focus {
      border-color: var(--clx-accent, #3b6ef5);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--clx-accent, #3b6ef5) 18%, transparent);
      background: #fff;
    }
    .field-wrap input::placeholder {
      color: #7a8eab;
    }
    .toggle-pass {
      position: absolute;
      right: 8px;
      width: 34px; height: 34px;
      border: none;
      background: transparent;
      color: var(--clx-text-muted, #556a8a);
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .toggle-pass:hover { background: rgba(30, 55, 110, 0.06); color: var(--clx-text-primary); }
    .field-hint {
      font-size: 0.72rem;
      color: var(--clx-text-muted, #556a8a);
      line-height: 1.4;
    }

    .error-msg {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.18);
      color: #b91c1c;
      font-size: 0.86rem;
      font-weight: 600;
      line-height: 1.4;
    }
    .error-msg svg { flex-shrink: 0; margin-top: 1px; }

    .btn-submit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      border: none;
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 0.96rem;
      font-weight: 750;
      font-family: inherit;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(135deg, #3b6ef5 0%, #2a56d4 100%);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.18) inset,
        0 10px 24px rgba(59, 110, 245, 0.32);
      transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease, opacity 0.15s ease;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.2) inset,
        0 14px 30px rgba(59, 110, 245, 0.4);
    }
    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .legal {
      margin: 0;
      text-align: center;
      font-size: 0.78rem;
      line-height: 1.5;
      color: var(--clx-text-secondary, #2f4260);
    }
    .legal a {
      color: var(--clx-accent, #3b6ef5);
      font-weight: 700;
      text-decoration: none;
    }
    .legal a:hover { text-decoration: underline; }

    @media (max-width: 960px) {
      .register-grid {
        grid-template-columns: 1fr;
      }
      .register-hero {
        display: none;
      }
      .mobile-brand { display: inline-flex; }
      .panel-inner {
        padding: 24px 20px 40px;
      }
      .field-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .badge-dot, .btn-submit, .back-login { animation: none !important; transition: none !important; }
    }
  `],
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  nomeClinica = '';
  nomeResponsavel = '';
  email = '';
  telefone = '';
  endereco = '';
  senha = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  submit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.register({
      nomeClinica: this.nomeClinica,
      nomeResponsavel: this.nomeResponsavel || undefined,
      email: this.email,
      telefone: this.telefone,
      endereco: this.endereco || undefined,
      senha: this.senha,
    }).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.error?.title || 'Não foi possível criar a conta.';
        this.error.set(typeof msg === 'string' ? msg : 'Não foi possível criar a conta.');
      },
    });
  }
}
