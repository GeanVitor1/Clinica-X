import { Component, afterNextRender, ElementRef, viewChild, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import gsap from 'gsap';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface AioItem {
  svg: SafeHtml;
  label: string;
  color: string;
}

@Component({
  selector: 'app-all-in-one',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="aio-section">
      <div class="aio-bg" aria-hidden="true">
        <div class="aio-orb"></div>
      </div>
      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-label">Ecossistema</span>
          <h2>Tudo que você precisa em um único login</h2>
          <p>Módulos integrados — sem ferramentas fragmentadas nem planilhas paralelas.</p>
        </div>

        <div class="aio-grid" #gridRef>
          @for (item of items; track item.label; let i = $index) {
            <div
              class="aio-card"
              [style.--card-delay]="i * 0.03 + 's'"
              [style.--card-color]="item.color"
            >
              <div class="aio-card-inner">
                <div class="aio-icon" [innerHTML]="item.svg"></div>
                <span class="aio-label">{{ item.label }}</span>
                <div class="aio-hover-glow"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .aio-section {
      position: relative;
      padding: 120px 0;
      background: transparent;
      overflow: hidden;
    }
    .aio-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .aio-orb {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      filter: blur(120px);
      background: radial-gradient(circle, rgba(59, 110, 245, 0.06), transparent 70%);
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }
    .section-head {
      text-align: center;
      max-width: 580px;
      margin: 0 auto 56px;
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
    .section-head h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 12px;
    }
    .section-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
    }

    .aio-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .aio-card {
      --card-color: var(--clx-accent);
      cursor: default;
    }
    .aio-card-inner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 26px 14px 22px;
      background: linear-gradient(165deg, #c6d5e9 0%, #b3c5df 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(20, 45, 90, 0.18);
      border-radius: 14px;
      text-align: center;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.18) inset,
        0 4px 14px rgba(20, 42, 85, 0.12);
      transition:
        transform 150ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 150ms ease,
        border-color 140ms ease,
        background 140ms ease;
    }
    .aio-card:hover .aio-card-inner {
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--card-color) 45%, rgba(37, 80, 150, 0.14));
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.45) inset,
        0 10px 28px rgba(37, 70, 130, 0.14);
      background: linear-gradient(165deg, #d0dced 0%, #becfe4 100%);
    }

    .aio-icon {
      width: 48px;
      height: 48px;
      border-radius: 13px;
      background: color-mix(in srgb, var(--card-color) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--card-color) 16%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--card-color);
      transition:
        transform 150ms cubic-bezier(0.16, 1, 0.3, 1),
        background 140ms ease,
        color 140ms ease,
        box-shadow 150ms ease,
        border-color 140ms ease;
      position: relative;
      z-index: 1;
    }
    .aio-icon ::ng-deep svg {
      width: 22px;
      height: 22px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    /* WhatsApp mark is filled */
    .aio-icon ::ng-deep svg[fill='currentColor'] {
      fill: currentColor;
      stroke: none;
    }
    .aio-card:hover .aio-icon {
      background: var(--card-color);
      border-color: transparent;
      color: #fff;
      transform: scale(1.06);
      box-shadow: 0 6px 18px color-mix(in srgb, var(--card-color) 35%, transparent);
    }

    .aio-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--clx-text);
      letter-spacing: -0.01em;
      line-height: 1.3;
      position: relative;
      z-index: 1;
    }
    .aio-hover-glow {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--card-color) 14%, transparent), transparent 70%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 150ms ease;
      transform: translate(-50%, -50%);
    }
    .aio-card:hover .aio-hover-glow {
      opacity: 1;
    }

    @media (max-width: 900px) {
      .aio-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 640px) {
      .aio-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .aio-card-inner { padding: 20px 10px 18px; }
      .aio-section { padding: 88px 0; }
    }
  `],
})
export class AllInOneComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly gridRef = viewChild<ElementRef>('gridRef');

  private icon(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  /** Custom mark icons — consistent 1.5 stroke, unique composition */
  readonly items: AioItem[] = [
    {
      label: 'Agenda inteligente',
      color: '#3b6ef5',
      svg: this.icon(`<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h4"/></svg>`),
    },
    {
      label: 'Cadastro de pacientes',
      color: '#6d5af0',
      svg: this.icon(`<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.4-3.2 2.8-5 5.5-5s5.1 1.8 5.5 5"/><path d="M17 9v6M14 12h6"/></svg>`),
    },
    {
      label: 'Fichas de anamnese',
      color: '#0d9488',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M9 4H7.5A2.5 2.5 0 0 0 5 6.5v13A2.5 2.5 0 0 0 7.5 22h9a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 16.5 4H15"/><rect x="9" y="2.5" width="6" height="3.5" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`),
    },
    {
      label: 'Termos e contratos',
      color: '#d97706',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21H16.5A2.5 2.5 0 0 0 19 18.5V8z"/><path d="M14 3v5h5"/><path d="M9 13l2 2 4-4"/></svg>`),
    },
    {
      label: 'Central de WhatsApp',
      color: '#25D366',
      svg: this.icon(`<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a10 10 0 0 0-8.6 15l-.9 3.4 3.5-.9A10 10 0 1 0 12 2zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.7-5.9c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.9-.1.1-.3.2-.5.1-1.3-.7-2.2-1.2-3.1-2.7-.2-.3.2-.3.6-1.1.1-.1 0-.2 0-.3 0-.1-.5-1.2-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 2 .9 2.3 1 2.5c.1.1 1.7 2.6 4.1 3.6 1.5.6 2.1.7 2.9.6.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1 0 0-.2-.1-.4-.2z"/></svg>`),
    },
    {
      label: 'Planejador de injetáveis',
      color: '#e11d48',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M14.5 3.5l6 6"/><path d="M16.5 5.5l-9 9-1.5 4 4-1.5 9-9"/><path d="M12 14l-2 2"/><path d="M6 18l-1.5 1.5"/></svg>`),
    },
    {
      label: 'Telemedicina',
      color: '#6d5af0',
      svg: this.icon(`<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5l5-2.5v8l-5-2.5"/><circle cx="9" cy="12" r="1.5"/></svg>`),
    },
    {
      label: 'Financeiro integrado',
      color: '#0d9488',
      svg: this.icon(`<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.2"/><path d="M6.5 12h.01M17.5 12h.01"/></svg>`),
    },
    {
      label: 'Vendas',
      color: '#ea580c',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M4 6h2l1.5 9.5a1.5 1.5 0 0 0 1.5 1.3h7.8a1.5 1.5 0 0 0 1.5-1.2L20 8H7"/><circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>`),
    },
    {
      label: 'Estoque',
      color: '#0891b2',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>`),
    },
    {
      label: 'Emissão de notas',
      color: '#4f46e5',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M6 3.5h9l4 4v13A1.5 1.5 0 0 1 17.5 22h-11A1.5 1.5 0 0 1 5 20.5v-15A1.5 1.5 0 0 1 6.5 4"/><path d="M14 3.5V8h4.5"/><path d="M8.5 12.5h7M8.5 16h5"/></svg>`),
    },
    {
      label: 'Transcrição de consultas',
      color: '#db2777',
      svg: this.icon(`<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21M8.5 21h7"/></svg>`),
    },
    {
      label: 'Painel do paciente',
      color: '#0d9488',
      svg: this.icon(`<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"/><path d="M5 19.5c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5"/><path d="M18 4.5l2 2-2 2M20 6.5h-4"/></svg>`),
    },
    {
      label: 'Avaliação facial com IA',
      color: '#7c3aed',
      svg: this.icon(`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`),
    },
    {
      label: 'Assistente de tarefas com IA',
      color: '#ca8a04',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8z"/><path d="M18.5 15.5l.7 2.2 2.3.7-2.3.7-.7 2.2-.7-2.2-2.3-.7 2.3-.7z"/></svg>`),
    },
    {
      label: 'Agente de IA para textos',
      color: '#0d9488',
      svg: this.icon(`<svg viewBox="0 0 24 24"><path d="M4 19.5l3.2-1.1A8 8 0 1 0 7.5 17.8L4 19.5z"/><path d="M9 11.5h6M9 14.5h4"/></svg>`),
    },
  ];

  constructor() {
    afterNextRender(() => {
      const cards = document.querySelectorAll('.aio-card');
      if (!cards.length) return;

      import('../../../shared/utils/safe-reveal').then(({ safeRevealOnScroll }) => {
        safeRevealOnScroll(cards, { y: 6, duration: 0.14, stagger: 0.012, start: 'top 94%' });
      });

      cards.forEach((card) => {
        const glow = card.querySelector('.aio-hover-glow') as HTMLElement;
        if (!glow) return;

        card.addEventListener('mousemove', (e: Event) => {
          const me = e as MouseEvent;
          const rect = card.getBoundingClientRect();
          const x = me.clientX - rect.left;
          const y = me.clientY - rect.top;
          gsap.to(glow, { x, y, opacity: 1, duration: 0.2 });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(glow, { opacity: 0, duration: 0.3 });
        });
      });
    });
  }
}
