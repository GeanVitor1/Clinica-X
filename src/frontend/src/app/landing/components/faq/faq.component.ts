import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [AnimateOnScrollDirective, RouterLink],
  template: `
    <section class="faq-section" id="faq">
      <div class="container">
        <div class="faq-layout">
          <header class="faq-head" appAnimateOnScroll>
            <span class="section-label">Perguntas frequentes</span>
            <h2>Respostas diretas, sem rodeio</h2>
            <p>O essencial para decidir se o ClinicaX encaixa na operação da sua clínica.</p>
            <a routerLink="/auth/login" class="faq-link">
              Ainda com dúvida? Fale com a gente
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </header>

          <div class="faq-list" appAnimateOnScroll>
            @for (item of items(); track item.question; let i = $index) {
              <div class="faq-item" [class.open]="item.open">
                <button
                  type="button"
                  class="faq-question"
                  (click)="toggle(i)"
                  [attr.aria-expanded]="item.open"
                >
                  <span class="faq-q-text">{{ item.question }}</span>
                  <span class="faq-icon" aria-hidden="true">
                    <span class="faq-icon-h"></span>
                    <span class="faq-icon-v" [class.hide]="item.open"></span>
                  </span>
                </button>
                <div class="faq-answer" [style.maxHeight]="item.open ? answerHeights()[i] + 'px' : '0'">
                  <div class="faq-answer-inner">
                    <p>{{ item.answer }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .faq-section {
      position: relative;
      padding: 112px 0;
      background: transparent;
      overflow: hidden;
    }
    .faq-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 50% 40% at 100% 0%, rgba(59, 110, 245, 0.05), transparent 55%);
      pointer-events: none;
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }
    .faq-layout {
      display: grid;
      grid-template-columns: 0.85fr 1.15fr;
      gap: 56px;
      align-items: start;
    }
    .faq-head {
      position: sticky;
      top: 100px;
      max-width: 360px;
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
    .faq-head h2 {
      font-size: clamp(1.65rem, 2.8vw, 2.2rem);
      font-weight: 700;
      color: var(--clx-text);
      letter-spacing: -0.035em;
      line-height: 1.15;
      margin-bottom: 12px;
    }
    .faq-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      margin-bottom: 22px;
    }
    .faq-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--clx-accent);
      text-decoration: none;
      transition: gap 200ms ease, color 200ms ease;
    }
    .faq-link:hover {
      gap: 12px;
      color: var(--clx-accent-hover);
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .faq-item {
      background: linear-gradient(165deg, #c6d5e9 0%, #b4c6e0 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(20, 45, 90, 0.18);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18) inset;
      transition: border-color 220ms ease, box-shadow 220ms ease;
    }
    .faq-item:hover {
      border-color: color-mix(in srgb, var(--clx-accent) 25%, var(--clx-border));
    }
    .faq-item.open {
      border-color: color-mix(in srgb, var(--clx-accent) 35%, var(--clx-border));
      box-shadow: 0 8px 28px rgba(59, 110, 245, 0.06);
    }
    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
    }
    .faq-q-text {
      font-size: 0.94rem;
      font-weight: 600;
      color: var(--clx-text);
      letter-spacing: -0.015em;
      line-height: 1.35;
    }
    .faq-item.open .faq-q-text {
      color: var(--clx-accent);
    }
    .faq-icon {
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--clx-bg-soft);
      border: 1px solid var(--clx-border);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .faq-item.open .faq-icon {
      background: var(--clx-accent-muted);
      border-color: rgba(59, 110, 245, 0.2);
    }
    .faq-icon-h,
    .faq-icon-v {
      position: absolute;
      background: var(--clx-text-muted);
      border-radius: 1px;
      transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease, background 200ms ease;
    }
    .faq-icon-h { width: 10px; height: 1.5px; }
    .faq-icon-v { width: 1.5px; height: 10px; }
    .faq-icon-v.hide { transform: scaleY(0); opacity: 0; }
    .faq-item.open .faq-icon-h,
    .faq-item.open .faq-icon-v {
      background: var(--clx-accent);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 320ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .faq-answer-inner {
      padding: 0 20px 18px;
    }
    .faq-answer-inner p {
      font-size: 0.9rem;
      line-height: 1.7;
      color: var(--clx-text-muted);
    }

    @media (max-width: 860px) {
      .faq-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .faq-head {
        position: static;
        max-width: 100%;
      }
      .faq-section { padding: 88px 0; }
    }
  `],
})
export class FaqComponent {
  readonly answerHeights = signal<number[]>([]);

  readonly items = signal<FaqItem[]>([
    {
      question: 'O que é o ClinicaX?',
      answer:
        'É o sistema operacional da clínica: agenda, prontuário, WhatsApp, financeiro e documentos em um único login — pensado para previsibilidade de faturamento e menos trabalho manual.',
      open: false,
    },
    {
      question: 'Como testar sem compromisso?',
      answer:
        'Use a demo com dados fictícios em um clique. Se preferir, agendamos uma apresentação com o fluxo da sua especialidade.',
      open: false,
    },
    {
      question: 'Serve para consultório solo e clínica maior?',
      answer:
        'Sim. Escala de um profissional a múltiplas salas e especialidades, com permissões e visão gerencial quando a operação cresce.',
      open: false,
    },
    {
      question: 'Como reduz faltas e aumenta retenção?',
      answer:
        'Lembretes e confirmação via WhatsApp, histórico unificado e follow-up pós-consulta. Menos no-show, mais continuidade de tratamento.',
      open: false,
    },
    {
      question: 'E a migração dos dados atuais?',
      answer:
        'Migradores para os principais sistemas do mercado, checklist de go-live e acompanhamento até a rotina estabilizar.',
      open: false,
    },
    {
      question: 'Há conformidade com a LGPD?',
      answer:
        'Sim. Dados em nuvem com controles de acesso, trilhas e documentos com assinatura digital quando necessário.',
      open: false,
    },
  ]);

  toggle(index: number) {
    this.items.update((all) =>
      all.map((item, i) => ({
        ...item,
        open: i === index ? !item.open : false,
      }))
    );
    this.answerHeights.update((heights) => {
      const newHeights = [...heights];
      const el = document.querySelectorAll('.faq-answer-inner')[index];
      newHeights[index] = el?.scrollHeight || 0;
      return newHeights;
    });
  }
}
