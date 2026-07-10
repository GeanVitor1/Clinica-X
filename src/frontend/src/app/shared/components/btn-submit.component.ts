import { Component, input } from '@angular/core';

export type BtnSubmitState = 'idle' | 'loading' | 'done';

@Component({
  selector: 'app-btn-submit',
  standalone: true,
  template: `
    <button
      class="btn-submit"
      [class]="'btn-submit--' + state()"
      [type]="type()"
      [disabled]="state() !== 'idle' || disabled()"
    >
      @if (state() === 'idle') {
        <span>{{ label() }}</span>
      }
      @if (state() === 'loading') {
        <span class="btn-submit__spinner" aria-hidden="true"></span>
        <span>{{ loadingLabel() }}</span>
      }
      @if (state() === 'done') {
        <span class="btn-submit__check" aria-hidden="true">✓</span>
        <span>{{ doneLabel() }}</span>
      }
    </button>
  `,
  styles: [`
    .btn-submit {
      padding: 10px 22px;
      border: none;
      border-radius: var(--clx-radius-md);
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all var(--clx-transition-base);
      font-size: 0.86rem;
      font-family: var(--clx-font);
      line-height: 1;
    }
    .btn-submit--idle { background: var(--clx-accent); color: #fff; }
    .btn-submit--idle:hover:not(:disabled) { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); transform: translateY(-1px); }
    .btn-submit--loading { background: var(--clx-surface-4); color: var(--clx-text-secondary); cursor: default; }
    .btn-submit--done { background: var(--clx-success); color: #fff; cursor: default; }
    .btn-submit:disabled { opacity: 0.75; cursor: default; }
    .btn-submit__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    .btn-submit__check { font-size: 1rem; font-weight: 700; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class BtnSubmitComponent {
  readonly type = input<'button' | 'submit'>('submit');
  readonly label = input('Salvar');
  readonly loadingLabel = input('Salvando...');
  readonly doneLabel = input('Salvo!');
  readonly state = input<BtnSubmitState>('idle');
  readonly disabled = input(false);
}
