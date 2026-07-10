import { Component, afterNextRender, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { SplitTextDirective } from '../../directives/split-text.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, MagneticDirective, SplitTextDirective],
  template: `
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-glow hero-glow--violet"></div>
        <div class="hero-glow hero-glow--blue"></div>
        <div class="hero-glow hero-glow--orange"></div>
      </div>

      <div class="container">
        <div class="hero-inner">
          <div class="hero-text">
            <div class="hero-logo">
              <svg width="180" height="36" viewBox="0 0 180 36" fill="none">
                <path d="M8 18L18 8l10 10-10 10z" fill="var(--clx-accent)" opacity="0.3"/>
                <path d="M14 18l4-4 4 4-4 4z" fill="var(--clx-accent)"/>
                <text x="38" y="24" fill="#fafaf9" font-weight="700" font-size="20" font-family="Inter,sans-serif">ClinicaX</text>
              </svg>
            </div>

            <h1 appSplitText>Transforme a gestão da sua clínica em um sistema previsível e escalável.</h1>

            <p class="hero-lead">Faça como a <strong>Dra. Ana Beatriz</strong>: Saia da operação e assuma o controle estratégico do seu negócio. O ClinicaX é o ecossistema completo para automatizar agenda, digitalizar processos e ter previsibilidade total do faturamento.</p>

            <div class="hero-ctas">
              <a routerLink="/auth/login" appMagnetic class="btn btn-primary">
                Criar conta grátis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
              <a routerLink="/auth/login" [queryParams]="{demo: true}" appMagnetic class="btn btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Ver demonstração
              </a>
            </div>

            <div class="hero-social">
              <div class="hs-avatars">
                <div class="hs-avatar" style="background:#c084fc">RP</div>
                <div class="hs-avatar" style="background:#60a5fa">LT</div>
                <div class="hs-avatar" style="background:#34d399">TM</div>
                <div class="hs-avatar" style="background:#fbbf24">RL</div>
                <div class="hs-avatar more">+150</div>
              </div>
              <div class="hs-text">
                <div class="hs-stars">★★★★★</div>
                <span>Junte-se a centenas de profissionais que já estruturam suas clínicas</span>
              </div>
            </div>
          </div>

          <div class="hero-photo-col">
            <div class="hero-photo">
              <picture>
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80"
                  alt="Dra. Ana Beatriz"
                  width="500"
                  height="500"
                />
              </picture>
            </div>

            <div class="float-card float-card--revenue">
              <div class="fc-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                <span>Faturamento</span>
                <span class="fc-badge">Hoje</span>
              </div>
              <div class="fc-value">R$ 4.230</div>
              <div class="fc-sub">Mais vendido: Preenchimento labial</div>
            </div>

            <div class="float-card float-card--schedule">
              <div class="fc-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                <span>Agenda</span>
              </div>
              <div class="fc-value">85%</div>
              <div class="fc-bar"><div class="fc-bar-fill"></div></div>
              <div class="fc-sub">Ocupação hoje</div>
            </div>

            <div class="float-card float-card--term">
              <div class="fc-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>
                <span>Termo assinado</span>
              </div>
              <div class="fc-sub-strong">Maria B. Cardoso</div>
              <div class="fc-sub">Assinado às 10:14</div>
            </div>

            <div class="hero-profile-card">
              <div class="hpc-stars">★★★★★</div>
              <div class="hpc-name">@draanabeatriz</div>
              <div class="hpc-crm">CRM 23872</div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-strip">
        <div class="hero-strip-track">
          @for (item of stripItems; track item.label) {
            <div class="strip-card">
              <div class="strip-head">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use [attr.href]="item.icon"/></svg>
                <span>{{ item.label }}</span>
                @if (item.badge) {
                  <span class="strip-badge">{{ item.badge }}</span>
                }
              </div>
              <div class="strip-value">{{ item.value }}</div>
              @if (item.sub) { <div class="strip-sub">{{ item.sub }}</div> }
            </div>
          }
          @for (item of stripItems; track item.label + 'dup') {
            <div class="strip-card" aria-hidden="true">
              <div class="strip-head">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use [attr.href]="item.icon"/></svg>
                <span>{{ item.label }}</span>
                @if (item.badge) {
                  <span class="strip-badge">{{ item.badge }}</span>
                }
              </div>
              <div class="strip-value">{{ item.value }}</div>
              @if (item.sub) { <div class="strip-sub">{{ item.sub }}</div> }
            </div>
          }
        </div>
      </div>

      <div class="hero-fade" aria-hidden="true"></div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 25%, #14143a 50%, #1a0f30 75%, #0f0f23 100%);
      overflow: hidden;
      padding: 40px 0 0;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 50% at 30% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 70% 80%, rgba(124, 58, 237, 0.04) 0%, transparent 50%),
        radial-gradient(ellipse 40% 30% at 50% 50%, rgba(217, 119, 6, 0.02) 0%, transparent 40%);
      pointer-events: none;
    }
    .hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .hero-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
    }
    .hero-glow--violet {
      width: 600px; height: 600px;
      background: radial-gradient(ellipse, rgba(124, 58, 237, 0.2), transparent);
      top: -15%; left: 30%;
      animation: heroPulse 8s ease-in-out infinite;
    }
    .hero-glow--blue {
      width: 500px; height: 500px;
      background: radial-gradient(ellipse, rgba(37, 99, 235, 0.15), transparent);
      bottom: -10%; right: 20%;
      animation: heroPulse 8s ease-in-out 2s infinite;
    }
    .hero-glow--orange {
      width: 400px; height: 400px;
      background: radial-gradient(ellipse, rgba(217, 119, 6, 0.05), transparent);
      top: 40%; left: 10%;
      animation: heroPulse 8s ease-in-out 4s infinite;
    }
    @keyframes heroPulse {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
      50% { transform: translate(20px, -20px) scale(1.1); opacity: 0.8; }
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }

    .hero-inner {
      display: flex;
      align-items: center;
      gap: 60px;
      min-height: calc(100vh - 80px);
      padding: 60px 0 120px;
    }

    .hero-text {
      flex: 1;
      max-width: 540px;
    }
    .hero-logo { margin-bottom: 32px; }
    .hero-text h1 {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      font-weight: 750;
      line-height: 1.12;
      color: #fafaf9;
      letter-spacing: -0.03em;
      margin-bottom: 24px;
    }
    .hero-lead {
      font-size: 1rem;
      line-height: 1.65;
      color: rgba(250, 250, 249, 0.5);
      margin-bottom: 36px;
    }
    .hero-lead strong { color: #fafaf9; font-weight: 600; }

    .hero-ctas {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 50px;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--clx-accent), var(--clx-purple));
      color: #fff;
      box-shadow: 0 4px 24px rgba(37, 99, 235, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 36px rgba(37, 99, 235, 0.4);
    }
    .btn-outline {
      background: rgba(250, 250, 249, 0.06);
      border: 1.5px solid rgba(250, 250, 249, 0.12);
      color: #fafaf9;
    }
    .btn-outline:hover {
      background: rgba(250, 250, 249, 0.1);
      border-color: rgba(250, 250, 249, 0.25);
    }

    .hero-social { display: flex; align-items: center; gap: 16px; }
    .hs-avatars { display: flex; }
    .hs-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
      font-weight: 700;
      color: #fff;
      border: 2px solid rgba(10, 10, 26, 0.8);
      margin-right: -8px;
    }
    .hs-avatar.more {
      background: rgba(250, 250, 249, 0.06);
      color: rgba(250, 250, 249, 0.5);
      font-size: 0.5rem;
    }
    .hs-text { display: flex; flex-direction: column; gap: 2px; }
    .hs-stars { font-size: 0.75rem; color: #fbbf24; letter-spacing: 2px; }
    .hs-text span { font-size: 0.72rem; color: rgba(250, 250, 249, 0.4); }

    .hero-photo-col {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .hero-photo {
      width: 420px;
      height: 420px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(250, 250, 249, 0.08);
      box-shadow: 0 20px 80px rgba(37, 99, 235, 0.2), 0 0 0 1px rgba(250, 250, 249, 0.04);
      position: relative;
      z-index: 1;
    }
    .hero-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-profile-card {
      position: absolute;
      bottom: 24px;
      right: 50px;
      background: rgba(15, 15, 35, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(250, 250, 249, 0.06);
      border-radius: 14px;
      padding: 16px 24px;
      z-index: 2;
      text-align: center;
    }
    .hpc-stars { font-size: 0.8rem; color: #fbbf24; letter-spacing: 2px; margin-bottom: 4px; }
    .hpc-name { font-size: 0.82rem; font-weight: 600; color: #fafaf9; }
    .hpc-crm { font-size: 0.68rem; color: rgba(250, 250, 249, 0.4); }

    .float-card {
      position: absolute;
      background: rgba(15, 15, 35, 0.55);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(250, 250, 249, 0.06);
      border-radius: 14px;
      padding: 16px 20px;
      z-index: 3;
      min-width: 170px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    .float-card--revenue { top: 10%; right: -10%; animation: floatUp 5s ease-in-out infinite; }
    .float-card--schedule { bottom: 30%; left: -15%; animation: floatUp 5s ease-in-out 1.5s infinite; }
    .float-card--term { bottom: 5%; right: 15%; animation: floatUp 5s ease-in-out 3s infinite; }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .fc-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .fc-head svg { width: 14px; height: 14px; color: var(--clx-accent); }
    .fc-head span { font-size: 0.68rem; color: rgba(250, 250, 249, 0.5); flex: 1; }
    .fc-badge {
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(37, 99, 235, 0.15);
      color: var(--clx-accent);
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .fc-value { font-size: 1.1rem; font-weight: 750; color: #fafaf9; margin-bottom: 4px; }
    .fc-sub { font-size: 0.65rem; color: rgba(250, 250, 249, 0.35); }
    .fc-sub-strong { font-size: 0.72rem; font-weight: 600; color: rgba(250, 250, 249, 0.8); }
    .fc-bar {
      width: 100%; height: 4px;
      border-radius: 4px;
      background: rgba(250, 250, 249, 0.06);
      margin: 6px 0;
      overflow: hidden;
    }
    .fc-bar-fill {
      width: 85%; height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--clx-accent), var(--clx-accent-light));
    }

    .hero-strip {
      position: relative;
      z-index: 2;
      overflow: hidden;
      padding: 20px 0;
    }
    .hero-strip-track {
      display: flex;
      gap: 16px;
      width: max-content;
    }
    .strip-card {
      background: rgba(250, 250, 249, 0.03);
      border: 1px solid rgba(250, 250, 249, 0.04);
      border-radius: 14px;
      padding: 14px 20px;
      min-width: 160px;
      white-space: nowrap;
    }
    .strip-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .strip-head svg { width: 14px; height: 14px; color: var(--clx-accent); }
    .strip-head span { font-size: 0.65rem; color: rgba(250, 250, 249, 0.4); }
    .strip-badge {
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--clx-accent);
      font-size: 0.5rem;
      font-weight: 700;
    }
    .strip-value { font-size: 0.95rem; font-weight: 700; color: #fafaf9; }
    .strip-sub { font-size: 0.6rem; color: rgba(250, 250, 249, 0.3); }

    .hero-fade {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(180deg, transparent, var(--clx-bg));
      z-index: 3;
      pointer-events: none;
    }

    @media (max-width: 960px) {
      .hero-inner {
        flex-direction: column;
        text-align: center;
        padding: 40px 0 100px;
        min-height: auto;
        gap: 40px;
      }
      .hero-text { max-width: 100%; }
      .hero-ctas { justify-content: center; }
      .hero-social { justify-content: center; flex-wrap: wrap; }
      .hero-photo { width: 280px; height: 280px; }
      .float-card--revenue { top: 5%; right: 5%; }
      .float-card--schedule { bottom: 20%; left: 5%; }
      .float-card--term { bottom: 5%; right: 5%; }
      .hero-profile-card { right: 20px; bottom: 10px; }
    }
  `],
})
export class HeroComponent implements OnDestroy {
  private rafId = 0;

  constructor() {
    afterNextRender(() => {
      const el = document.querySelector('.hero-strip-track') as HTMLElement;
      if (!el) return;

      let x = 0;

      const frame = () => {
        x -= 0.6;
        el.style.transform = `translateX(${x}px)`;

        const card = el.firstElementChild as HTMLElement | null;
        if (card && x + card.offsetWidth < 0) {
          x += card.offsetWidth + 16;
          el.appendChild(card);
          el.style.transform = `translateX(${x}px)`;
        }

        this.rafId = requestAnimationFrame(frame);
      };

      this.rafId = requestAnimationFrame(frame);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
  }

  readonly stripItems = [
    { icon: '#ic-calendar', label: 'Agenda', value: '85%', badge: 'Hoje', sub: 'Ocupação' },
    { icon: '#ic-file-text', label: 'Termo assinado', value: 'Maria B.', badge: null, sub: 'Assinado às 10:14' },
    { icon: '#ic-banknote', label: 'Entradas', value: 'R$ 4.230', badge: 'Hoje', sub: 'Mais vendido: Preenchimento labial' },
    { icon: '#ic-trending-up', label: 'Atendimentos', value: '+38%', badge: 'Mês', sub: 'Total: 223 atendimentos' },
    { icon: '#ic-zap', label: 'Automação ativa', value: '', badge: null, sub: 'Lembrete enviado • Confirmado' },
  ];
}
