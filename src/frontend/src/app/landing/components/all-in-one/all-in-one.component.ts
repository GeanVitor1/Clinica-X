import { Component, afterNextRender, ElementRef, viewChild } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface AioItem {
  icon: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-all-in-one',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="aio-section">
      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-badge">TUDO EM UM</span>
          <h2>Tudo que você precisa em um único login</h2>
          <p>Em poucos cliques, a gestão 360° do seu negócio</p>
        </div>

        <div class="aio-grid" #gridRef>
          @for (item of items; track item.label; let i = $index) {
            <div class="aio-card" [style.--card-delay]="i * 0.04 + 's'" [style.--card-color]="item.color">
              <div class="aio-card-inner">
                <div class="aio-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><use [attr.href]="item.icon"/></svg>
                </div>
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
      padding: 120px 0;
      background: var(--clx-bg-alt);
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
    }
    .section-head {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 60px;
    }
    .section-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 100px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.05));
      color: var(--clx-accent);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 16px;
      border: 1px solid rgba(37, 99, 235, 0.1);
    }
    .section-head h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }
    .section-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
    }

    .aio-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .aio-card {
      --card-color: var(--clx-accent);
      perspective: 600px;
      cursor: default;
    }
    .aio-card-inner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 28px 16px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 16px;
      text-align: center;
      transition: all 0.25s;
      overflow: hidden;
    }
    .aio-card-inner::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: linear-gradient(135deg, transparent, transparent);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
    }
    .aio-card:hover .aio-card-inner {
      transform: translateY(-4px);
      border-color: var(--card-color);
      box-shadow: var(--clx-shadow-hover), 0 0 0 1px rgba(37, 99, 235, 0.04);
    }
    .aio-card:hover .aio-card-inner::before {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.02), transparent);
      opacity: 1;
    }
    .aio-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(124, 58, 237, 0.03));
      border: 1px solid rgba(37, 99, 235, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--card-color);
      transition: all 0.3s;
      position: relative;
      z-index: 1;
    }
    .aio-card:hover .aio-icon {
      background: linear-gradient(135deg, var(--card-color), rgba(124, 58, 237, 0.8));
      color: #fff;
      transform: scale(1.12);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
    }
    .aio-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--clx-text);
      position: relative;
      z-index: 1;
    }
    .aio-hover-glow {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.04), transparent);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      transform: translate(-50%, -50%);
    }
    .aio-card:hover .aio-hover-glow {
      opacity: 1;
    }

    @media (max-width: 860px) {
      .aio-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .aio-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .aio-card-inner { padding: 18px 12px; }
    }
  `],
})
export class AllInOneComponent {
  readonly gridRef = viewChild<ElementRef>('gridRef');

  readonly items: AioItem[] = [
    { icon: '#ic-calendar', label: 'Agenda inteligente', color: '#1463ff' },
    { icon: '#ic-users', label: 'Cadastro de pacientes', color: '#6213ff' },
    { icon: '#ic-clipboard', label: 'Fichas de anamnese', color: '#14b8a6' },
    { icon: '#ic-file-text', label: 'Termos e contratos', color: '#f59e0b' },
    { icon: '#ic-message', label: 'Central de WhatsApp', color: '#22c55e' },
    { icon: '#ic-syringe', label: 'Planejador de injetáveis', color: '#ef4444' },
    { icon: '#ic-video', label: 'Telemedicina', color: '#8b5cf6' },
    { icon: '#ic-banknote', label: 'Financeiro integrado', color: '#10b981' },
    { icon: '#ic-cart', label: 'Vendas', color: '#f97316' },
    { icon: '#ic-package', label: 'Estoque', color: '#06b6d4' },
    { icon: '#ic-receipt', label: 'Emissão de notas', color: '#6366f1' },
    { icon: '#ic-mic', label: 'Transcrição de consultas', color: '#ec4899' },
    { icon: '#ic-link', label: 'Painel do paciente', color: '#14b8a6' },
    { icon: '#ic-target', label: 'Avaliação facial com IA', color: '#a855f7' },
    { icon: '#ic-sparkle', label: 'Assistente de tarefas com IA', color: '#eab308' },
    { icon: '#ic-pen', label: 'Agente de IA para textos', color: '#14b8a6' },
  ];

  constructor() {
    gsap.registerPlugin(ScrollTrigger);

    afterNextRender(() => {
      const cards = document.querySelectorAll('.aio-card');
      if (!cards.length) return;

      gsap.set(cards, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: cards[0].parentElement,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power2.out',
          });
        },
        once: true,
      });

      cards.forEach(card => {
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
