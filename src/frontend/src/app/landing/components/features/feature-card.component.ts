import { Component, input, ElementRef, viewChild, afterNextRender } from '@angular/core';
import gsap from 'gsap';
import { DemoAgendaComponent } from './demos/demo-agenda.component';
import { DemoProntuarioComponent } from './demos/demo-prontuario.component';
import { DemoWhatsappComponent } from './demos/demo-whatsapp.component';
import { DemoRelatoriosComponent } from './demos/demo-relatorios.component';
import { DemoPacientesComponent } from './demos/demo-pacientes.component';
import { DemoPwaComponent } from './demos/demo-pwa.component';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [
    DemoAgendaComponent,
    DemoProntuarioComponent,
    DemoWhatsappComponent,
    DemoRelatoriosComponent,
    DemoPacientesComponent,
    DemoPwaComponent,
  ],
  template: `
    <div class="feature-stage" #cardRef>
      <!-- ambient layers (VSL product mock) -->
      <div class="stage-orb stage-orb--a" aria-hidden="true"></div>
      <div class="stage-orb stage-orb--b" aria-hidden="true"></div>
      <div class="stage-grid" aria-hidden="true"></div>

      <div class="feature-card">
        <div class="fc-chrome" aria-hidden="true">
          <div class="chrome-dots">
            <span class="dot dot--r"></span>
            <span class="dot dot--y"></span>
            <span class="dot dot--g"></span>
          </div>
          <div class="chrome-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>app.clinicax.com</span>
          </div>
          <div class="chrome-live">
            <span class="live-dot"></span>
            Ao vivo
          </div>
        </div>

        <div class="fc-shine" aria-hidden="true"></div>
        <div class="fc-glow" #glowRef></div>
        <div class="fc-border-glow" aria-hidden="true"></div>

        <div class="fc-content">
          @switch (demoType()) {
            @case ('agenda') { <app-demo-agenda /> }
            @case ('prontuario') { <app-demo-prontuario /> }
            @case ('whatsapp') { <app-demo-whatsapp /> }
            @case ('relatorios') { <app-demo-relatorios /> }
            @case ('pacientes') { <app-demo-pacientes /> }
            @case ('pwa') { <app-demo-pwa /> }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    /* Outer stage — depth without changing flow width */
    .feature-stage {
      position: relative;
      width: 100%;
      padding: 10px 6px 14px;
      overflow: visible;
      overflow-anchor: none;
    }

    .stage-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(42px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.55;
      transition: opacity 200ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .stage-orb--a {
      width: 55%;
      height: 55%;
      top: -8%;
      right: -4%;
      background: radial-gradient(circle, color-mix(in srgb, var(--feature-accent, #3b6ef5) 55%, transparent), transparent 70%);
    }
    .stage-orb--b {
      width: 45%;
      height: 45%;
      bottom: -6%;
      left: -2%;
      background: radial-gradient(circle, rgba(13, 148, 136, 0.28), transparent 72%);
    }
    .feature-stage:hover .stage-orb--a { opacity: 0.85; transform: scale(1.06); }
    .feature-stage:hover .stage-orb--b { opacity: 0.75; transform: scale(1.04); }

    .stage-grid {
      position: absolute;
      inset: 18px 12px;
      border-radius: 22px;
      background-image:
        linear-gradient(rgba(59, 110, 245, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 110, 245, 0.06) 1px, transparent 1px);
      background-size: 22px 22px;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 45%, #000 20%, transparent 75%);
      pointer-events: none;
      z-index: 0;
      opacity: 0.7;
    }

    .feature-card {
      position: relative;
      z-index: 1;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.18) 100%),
        linear-gradient(165deg, #d4e0f2 0%, #c0d0e8 42%, #aebfdc 100%);
      backdrop-filter: blur(18px) saturate(1.15);
      -webkit-backdrop-filter: blur(18px) saturate(1.15);
      border-radius: 20px;
      padding: 0 0 18px;
      overflow: hidden;
      overflow-anchor: none;
      contain: layout style;
      border: 1px solid rgba(255, 255, 255, 0.55);
      box-shadow:
        0 0 0 1px rgba(25, 50, 100, 0.08),
        0 1px 0 rgba(255, 255, 255, 0.65) inset,
        0 10px 28px rgba(25, 50, 110, 0.12),
        0 28px 56px rgba(25, 50, 110, 0.14),
        0 0 0 1px color-mix(in srgb, var(--feature-accent, #3b6ef5) 10%, transparent);
      color: #0f1b33;
      transition:
        transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1),
        border-color 140ms ease;
    }

    .feature-card:hover {
      transform: translateY(-6px) scale(1.008);
      border-color: rgba(255, 255, 255, 0.75);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--feature-accent, #3b6ef5) 28%, transparent),
        0 1px 0 rgba(255, 255, 255, 0.75) inset,
        0 14px 36px rgba(25, 50, 110, 0.14),
        0 36px 72px color-mix(in srgb, var(--feature-accent, #3b6ef5) 18%, transparent);
    }

    /* Window chrome — VSL product screenshot feel */
    .fc-chrome {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px 10px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(232, 240, 252, 0.55) 100%);
      border-bottom: 1px solid rgba(30, 55, 110, 0.1);
    }
    .chrome-dots {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06) inset;
    }
    .dot--r { background: #ff5f57; }
    .dot--y { background: #febc2e; }
    .dot--g { background: #28c840; }

    .chrome-pill {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(30, 55, 110, 0.1);
      color: #4a6080;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      box-shadow: 0 1px 2px rgba(20, 40, 80, 0.04);
    }
    .chrome-pill span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chrome-pill svg { flex-shrink: 0; opacity: 0.7; }

    .chrome-live {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #0d9488;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(13, 148, 136, 0.1);
      border: 1px solid rgba(13, 148, 136, 0.16);
    }
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #0d9488;
      box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.45);
      animation: livePulse 1.8s ease-out infinite;
    }
    @keyframes livePulse {
      0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.45); }
      70% { box-shadow: 0 0 0 6px rgba(13, 148, 136, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
    }

    .fc-border-glow {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      z-index: 4;
      opacity: 0;
      transition: opacity 180ms ease;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--feature-accent, #3b6ef5) 35%, transparent),
        inset 0 0 40px color-mix(in srgb, var(--feature-accent, #3b6ef5) 8%, transparent);
    }
    .feature-card:hover .fc-border-glow { opacity: 1; }

    .fc-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        115deg,
        transparent 28%,
        rgba(255, 255, 255, 0.14) 48%,
        transparent 68%
      );
      opacity: 0;
      transform: translateX(-40%);
      transition: opacity 180ms ease, transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 3;
    }
    .feature-card:hover .fc-shine {
      opacity: 1;
      transform: translateX(40%);
    }

    .fc-glow {
      position: absolute;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--feature-accent, #3b6ef5) 22%, transparent), transparent 70%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 300ms ease;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
    .feature-card:hover .fc-glow { opacity: 1; }

    .fc-content {
      position: relative;
      z-index: 2;
      padding: 14px 16px 4px;
      overflow: visible;
      overflow-anchor: none;
    }

    @media (max-width: 640px) {
      .feature-stage { padding: 6px 2px 10px; }
      .feature-card { border-radius: 16px; }
      .chrome-live { display: none; }
      .fc-content { padding: 12px 12px 2px; }
      .chrome-pill { font-size: 0.62rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      .feature-card,
      .feature-card:hover,
      .fc-shine,
      .stage-orb,
      .live-dot {
        transition: none !important;
        animation: none !important;
        transform: none !important;
      }
    }
  `],
})
export class FeatureCardComponent {
  readonly demoType = input.required<string>();
  readonly cardRef = viewChild<ElementRef>('cardRef');
  readonly glowRef = viewChild<ElementRef>('glowRef');

  constructor() {
    afterNextRender(() => {
      const stage = this.cardRef()?.nativeElement as HTMLElement | undefined;
      const card = stage?.querySelector('.feature-card') as HTMLElement | null;
      const glow = this.glowRef()?.nativeElement;
      if (!card) return;

      this.lockCardHeight(card);

      if (!glow) return;
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gsap.to(glow, { x, y, opacity: 1, duration: 0.12, ease: 'power2.out' });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(glow, { opacity: 0, duration: 0.12, ease: 'power2.out' });
      });
    });
  }

  private lockCardHeight(card: HTMLElement) {
    let locked = 0;

    const apply = (h: number) => {
      const next = Math.ceil(h);
      if (next <= 0) return;
      if (next < locked) {
        card.style.height = `${locked}px`;
        card.style.minHeight = `${locked}px`;
        return;
      }
      locked = next;
      card.style.boxSizing = 'border-box';
      card.style.height = `${locked}px`;
      card.style.minHeight = `${locked}px`;
    };

    const measure = () => apply(card.getBoundingClientRect().height);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measure();

        const ro = new ResizeObserver(() => {
          const h = card.getBoundingClientRect().height;
          if (h > locked + 0.5) {
            apply(h);
          } else if (locked > 0 && h < locked - 0.5) {
            apply(locked);
          }
        });
        ro.observe(card);

        // Mede de novo após o demo WhatsApp (480px) estabilizar
        window.setTimeout(() => {
          measure();
          ro.disconnect();
          if (locked > 0) {
            card.style.height = `${locked}px`;
            card.style.minHeight = `${locked}px`;
            card.style.maxHeight = `${locked}px`;
          }
        }, 400);
      });
    });
  }
}
