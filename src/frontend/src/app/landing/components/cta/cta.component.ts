import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MagneticDirective } from '../../directives/magnetic.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterLink, MagneticDirective],
  template: `
    <section class="cta-section section-dark">
      <div class="cta-bg-image"></div>
      <div class="cta-overlay"></div>
      <div class="cta-content">
        <span class="cta-badge">VAMOS COMEÇAR?</span>
        <h2>Um login com todas as ferramentas que você precisa!</h2>
        <p>Confira na prática como o ClinicaX pode automatizar a sua gestão e impulsionar os resultados do seu negócio.</p>
        <div class="cta-buttons">
          <a routerLink="/auth/login" appMagnetic class="cta-btn cta-btn--primary">
            Criar conta grátis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a routerLink="/auth/login" [queryParams]="{demo: true}" appMagnetic class="cta-btn cta-btn--outline">
            Fale com vendas
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta-section {
      position: relative;
      padding: 120px 24px;
      background: #0f0f23;
      text-align: center;
      overflow: hidden;
    }
    .cta-bg-image {
      position: absolute;
      inset: 0;
      background:
        url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=60') center 40% / cover no-repeat;
      opacity: 0.06;
      z-index: 0;
    }
    .cta-overlay {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 50% 100%, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
      z-index: 1;
    }
    .cta-content {
      position: relative;
      z-index: 2;
      max-width: 600px;
      margin: 0 auto;
    }
    .cta-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 100px;
      background: rgba(37, 99, 235, 0.1);
      border: 1px solid rgba(37, 99, 235, 0.1);
      color: var(--clx-accent-light);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 20px;
    }
    .cta-content h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 750;
      color: #fafaf9;
      letter-spacing: -0.03em;
      margin-bottom: 16px;
    }
    .cta-content p {
      color: rgba(250, 250, 249, 0.55);
      margin-bottom: 36px;
      font-size: 1rem;
      line-height: 1.6;
    }
    .cta-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: 50px;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s;
    }
    .cta-btn--primary {
      background: linear-gradient(135deg, var(--clx-accent), var(--clx-purple));
      color: #fff;
      box-shadow: 0 4px 24px rgba(37, 99, 235, 0.3);
    }
    .cta-btn--primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 36px rgba(37, 99, 235, 0.4);
    }
    .cta-btn--outline {
      background: rgba(250, 250, 249, 0.06);
      border: 1.5px solid rgba(250, 250, 249, 0.12);
      color: #fafaf9;
    }
    .cta-btn--outline:hover {
      background: rgba(250, 250, 249, 0.1);
    }
    .cta-btn svg { transition: transform 0.2s; }
    .cta-btn--primary:hover svg { transform: translateX(4px); }
  `],
})
export class CtaComponent {}
