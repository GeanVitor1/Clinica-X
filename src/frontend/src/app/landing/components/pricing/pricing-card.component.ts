import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  template: `
    <div class="pricing-card" [class.recommended]="recommended()">
      @if (recommended()) {
        <div class="badge">Recomendado</div>
      }
      <h3>{{ name() }}</h3>
      <div class="price">
        <span class="amount">{{ monthly() ? monthlyPrice() : annualPrice() }}</span>
        <span class="period">/mês</span>
      </div>
      <ul class="benefits">
        @for (item of items(); track item) {
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {{ item }}
          </li>
        }
      </ul>
      <button class="pricing-cta">Assinar</button>
    </div>
  `,
  styles: [`
    .pricing-card {
      flex: 1;
      min-width: 260px;
      max-width: 320px;
      padding: 40px 28px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 20px;
      text-align: center;
      position: relative;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .pricing-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--clx-shadow-hover);
    }
    .pricing-card.recommended {
      transform: translateY(-8px);
      border-color: var(--clx-accent);
      box-shadow: var(--clx-glow), var(--clx-shadow);
    }
    .pricing-card.recommended:hover {
      transform: translateY(-12px);
      box-shadow: var(--clx-glow), var(--clx-shadow-hover);
    }
    .badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      padding: 6px 18px;
      background: linear-gradient(135deg, var(--clx-accent), var(--clx-purple));
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 20px;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .pricing-card h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--clx-text);
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }
    .price {
      margin-bottom: 28px;
    }
    .amount {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--clx-text);
      letter-spacing: -0.03em;
    }
    .period {
      font-size: 0.9rem;
      color: var(--clx-text-muted);
      font-weight: 500;
    }
    .benefits {
      list-style: none;
      margin: 0 0 32px;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .benefits li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      color: var(--clx-text-muted);
      text-align: left;
    }
    .benefits li svg {
      flex-shrink: 0;
      color: var(--clx-success);
    }
    .pricing-cta {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: var(--clx-radius-sm);
      background: var(--clx-accent);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pricing-cta:hover {
      background: var(--clx-accent-light);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
    }
  `],
})
export class PricingCardComponent {
  readonly name = input.required<string>();
  readonly monthlyPrice = input.required<string>();
  readonly annualPrice = input.required<string>();
  readonly items = input.required<string[]>();
  readonly recommended = input(false);
  readonly monthly = input(true);
}
