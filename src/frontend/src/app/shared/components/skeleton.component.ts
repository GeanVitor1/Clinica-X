import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [class]="'skeleton--' + variant()">
      @switch (variant()) {
        @case ('card') {
          <div class="skeleton__line skeleton__line--title"></div>
          <div class="skeleton__line"></div>
          <div class="skeleton__line skeleton__line--short"></div>
        }
        @case ('table') {
          <div class="skeleton__row" style="width:100%"></div>
          <div class="skeleton__row" style="width:95%"></div>
          <div class="skeleton__row" style="width:90%"></div>
          <div class="skeleton__row" style="width:85%"></div>
        }
        @case ('chart') {
          <div class="skeleton__bars">
            <span style="height:60%"></span>
            <span style="height:80%"></span>
            <span style="height:40%"></span>
            <span style="height:90%"></span>
            <span style="height:50%"></span>
          </div>
        }
        @default {
          <div class="skeleton__line" style="width:100%"></div>
          <div class="skeleton__line" style="width:80%"></div>
          <div class="skeleton__line" style="width:60%"></div>
        }
      }
    </div>
  `,
  styles: [`
    .skeleton { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
    .skeleton__line { height: 12px; background: var(--clx-surface-3); border-radius: var(--clx-radius-xs); animation: pulse 2s ease-in-out infinite; }
    .skeleton__line--title { width: 50%; height: 16px; }
    .skeleton__line--short { width: 35%; }
    .skeleton--card { background: var(--clx-surface-1); border: 1px solid var(--clx-border); border-radius: var(--clx-radius-lg); padding: 24px; }
    .skeleton__row { height: 28px; background: var(--clx-surface-3); border-radius: var(--clx-radius-xs); animation: pulse 2s ease-in-out infinite; }
    .skeleton__bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
    .skeleton__bars span { flex: 1; background: var(--clx-surface-3); border-radius: var(--clx-radius-xs) var(--clx-radius-xs) 0 0; animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  `],
})
export class SkeletonComponent {
  readonly variant = input<'card' | 'table' | 'chart' | 'text'>('text');
}
