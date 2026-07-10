import { Component, afterNextRender } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-why-choose',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="why-section">
      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-badge">POR QUE ESCOLHER</span>
          <h2>Por que escolher o ClinicaX</h2>
          <p>Recursos, suporte e benefícios que fazem do ClinicaX a escolha certa para quem quer crescer com eficiência, segurança e autonomia.</p>
        </div>

        <div class="why-grid" #gridRef>
          <div class="why-card">
            <div class="why-num">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><use href="#ic-graduation"/></svg>
            </div>
            <h4>Treinamento semanal</h4>
            <p>Demonstrações práticas com passo a passo e esclarecimento de dúvidas em tempo real.</p>
            <div class="why-glow"></div>
          </div>
          <div class="why-card">
            <div class="why-num">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><use href="#ic-refresh"/></svg>
            </div>
            <h4>Atualizações e feedbacks</h4>
            <p>Funcionalidades pensadas de acordo com a realidade de quem usa o sistema no dia a dia.</p>
            <div class="why-glow"></div>
          </div>
          <div class="why-card">
            <div class="why-num">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><use href="#ic-migrate"/></svg>
            </div>
            <h4>Migração de dados facilitada</h4>
            <p>Migre sem medo: contamos com migradores dos principais sistemas do mercado.</p>
            <div class="why-glow"></div>
          </div>
          <div class="why-card">
            <div class="why-num">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><use href="#ic-headphones"/></svg>
            </div>
            <h4>Suporte especializado</h4>
            <p>Nosso atendimento é humanizado, de pessoas para pessoas. Suporte real quando você precisa.</p>
            <div class="why-glow"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .why-section {
      position: relative;
      padding: 100px 0;
      background: var(--clx-bg-alt);
      overflow: hidden;
    }
    .why-section::before {
      content: '';
      position: absolute;
      top: -30%;
      left: -10%;
      width: 60%;
      height: 80%;
      background: radial-gradient(ellipse, rgba(37, 99, 235, 0.03), transparent);
      pointer-events: none;
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
    }
    .section-head {
      text-align: center;
      max-width: 640px;
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
      line-height: 1.6;
    }

    .why-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .why-card {
      position: relative;
      padding: 32px 24px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.25s;
    }
    .why-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.02), transparent);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
    }
    .why-card:hover {
      transform: translateY(-4px);
      border-color: var(--clx-accent);
      box-shadow: var(--clx-shadow-hover), 0 0 0 1px rgba(37, 99, 235, 0.04);
    }
    .why-card:hover::before { opacity: 1; }

    .why-num {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.05));
      border: 1px solid rgba(37, 99, 235, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--clx-accent);
      margin-bottom: 18px;
      transition: all 0.35s;
    }
    .why-card:hover .why-num {
      background: linear-gradient(135deg, var(--clx-accent), var(--clx-purple));
      color: #fff;
      transform: scale(1.08) rotate(-3deg);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
    }

    .why-card h4 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--clx-text);
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    .why-card p {
      font-size: 0.85rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .why-glow {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.03), transparent);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      transform: translate(-50%, -50%);
    }
    .why-card:hover .why-glow { opacity: 1; }

    @media (max-width: 860px) {
      .why-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .why-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class WhyChooseComponent {
  constructor() {
    gsap.registerPlugin(ScrollTrigger);

    afterNextRender(() => {
      const cards = document.querySelectorAll('.why-card');
      if (!cards.length) return;

      gsap.set(cards, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: cards[0].parentElement,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power3.out',
          });
        },
        once: true,
      });

      cards.forEach(card => {
        const inner = card as HTMLElement;
        const glow = card.querySelector('.why-glow') as HTMLElement;
        if (!glow) return;

        card.addEventListener('mousemove', (e: Event) => {
          const me = e as MouseEvent;
          const rect = inner.getBoundingClientRect();
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
