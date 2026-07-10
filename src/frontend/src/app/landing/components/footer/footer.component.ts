import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <strong>ClinicaX</strong>
          <p>Feito para clínicas</p>
        </div>
        <div class="footer-links">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#planos">Planos</a>
          <a href="/auth/login">Demo</a>
        </div>
        <div class="footer-contact">
          <p>contato@clinica.com</p>
          <p>(11) 99999-8888</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 ClinicaX. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--clx-bg);
      border-top: 1px solid var(--clx-border);
      padding: 64px 24px 24px;
    }
    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 40px;
    }
    .footer-brand strong {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--clx-accent);
      letter-spacing: -0.02em;
    }
    .footer-brand p {
      font-size: 0.82rem;
      color: var(--clx-text-muted);
      margin-top: 6px;
    }
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-links a {
      color: var(--clx-text-muted);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: var(--clx-accent);
    }
    .footer-contact p {
      font-size: 0.88rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
    }
    .footer-bottom {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--clx-border);
    }
    .footer-bottom p {
      font-size: 0.78rem;
      color: var(--clx-text-muted);
    }
  `],
})
export class FooterComponent {}
