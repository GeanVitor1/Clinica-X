import { Component, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="faq-section section-warm" id="faq">
      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-badge">FAQ</span>
          <h2>Tudo que você precisa saber</h2>
          <p>Tire suas dúvidas e descubra como o ClinicaX pode ajudar sua clínica a ganhar tempo, eficiência e mais controle no dia a dia.</p>
        </div>

        <div class="faq-list" appAnimateOnScroll>
          @for (item of items(); track item.question; let i = $index) {
            <div class="faq-item" [class.open]="item.open" [style.--faq-delay]="i * 0.05 + 's'">
              <button class="faq-question" (click)="toggle(i)" [attr.aria-expanded]="item.open">
                <span>{{ item.question }}</span>
                <svg class="faq-chevron" [class.rotated]="item.open" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="faq-answer" [style.maxHeight]="item.open ? answerHeights()[i] + 'px' : '0'">
                <div class="faq-answer-inner" #answerRefs>
                  <p>{{ item.answer }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .faq-section {
      position: relative;
      padding: 100px 0;
      background: #faf7f2;
      overflow: hidden;
    }
    .faq-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 40% at 0% 100%, rgba(201, 149, 74, 0.04) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 100% 0%, rgba(37, 99, 235, 0.02) 0%, transparent 50%);
      pointer-events: none;
    }
    .faq-section .container {
      position: relative;
      z-index: 1;
    }
    .container {
      max-width: 800px;
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
      color: var(--clx-primary);
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }
    .section-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .faq-item {
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 14px;
      overflow: hidden;
      transition: all 0.3s;
    }
    .faq-item:hover {
      border-color: var(--clx-accent);
    }
    .faq-item.open {
      border-color: var(--clx-accent);
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.04);
    }

    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 18px 22px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--clx-text);
      text-align: left;
      transition: 0.2s;
    }
    .faq-question:hover {
      color: var(--clx-accent);
    }

    .faq-chevron {
      flex-shrink: 0;
      color: var(--clx-text-muted);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .faq-chevron.rotated {
      transform: rotate(180deg);
      color: var(--clx-accent);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .faq-answer-inner {
      padding: 0 22px 18px;
    }
    .faq-answer-inner p {
      font-size: 0.88rem;
      line-height: 1.7;
      color: var(--clx-text-muted);
    }

    @media (max-width: 480px) {
      .faq-question { font-size: 0.85rem; padding: 16px; }
      .faq-answer-inner { padding: 0 16px 16px; }
    }
  `],
})
export class FaqComponent {
  readonly answerHeights = signal<number[]>([]);

  readonly items = signal<FaqItem[]>([
    { question: 'O que é o ClinicaX?', answer: 'O ClinicaX é o ecossistema completo para clínicas e consultórios que unifica agenda inteligente, prontuário eletrônico, documentos digitais, gestão financeira e agentes de IA em um único login — para automatizar processos e ter previsibilidade total do faturamento.', open: false },
    { question: 'Como posso testar o ClinicaX?', answer: 'Entre em contato com um especialista ou experimente agora pela seção de contato. Nossa equipe apresenta a plataforma na prática e orienta o melhor plano para o perfil da sua clínica.', open: false },
    { question: 'Quais funcionalidades o ClinicaX oferece?', answer: 'Agenda inteligente com confirmação via WhatsApp, fichas de anamnese, prontuário eletrônico, documentos com assinatura digital, gestão financeira integrada, central de WhatsApp, telemedicina, estoque, vendas, emissão de notas e muito mais.', open: false },
    { question: 'O ClinicaX é adequado para o tamanho do meu negócio?', answer: 'Sim. O ClinicaX atende desde consultórios individuais até clínicas com múltiplos profissionais e salas, com recursos que escalam conforme o tamanho da operação.', open: false },
    { question: 'Como o ClinicaX pode ajudar a aumentar a retenção de pacientes?', answer: 'Com lembretes automáticos e confirmação em um clique pelo WhatsApp, chatbot 24/7 e acompanhamento do histórico clínico em um só lugar, você reduz faltas, responde mais rápido e mantém o paciente engajado ao longo do tratamento.', open: false },
    { question: 'Existe suporte para usuários do ClinicaX?', answer: 'Sim. Oferecemos treinamento semanal com demonstrações práticas, suporte humanizado, migração facilitada dos principais sistemas e atualizações contínuas baseadas no feedback de quem usa a plataforma no dia a dia.', open: false },
    { question: 'O ClinicaX tem inteligência artificial?', answer: 'Sim. Contamos com agentes de IA para transcrição de consultas, assistente de tarefas, avaliação facial e copilot de textos — trabalhando 24/7 para automatizar tarefas da sua clínica.', open: false },
    { question: 'O ClinicaX está em conformidade com a LGPD?', answer: 'Sim. Todos os documentos e dados são organizados em nuvem com total conformidade à LGPD, com contratos e termos de consentimento assinados digitalmente com validade jurídica.', open: false },
  ]);

  toggle(index: number) {
    this.items.update(all =>
      all.map((item, i) => ({
        ...item,
        open: i === index ? !item.open : false,
      }))
    );
    this.answerHeights.update(heights => {
      const newHeights = [...heights];
      const el = document.querySelectorAll('.faq-answer-inner')[index];
      newHeights[index] = el?.scrollHeight || 0;
      return newHeights;
    });
  }
}
