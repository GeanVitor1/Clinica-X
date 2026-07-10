import { Component, inject, effect } from '@angular/core';
import gsap from 'gsap';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}">
          <div class="toast__icon">
            @switch (toast.type) {
              @case ('success') { <span>✓</span> }
              @case ('error') { <span>✕</span> }
              @case ('warning') { <span>!</span> }
              @case ('info') { <span>i</span> }
            }
          </div>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="dismiss(toast.id)">✕</button>
          <div class="toast__progress" [style.width.%]="toast.progress"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 380px;
    }
    .toast {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-radius: var(--clx-radius-lg);
      background: var(--clx-surface-1);
      box-shadow: var(--clx-shadow-xl);
      overflow: hidden;
      border: 1px solid var(--clx-border);
      backdrop-filter: blur(12px);
    }
    .toast__icon {
      width: 26px;
      height: 26px;
      border-radius: var(--clx-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.78rem;
      flex-shrink: 0;
    }
    .toast--success .toast__icon { background: var(--clx-success); color: #fff; }
    .toast--error .toast__icon { background: var(--clx-error); color: #fff; }
    .toast--warning .toast__icon { background: var(--clx-warning); color: #fff; }
    .toast--info .toast__icon { background: var(--clx-info); color: #fff; }
    .toast__message {
      flex: 1;
      font-size: 0.84rem;
      color: var(--clx-text-primary);
      font-weight: 500;
    }
    .toast__close {
      background: none;
      border: none;
      color: var(--clx-text-tertiary);
      cursor: pointer;
      font-size: 0.8rem;
      padding: 4px;
      border-radius: 4px;
      transition: color var(--clx-transition-fast);
    }
    .toast__close:hover { color: var(--clx-text-primary); }
    .toast__progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: currentColor;
      transition: width 0.05s linear;
    }
    .toast--success .toast__progress { background: var(--clx-success); }
    .toast--error .toast__progress { background: var(--clx-error); }
    .toast--warning .toast__progress { background: var(--clx-warning); }
    .toast--info .toast__progress { background: var(--clx-info); }
  `],
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  constructor() {
    effect(() => {
      const toasts = this.toastService.toasts();
      if (toasts.length > 0) {
        requestAnimationFrame(() => {
          const container = document.querySelector('.toast-container');
          if (container) {
            const lastEl = container.lastElementChild as HTMLElement;
            if (lastEl) {
              gsap.fromTo(lastEl, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
            }
          }
        });
      }
    });
  }

  dismiss(id: string) {
    const container = document.querySelector('.toast-container');
    if (!container) { this.toastService.dismiss(id); return; }
    const idx = this.toastService.toasts().findIndex(t => t.id === id);
    if (idx === -1) return;
    const el = container.children[idx] as HTMLElement;
    if (el) {
      gsap.to(el, {
        opacity: 0,
        x: 100,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => this.toastService.dismiss(id),
      });
    } else {
      this.toastService.dismiss(id);
    }
  }
}
