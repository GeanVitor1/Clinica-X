import { Component, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { PricingCardComponent } from './pricing-card.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [AnimateOnScrollDirective, PricingCardComponent],
  template: `
    <section class="pricing" id="planos">
      <div class="pricing-inner">
        <header class="pricing-head" appAnimateOnScroll>
          <span class="section-label">Planos</span>
          <h2>Escolha o ritmo da sua clínica</h2>
          <p>Sem surpresas. Troque de plano quando a operação pedir — com suporte incluso desde o primeiro dia.</p>

          <div class="billing-toggle" role="group" aria-label="Período de cobrança">
            <button type="button" [class.active]="!annual()" (click)="annual.set(false)">Mensal</button>
            <button type="button" [class.active]="annual()" (click)="annual.set(true)">
              Anual
              <span class="save-tag">−20%</span>
            </button>
          </div>
        </header>

        <div class="pricing-cards">
          <div appAnimateOnScroll>
            <app-pricing-card
              name="Básico"
              monthlyPrice="R$ 97"
              annualPrice="R$ 77"
              [monthly]="!annual()"
              [items]="['Até 50 pacientes', 'Agenda completa', 'Lembretes WhatsApp', 'Suporte por e-mail']"
            />
          </div>
          <div appAnimateOnScroll>
            <app-pricing-card
              name="Profissional"
              monthlyPrice="R$ 197"
              annualPrice="R$ 157"
              [monthly]="!annual()"
              [recommended]="true"
              [items]="['Pacientes ilimitados', 'Prontuário digital', 'Relatórios PDF', 'Suporte prioritário']"
            />
          </div>
          <div appAnimateOnScroll>
            <app-pricing-card
              name="Premium"
              monthlyPrice="R$ 297"
              annualPrice="R$ 237"
              [monthly]="!annual()"
              [items]="['Tudo do Profissional', 'Múltiplas clínicas', 'API personalizada', 'Gerente de conta']"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .pricing {
      position: relative;
      padding: 112px 24px;
      background: transparent;
      overflow: hidden;
    }
    .pricing::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 50% 40% at 50% 0%, rgba(59, 110, 245, 0.06), transparent 55%);
      pointer-events: none;
    }
    .pricing-inner {
      max-width: 1100px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .pricing-head {
      text-align: center;
      max-width: 520px;
      margin: 0 auto 48px;
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
    .pricing-head h2 {
      font-size: clamp(1.7rem, 3vw, 2.3rem);
      font-weight: 700;
      color: var(--clx-text);
      letter-spacing: -0.035em;
      margin-bottom: 12px;
    }
    .pricing-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .billing-toggle {
      display: inline-flex;
      padding: 4px;
      background: var(--clx-bg-alt);
      border: 1px solid var(--clx-border);
      border-radius: 12px;
      gap: 2px;
    }
    .billing-toggle button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      border: none;
      border-radius: 9px;
      background: transparent;
      color: var(--clx-text-muted);
      font-size: 0.86rem;
      font-weight: 550;
      font-family: inherit;
      cursor: pointer;
      transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease;
    }
    .billing-toggle button.active {
      background: var(--clx-bg);
      color: var(--clx-text);
      box-shadow: var(--clx-shadow-xs), 0 0 0 1px var(--clx-border);
      font-weight: 600;
    }
    .save-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: #0d9488;
      background: rgba(13, 148, 136, 0.12);
      padding: 2px 6px;
      border-radius: 5px;
    }

    .pricing-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: stretch;
    }

    @media (max-width: 900px) {
      .pricing-cards {
        grid-template-columns: 1fr;
        max-width: 380px;
        margin: 0 auto;
      }
      .pricing { padding: 88px 20px; }
    }
  `],
})
export class PricingComponent {
  annual = signal(false);
}
