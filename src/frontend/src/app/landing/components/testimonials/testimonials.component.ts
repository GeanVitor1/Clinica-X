import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <section class="testimonials section-dark" id="depoimentos">
      <div class="t-bg-overlay"></div>
      <div class="t-bg-image"></div>
      <div class="t-bg-pattern"></div>

      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-badge">DEPOIMENTOS</span>
          <h2>Quem usa ama e assina embaixo</h2>
          <p>Histórias reais de profissionais da Saúde que modernizaram sua gestão e melhoraram seus resultados com o ClinicaX.</p>
        </div>

        <div class="t-scroller">
          @for (t of testimonials; track t.name) {
            <article class="t-card" appAnimateOnScroll>
              <div class="t-photo">
                <img [src]="t.photo" [alt]="t.name" loading="lazy"/>
              </div>
              <p class="t-quote">"{{ t.quote }}"</p>
              <div class="t-person">
                <div class="t-avatar">
                  <img [src]="t.avatar" [alt]="t.name" loading="lazy"/>
                </div>
                <div>
                  <a [href]="t.instagram" class="t-handle" target="_blank" rel="noopener">{{ t.handle }}</a>
                  <div class="t-role">{{ t.name }}</div>
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
      background: #0f0f23;
      overflow: hidden;
    }
    .t-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(15, 15, 35, 0.92), rgba(15, 15, 35, 0.7), rgba(15, 15, 35, 0.88));
      z-index: 1;
    }
    .t-bg-image {
      position: absolute;
      inset: 0;
      background:
        url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1400&q=60') center 30% / cover no-repeat;
      z-index: 0;
      opacity: 0.3;
    }
    .t-bg-pattern {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      z-index: 1;
      pointer-events: none;
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 2;
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
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.1));
      color: var(--clx-accent-light);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 16px;
      border: 1px solid rgba(37, 99, 235, 0.12);
    }
    .section-head h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 750;
      color: #fafaf9;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }
    .section-head p {
      font-size: 0.95rem;
      color: rgba(250, 250, 249, 0.5);
      line-height: 1.6;
    }

    .t-scroller {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 16px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .t-scroller::-webkit-scrollbar { display: none; }

    .t-card {
      flex: 0 0 340px;
      scroll-snap-align: start;
      background: rgba(250, 250, 249, 0.04);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(250, 250, 249, 0.06);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.35s;
    }
    .t-card:hover {
      border-color: rgba(37, 99, 235, 0.2);
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.25);
    }
    .t-photo {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }
    .t-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .t-card:hover .t-photo img {
      transform: scale(1.05);
    }
    .t-quote {
      padding: 24px 24px 12px;
      font-size: 0.88rem;
      line-height: 1.7;
      color: rgba(250, 250, 249, 0.8);
    }
    .t-person {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 24px 24px;
    }
    .t-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid rgba(37, 99, 235, 0.15);
    }
    .t-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .t-handle { font-size: 0.8rem; font-weight: 600; color: var(--clx-accent-light); text-decoration: none; }
    .t-handle:hover { text-decoration: underline; }
    .t-role { font-size: 0.7rem; color: rgba(250, 250, 249, 0.35); }
  `],
})
export class TestimonialsComponent {
  readonly testimonials = [
    {
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80',
      name: 'Dra. Renata Peres',
      handle: '@drarenataperes',
      instagram: 'https://instagram.com/drarenataperes',
      quote: 'O ClinicaX foi o sistema mais completo e prático que já usei na clínica. Reduzi em 60% as faltas com os lembretes automáticos.',
    },
    {
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80',
      name: 'Dra. Letícia Tiago',
      handle: '@dra.leticiatiago',
      instagram: 'https://instagram.com/dra.leticiatiago',
      quote: 'Hoje consigo acessar tudo dos pacientes muito mais rápido. Facilitou demais minha rotina na clínica.',
    },
    {
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80',
      name: 'Dra. Tais Milene',
      handle: '@dratamislene',
      instagram: 'https://instagram.com/dratamislene',
      quote: 'O sistema é fácil de usar, bem prático e agiliza muito o contato com os pacientes.',
    },
    {
      photo: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&q=80',
      avatar: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=100&q=80',
      name: 'Dra. Rafaella Lutfi',
      handle: '@drarafaellalutfi',
      instagram: 'https://instagram.com/drarafaellalutfi',
      quote: 'O ClinicaX superou minhas expectativas. O sistema é ótimo e o suporte sempre foi excelente.',
    },
    {
      photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80',
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&q=80',
      name: 'Dra. Sheila Munhoz',
      handle: '@drasheilamunhoz',
      instagram: 'https://instagram.com/drasheilamunhoz',
      quote: 'Organizou totalmente a rotina da clínica. Hoje o financeiro ficou muito mais prático.',
    },
  ];
}
