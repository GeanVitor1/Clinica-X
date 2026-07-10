import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      @switch (icon()) {
        @case ('pacientes') {
          <svg class="empty-state__svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <rect x="30" y="25" width="60" height="70" rx="10" stroke="var(--clx-accent)" stroke-width="2" fill="var(--clx-bg-alt)"/>
            <circle cx="60" cy="48" r="12" stroke="var(--clx-text-muted)" stroke-width="2" fill="none"/>
            <path d="M42 76c0-10 8-18 18-18s18 8 18 18" stroke="var(--clx-text-muted)" stroke-width="2" fill="none"/>
            <line x1="48" y1="78" x2="72" y2="78" stroke="var(--clx-accent)" stroke-width="2" stroke-linecap="round"/>
            <line x1="52" y1="84" x2="68" y2="84" stroke="var(--clx-accent)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        }
        @case ('agenda') {
          <svg class="empty-state__svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <rect x="25" y="20" width="70" height="80" rx="8" stroke="var(--clx-accent)" stroke-width="2" fill="var(--clx-bg-alt)"/>
            <line x1="25" y1="40" x2="95" y2="40" stroke="var(--clx-border)" stroke-width="2"/>
            <rect x="35" y="50" width="50" height="8" rx="4" stroke="var(--clx-text-muted)" stroke-width="1.5" fill="none"/>
            <rect x="35" y="65" width="40" height="8" rx="4" stroke="var(--clx-text-muted)" stroke-width="1.5" fill="none"/>
            <rect x="35" y="80" width="45" height="8" rx="4" stroke="var(--clx-text-muted)" stroke-width="1.5" fill="none"/>
            <line x1="40" y1="20" x2="40" y2="28" stroke="var(--clx-text-muted)" stroke-width="2"/>
            <line x1="80" y1="20" x2="80" y2="28" stroke="var(--clx-text-muted)" stroke-width="2"/>
          </svg>
        }
        @case ('relatorios') {
          <svg class="empty-state__svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <rect x="22" y="22" width="76" height="76" rx="10" stroke="var(--clx-accent)" stroke-width="2" fill="var(--clx-bg-alt)"/>
            <rect x="36" y="70" width="10" height="18" rx="2" fill="var(--clx-accent)" opacity="0.7"/>
            <rect x="52" y="55" width="10" height="33" rx="2" fill="var(--clx-accent)"/>
            <rect x="68" y="42" width="10" height="46" rx="2" fill="var(--clx-accent)" opacity="0.85"/>
          </svg>
        }
        @case ('prontuario') {
          <svg class="empty-state__svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <rect x="32" y="18" width="56" height="84" rx="8" stroke="var(--clx-accent)" stroke-width="2" fill="var(--clx-bg-alt)"/>
            <line x1="44" y1="40" x2="76" y2="40" stroke="var(--clx-text-muted)" stroke-width="2"/>
            <line x1="44" y1="54" x2="76" y2="54" stroke="var(--clx-text-muted)" stroke-width="2"/>
            <line x1="44" y1="68" x2="66" y2="68" stroke="var(--clx-text-muted)" stroke-width="2"/>
            <circle cx="78" cy="82" r="14" fill="var(--clx-accent)"/>
            <path d="M78 74v16M70 82h16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        }
        @default {
          <svg class="empty-state__svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <circle cx="60" cy="55" r="28" stroke="var(--clx-accent)" stroke-width="2" fill="var(--clx-bg-alt)"/>
            <path d="M44 55l10 10 22-22" stroke="var(--clx-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        }
      }
      <p class="empty-state__text">{{ message() }}</p>
      @if (actionLabel()) {
        <button type="button" class="empty-state__btn" (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 20px;
      text-align: center;
      grid-column: 1 / -1;
    }
    .empty-state__svg { width: 88px; height: 88px; margin-bottom: 20px; opacity: 0.7; }
    .empty-state__text { font-size: 0.88rem; color: var(--clx-text-secondary); margin-bottom: 20px; max-width: 280px; line-height: 1.5; }
    .empty-state__btn {
      padding: 9px 20px;
      background: var(--clx-accent);
      color: #fff;
      border: none;
      border-radius: var(--clx-radius-md);
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
    }
    .empty-state__btn:hover { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); transform: translateY(-1px); }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<'pacientes' | 'agenda' | 'relatorios' | 'prontuario' | 'default'>('default');
  readonly message = input('Nenhum dado encontrado.');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
