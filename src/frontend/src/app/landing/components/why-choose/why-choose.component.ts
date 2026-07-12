import { Component, afterNextRender, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-why-choose',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="why-section">
      <div class="container">
        <div class="why-layout">
          <header class="why-head" appAnimateOnScroll>
            <span class="section-label">Diferenciais</span>
            <h2>Feito para quem opera clínica de verdade</h2>
            <p>
              Não é mais um software genérico. É uma operação completa com implantação,
              suporte humano e evolução contínua baseada no dia a dia da clínica.
            </p>
          </header>

          <div class="why-grid">
            @for (item of items; track item.title; let i = $index) {
              <article class="why-card" [style.--accent]="item.accent">
                <div class="why-index">0{{ i + 1 }}</div>
                <div class="why-icon" [innerHTML]="item.icon"></div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.text }}</p>
              </article>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .why-section {
      position: relative;
      padding: 112px 0;
      background: transparent;
      overflow: hidden;
    }
    .why-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 50% 40% at 0% 0%, rgba(59, 110, 245, 0.05), transparent 60%),
        radial-gradient(ellipse 40% 35% at 100% 100%, rgba(13, 148, 136, 0.04), transparent 55%);
      pointer-events: none;
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }
    .why-layout {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 48px;
      align-items: start;
    }
    .why-head {
      position: sticky;
      top: 100px;
      max-width: 380px;
    }
    .section-label {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--clx-accent);
      margin-bottom: 14px;
    }
    .why-head h2 {
      font-size: clamp(1.65rem, 2.8vw, 2.2rem);
      font-weight: 700;
      color: var(--clx-text);
      letter-spacing: -0.035em;
      line-height: 1.15;
      margin-bottom: 14px;
    }
    .why-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
      line-height: 1.65;
    }

    .why-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .why-card {
      --accent: var(--clx-accent);
      position: relative;
      padding: 24px 22px;
      background: linear-gradient(165deg, #c5d4e8 0%, #b2c4de 100%);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(20, 45, 90, 0.18);
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.18) inset,
        0 6px 20px rgba(20, 42, 85, 0.13);
      transition:
        transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
        border-color 240ms ease,
        box-shadow 280ms ease,
        background 240ms ease;
    }
    .why-card:hover {
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--accent) 40%, rgba(37, 80, 150, 0.14));
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.45) inset,
        0 12px 32px rgba(37, 70, 130, 0.14);
      background: linear-gradient(165deg, #d0dced 0%, #becfe4 100%);
    }
    .why-index {
      position: absolute;
      top: 16px;
      right: 18px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--clx-text);
      opacity: 0.12;
      font-variant-numeric: tabular-nums;
    }
    .why-icon {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
      margin-bottom: 16px;
    }
    .why-icon ::ng-deep svg {
      width: 18px;
      height: 18px;
    }
    .why-card h4 {
      font-size: 0.98rem;
      font-weight: 650;
      color: var(--clx-text);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .why-card p {
      font-size: 0.86rem;
      color: var(--clx-text-muted);
      line-height: 1.55;
    }

    @media (max-width: 900px) {
      .why-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .why-head {
        position: static;
        max-width: 520px;
      }
    }
    @media (max-width: 560px) {
      .why-grid { grid-template-columns: 1fr; }
      .why-section { padding: 88px 0; }
    }
  `],
})
export class WhyChooseComponent {
  private readonly sanitizer = inject(DomSanitizer);

  private icon(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  readonly items: { title: string; text: string; accent: string; icon: SafeHtml }[] = [
    {
      title: 'Treinamento semanal',
      text: 'Sessões práticas com a equipe — não apenas documentação. Dúvidas resolvidas no fluxo real da clínica.',
      accent: '#3b6ef5',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`),
    },
    {
      title: 'Evolução com feedback',
      text: 'Roadmap guiado por quem usa no atendimento. Releases frequentes sem quebrar a rotina.',
      accent: '#0d9488',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`),
    },
    {
      title: 'Migração assistida',
      text: 'Importamos agendas, pacientes e históricos dos principais sistemas — com checklist e go-live controlado.',
      accent: '#6d5af0',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`),
    },
    {
      title: 'Suporte especializado',
      text: 'Atendimento humano, com gente que entende clínica. SLA claro e canal prioritário no plano profissional.',
      accent: '#d97706',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`),
    },
  ];

  constructor() {
    afterNextRender(() => {
      const cards = document.querySelectorAll('.why-card');
      if (!cards.length) return;
      // Import dinâmico evita circular; usa helper seguro
      import('../../../shared/utils/safe-reveal').then(({ safeRevealOnScroll }) => {
        safeRevealOnScroll(cards, { y: 8, duration: 0.15, stagger: 0.015, start: 'top 94%' });
      });
    });
  }
}
