import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="brand-row">
            <span class="brand-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.14"/>
                <path d="M7.5 12l4.5-4.5L16.5 12 12 16.5 7.5 12z" fill="currentColor" opacity="0.35"/>
                <path d="M10 12l2-2 2 2-2 2-2-2z" fill="currentColor"/>
              </svg>
            </span>
            <strong>ClinicaX</strong>
          </div>
          <p>O sistema operacional para clínicas que querem previsibilidade, não só software.</p>
        </div>

        <div class="footer-col">
          <h4>Produto</h4>
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#planos">Planos</a>
          <a routerLink="/auth/login" [queryParams]="{demo: true}">Demo</a>
        </div>

        <div class="footer-col">
          <h4>Empresa</h4>
          <a href="#depoimentos">Depoimentos</a>
          <a href="#faq">FAQ</a>
          <a href="mailto:contato@clinicax.com">Contato</a>
        </div>

        <div class="footer-col">
          <h4>Acesso</h4>
          <a routerLink="/auth/login">Entrar</a>
          <a routerLink="/auth/login">Criar conta</a>
          <p class="contact-line">contato@clinicax.com</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ year }} ClinicaX. Todos os direitos reservados.</p>
        <div class="bottom-links">
          <span>LGPD</span>
          <span>·</span>
          <span>Privacidade</span>
          <span>·</span>
          <span>Termos</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(180deg, rgba(140, 170, 208, 0.55) 0%, rgba(120, 155, 195, 0.7) 100%);
      border-top: 1px solid rgba(20, 42, 85, 0.16);
      padding: 64px 28px 28px;
    }
    .footer-inner {
      max-width: 1120px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr;
      gap: 40px 32px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 12px;
      color: var(--clx-accent);
    }
    .brand-mark { display: flex; }
    .footer-brand strong {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--clx-text);
    }
    .footer-brand p {
      font-size: 0.88rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      max-width: 280px;
    }
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-col h4 {
      font-size: 0.72rem;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--clx-text-tertiary);
      margin-bottom: 4px;
    }
    .footer-col a {
      color: var(--clx-text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 160ms ease;
      width: fit-content;
    }
    .footer-col a:hover {
      color: var(--clx-accent);
    }
    .contact-line {
      font-size: 0.86rem;
      color: var(--clx-text-muted);
      margin-top: 4px;
    }
    .footer-bottom {
      max-width: 1120px;
      margin: 48px auto 0;
      padding-top: 22px;
      border-top: 1px solid var(--clx-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-bottom p,
    .bottom-links {
      font-size: 0.78rem;
      color: var(--clx-text-tertiary);
    }
    .bottom-links {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    @media (max-width: 800px) {
      .footer-inner {
        grid-template-columns: 1fr 1fr;
      }
      .footer-brand {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 480px) {
      .footer-inner {
        grid-template-columns: 1fr;
        gap: 28px;
      }
    }
  `],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
