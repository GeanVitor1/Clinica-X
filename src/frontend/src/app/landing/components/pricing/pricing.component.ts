import { Component, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { PricingCardComponent } from './pricing-card.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [AnimateOnScrollDirective, PricingCardComponent],
  template: `
    <section class="pricing" id="planos">
      <h2 class="pricing-title">Planos</h2>
      <div class="toggle">
        <span [class.active]="!annual()">Mensal</span>
        <button class="toggle-pill" (click)="toggle()">
          <span class="pill" [class.annual]="annual()"></span>
        </button>
        <span [class.active]="annual()">Anual</span>
      </div>
      <div class="pricing-cards">
        <div appAnimateOnScroll>
          <app-pricing-card
            name="Básico"
            monthlyPrice="R$ 97"
            annualPrice="R$ 77"
            [monthly]="!annual()"
            [items]="['Até 50 pacientes', 'Agenda completa', 'Lembretes WhatsApp', 'Suporte email']"
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
    </section>
  `,
  styles: [`
    .pricing {
      padding: 120px 24px;
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }
    .pricing-title {
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 40px;
    }
    .toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 48px;
    }
    .toggle span {
      font-size: 0.9rem;
      color: var(--clx-text-muted);
      transition: color 0.2s;
    }
    .toggle span.active {
      color: var(--clx-accent);
      font-weight: 600;
    }
    .toggle-pill {
      width: 52px;
      height: 28px;
      border-radius: 14px;
      background: var(--clx-border);
      border: none;
      cursor: pointer;
      position: relative;
      transition: background 0.3s;
    }
    .toggle-pill:hover {
      border-color: var(--clx-accent);
    }
    .pill {
      display: block;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--clx-accent);
      position: absolute;
      top: 3px;
      left: 3px;
      transition: transform 0.3s;
    }
    .pill.annual {
      transform: translateX(24px);
    }
    .pricing-cards {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
    }
  `],
})
export class PricingComponent {
  annual = signal(false);

  toggle() {
    this.annual.update(v => !v);
  }
}
