import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="testimonials" id="depoimentos">
      <div class="t-bg" aria-hidden="true">
        <div class="t-orb t-orb--1"></div>
        <div class="t-orb t-orb--2"></div>
        <div class="t-noise"></div>
      </div>

      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-label">Depoimentos</span>
          <h2>Quem usa, recomenda com dados</h2>
          <p>Resultados reais de clínicas que saíram da planilha e passaram a operar com previsibilidade.</p>
        </div>

        <div class="t-grid">
          @for (t of testimonials; track t.name; let i = $index) {
            <article class="t-card" appAnimateOnScroll [style.--i]="i">
              <div class="t-top">
                <div class="t-stars" aria-label="5 estrelas">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.5 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.5z"/>
                    </svg>
                  }
                </div>
                <span class="t-metric">{{ t.metric }}</span>
              </div>

              <p class="t-quote">“{{ t.quote }}”</p>

              <div class="t-person">
                <div class="t-avatar" [style.background]="t.color">{{ t.initials }}</div>
                <div class="t-meta">
                  <strong>{{ t.name }}</strong>
                  <span>{{ t.role }}</span>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials {
      position: relative;
      padding: 120px 0;
      background:
        linear-gradient(
          160deg,
          #0b1a3a 0%,
          #122554 28%,
          #1a3a7a 55%,
          #163168 78%,
          #0e2048 100%
        );
      overflow: hidden;
    }
    .t-bg { position: absolute; inset: 0; pointer-events: none; }
    .t-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
    }
    .t-orb--1 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, rgba(147, 197, 253, 0.22), transparent 70%);
      top: -10%; left: 10%;
    }
    .t-orb--2 {
      width: 360px; height: 360px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 70%);
      bottom: -15%; right: 5%;
    }
    .t-noise {
      position: absolute;
      inset: 0;
      opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 180px 180px;
      mix-blend-mode: overlay;
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }
    .section-head {
      max-width: 520px;
      margin: 0 0 48px;
    }
    .section-label {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8babff;
      margin-bottom: 14px;
    }
    .section-head h2 {
      font-size: clamp(1.7rem, 3vw, 2.35rem);
      font-weight: 700;
      color: #f0f2f7;
      letter-spacing: -0.035em;
      line-height: 1.15;
      margin-bottom: 12px;
    }
    .section-head p {
      font-size: 0.98rem;
      color: rgba(240, 242, 247, 0.5);
      line-height: 1.65;
    }

    .t-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .t-card {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 24px;
      background: rgba(240, 242, 247, 0.035);
      border: 1px solid rgba(240, 242, 247, 0.07);
      border-radius: 16px;
      transition:
        transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
        border-color 240ms ease,
        background 240ms ease,
        box-shadow 280ms ease;
    }
    .t-card:hover {
      transform: translateY(-3px);
      border-color: rgba(59, 110, 245, 0.28);
      background: rgba(240, 242, 247, 0.05);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
    }
    .t-card:nth-child(1) { grid-column: span 1; }
    .t-card:nth-child(2) { grid-column: span 1; }
    .t-card:nth-child(3) { grid-column: span 1; }

    .t-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .t-stars {
      display: flex;
      gap: 2px;
      color: #e8b84a;
    }
    .t-metric {
      font-size: 0.68rem;
      font-weight: 650;
      color: #7dd3c0;
      background: rgba(13, 148, 136, 0.12);
      border: 1px solid rgba(13, 148, 136, 0.18);
      padding: 4px 8px;
      border-radius: 7px;
      white-space: nowrap;
    }
    .t-quote {
      font-size: 0.94rem;
      line-height: 1.65;
      color: rgba(240, 242, 247, 0.82);
      letter-spacing: -0.01em;
      flex: 1;
    }
    .t-person {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 4px;
      border-top: 1px solid rgba(240, 242, 247, 0.06);
      margin-top: auto;
    }
    .t-avatar {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }
    .t-meta {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .t-meta strong {
      font-size: 0.84rem;
      font-weight: 650;
      color: #f0f2f7;
    }
    .t-meta span {
      font-size: 0.72rem;
      color: rgba(240, 242, 247, 0.42);
    }

    @media (max-width: 900px) {
      .t-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .t-grid { grid-template-columns: 1fr; }
      .section-head { margin-bottom: 36px; }
      .testimonials { padding: 88px 0; }
    }
  `],
})
export class TestimonialsComponent {
  readonly testimonials = [
    {
      initials: 'RP',
      color: 'linear-gradient(135deg, #3b6ef5, #6d5af0)',
      name: 'Dra. Renata Peres',
      role: 'Dermatologia · SP',
      metric: '−60% faltas',
      quote: 'Os lembretes automáticos mudaram a ocupação da agenda. Em três semanas as faltas caíram pela metade e a recepção parou de ligar manualmente.',
    },
    {
      initials: 'LT',
      color: 'linear-gradient(135deg, #0d9488, #0891b2)',
      name: 'Dra. Letícia Tiago',
      role: 'Clínica multiprofissional',
      metric: '1 login, tudo',
      quote: 'Prontuário, financeiro e WhatsApp no mesmo lugar. A equipe entrou no ritmo em poucos dias — sem treinamento interminável.',
    },
    {
      initials: 'TM',
      color: 'linear-gradient(135deg, #6d5af0, #a78bfa)',
      name: 'Dra. Taís Milene',
      role: 'Odontologia estética',
      metric: '+ previsibilidade',
      quote: 'Pela primeira vez vejo o faturamento do dia com clareza. Decisões deixaram de ser no feeling e passaram a ser com número na mão.',
    },
    {
      initials: 'RL',
      color: 'linear-gradient(135deg, #d97706, #ea580c)',
      name: 'Dra. Rafaella Lutfi',
      role: 'Gestora de clínica',
      metric: 'Suporte real',
      quote: 'O suporte não é chatbot genérico. Quando precisei migrar dados, a equipe entrou junto e a operação não parou um dia.',
    },
    {
      initials: 'SM',
      color: 'linear-gradient(135deg, #059669, #0d9488)',
      name: 'Dra. Sheila Munhoz',
      role: 'Clínica de estética',
      metric: 'Rotina organizada',
      quote: 'Financeiro e comissões deixaram de ser planilha. O time enxerga o que vendeu e o que falta cobrar sem caça ao rabo.',
    },
    {
      initials: 'AB',
      color: 'linear-gradient(135deg, #3b6ef5, #0d9488)',
      name: 'Dra. Ana Beatriz',
      role: 'Fundadora · CRM 23872',
      metric: 'Fora da operação',
      quote: 'Saí da operação diária. Agenda, confirmações e relatórios rodam sozinhos — eu cuido da estratégia da clínica.',
    },
  ];
}
