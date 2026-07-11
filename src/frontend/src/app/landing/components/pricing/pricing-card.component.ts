import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  template: `
    <div class="pricing-card" [class.recommended]="recommended()">
      @if (recommended()) {
        <div class="badge">Mais escolhido</div>
      }
      <div class="card-top">
        <h3>{{ name() }}</h3>
        <div class="price">
          <span class="amount">{{ monthly() ? monthlyPrice() : annualPrice() }}</span>
          <span class="period">/mês</span>
        </div>
        @if (!monthly()) {
          <p class="billing-note">Cobrança anual · economia de ~20%</p>
        } @else {
          <p class="billing-note">Cobrança mensal, cancele quando quiser</p>
        }
      </div>

      <ul class="benefits">
        @for (item of items(); track item) {
          <li>
            <span class="check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            {{ item }}
          </li>
        }
      </ul>

      <button type="button" class="pricing-cta" [class.pricing-cta--primary]="recommended()">
        {{ recommended() ? 'Começar agora' : 'Assinar' }}
      </button>
    </div>
  `,
  styles: [`
    .pricing-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 28px 24px 24px;
      background: linear-gradient(165deg, #c6d5e9 0%, #b3c5df 100%);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(20, 45, 90, 0.18);
      border-radius: 16px;
      text-align: left;
      position: relative;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.18) inset,
        0 8px 24px rgba(20, 42, 85, 0.14);
      transition:
        transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 280ms ease,
        border-color 240ms ease,
        background 240ms ease;
    }
    .pricing-card:hover {
      transform: translateY(-3px);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.5) inset,
        0 14px 36px rgba(37, 70, 130, 0.14);
      border-color: rgba(59, 110, 245, 0.3);
      background: linear-gradient(165deg, #d0dced 0%, #becfe4 100%);
    }
    .pricing-card.recommended {
      background: linear-gradient(165deg, #b8cce4 0%, #a6bddc 100%);
      border-color: rgba(59, 110, 245, 0.42);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.2) inset,
        0 0 0 1px rgba(59, 110, 245, 0.16),
        0 12px 36px rgba(35, 75, 160, 0.2);
    }
    .pricing-card.recommended:hover {
      box-shadow: var(--clx-shadow-glow-lg), var(--clx-shadow-card-hover);
    }
    .badge {
      position: absolute;
      top: -11px;
      left: 20px;
      padding: 4px 10px;
      background: var(--clx-accent);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      border-radius: 7px;
      letter-spacing: 0.01em;
    }
    .card-top {
      margin-bottom: 22px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--clx-border);
    }
    .pricing-card h3 {
      font-size: 0.95rem;
      font-weight: 650;
      color: var(--clx-text);
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .price {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 6px;
    }
    .amount {
      font-size: 2.15rem;
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .period {
      font-size: 0.88rem;
      color: var(--clx-text-muted);
      font-weight: 500;
    }
    .billing-note {
      font-size: 0.75rem;
      color: var(--clx-text-tertiary);
    }
    .benefits {
      list-style: none;
      margin: 0 0 24px;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }
    .benefits li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.88rem;
      color: var(--clx-text-secondary);
      line-height: 1.4;
    }
    .check {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      background: rgba(5, 150, 105, 0.1);
      color: var(--clx-success);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .pricing-cta {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--clx-border-strong);
      border-radius: 11px;
      background: transparent;
      color: var(--clx-text);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition:
        transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 180ms ease,
        background 180ms ease,
        border-color 180ms ease,
        color 180ms ease;
    }
    .pricing-cta:hover {
      background: var(--clx-bg-soft);
      transform: translateY(-1px);
    }
    .pricing-cta--primary {
      background: var(--clx-accent);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 14px rgba(59, 110, 245, 0.28);
    }
    .pricing-cta--primary:hover {
      background: var(--clx-accent-hover);
      box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 8px 20px rgba(59, 110, 245, 0.34);
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
