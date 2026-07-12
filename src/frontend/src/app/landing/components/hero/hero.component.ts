import { Component, OnDestroy, NgZone, afterNextRender, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { SplitTextDirective } from '../../directives/split-text.directive';

interface HeroDoctor {
  name: string;
  role: string;
  alt: string;
  src: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, MagneticDirective, SplitTextDirective],
  template: `
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-glow hero-glow--violet"></div>
        <div class="hero-glow hero-glow--blue"></div>
        <div class="hero-glow hero-glow--teal"></div>
        <div class="hero-noise"></div>
        <div class="hero-grid"></div>
      </div>

      <div class="container">
        <div class="hero-inner">
          <div class="hero-text">
            <div class="hero-logo">
              <svg width="180" height="36" viewBox="0 0 180 36" fill="none" aria-hidden="true">
                <rect x="4" y="6" width="24" height="24" rx="7" fill="var(--clx-accent)" opacity="0.18"/>
                <path d="M10 18l6-6 6 6-6 6z" fill="var(--clx-accent)" opacity="0.45"/>
                <path d="M13 18l3-3 3 3-3 3z" fill="var(--clx-accent)"/>
                <text x="38" y="24" fill="#f0f2f7" font-weight="700" font-size="20" font-family="Inter,sans-serif">ClinicaX</text>
              </svg>
            </div>

            <h1 appSplitText>Transforme a gestão da sua clínica em um sistema previsível e escalável.</h1>

            <p class="hero-lead">
              Faça como a <strong>{{ currentDoctor().name }}</strong>: saia da operação e assuma o controle
              estratégico do seu negócio. O ClinicaX automatiza agenda, digitaliza processos e
              entrega previsibilidade total do faturamento.
            </p>

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
                <div class="hs-avatar" style="background:#6d5af0">RP</div>
                <div class="hs-avatar" style="background:#3b6ef5">LT</div>
                <div class="hs-avatar" style="background:#0d9488">TM</div>
                <div class="hs-avatar" style="background:#d97706">RL</div>
                <div class="hs-avatar more">+150</div>
              </div>
              <div class="hs-text">
                <div class="hs-stars" aria-label="5 estrelas">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.5 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.5z"/></svg>
                  }
                </div>
                <span>Centenas de clínicas operando com previsibilidade</span>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="visual-stage">
              <div class="hero-photo" [class.is-fading]="photoFading()" role="img" [attr.aria-label]="currentDoctor().alt">
                @for (doc of doctors; track doc.src; let i = $index) {
                  <img
                    [src]="doc.src"
                    [alt]="doc.alt"
                    width="500"
                    height="500"
                    [class.active]="i === doctorIndex()"
                    [attr.loading]="i === 0 ? 'eager' : 'lazy'"
                    [attr.fetchpriority]="i === 0 ? 'high' : 'low'"
                    decoding="async"
                  />
                }
                <div class="photo-ring" aria-hidden="true"></div>
              </div>

              <div class="float-card float-card--revenue">
                <div class="fc-head">
                  <span class="fc-icon fc-icon--teal">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                  </span>
                  <span>Faturamento</span>
                  <span class="fc-badge">Hoje</span>
                </div>
                <div class="fc-value">R$ 4.230</div>
                <div class="fc-sub">Mais vendido: Preenchimento labial</div>
              </div>

              <div class="float-card float-card--schedule">
                <div class="fc-head">
                  <span class="fc-icon fc-icon--blue">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  </span>
                  <span>Agenda</span>
                </div>
                <div class="fc-value">85%</div>
                <div class="fc-bar"><div class="fc-bar-fill"></div></div>
                <div class="fc-sub">Ocupação hoje</div>
              </div>

              <div class="float-card float-card--term">
                <div class="fc-head">
                  <span class="fc-icon fc-icon--purple">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>
                  </span>
                  <span>Termo assinado</span>
                </div>
                <div class="fc-sub-strong">Maria B. Cardoso</div>
                <div class="fc-sub">Assinado às 10:14</div>
              </div>

              <div class="hero-profile-card" [class.hpc-swap]="photoFading()">
                <div class="hpc-stars" aria-hidden="true">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.5 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.5z"/></svg>
                  }
                </div>
                <div class="hpc-name">{{ currentDoctor().name }}</div>
                <div class="hpc-crm">{{ currentDoctor().role }}</div>
                <div class="hpc-dots" role="tablist" aria-label="Médicos em destaque">
                  @for (doc of doctors; track doc.src; let i = $index) {
                    <button
                      type="button"
                      class="hpc-dot"
                      [class.active]="i === doctorIndex()"
                      [attr.aria-label]="doc.name"
                      [attr.aria-selected]="i === doctorIndex()"
                      (click)="selectDoctor(i)"
                    ></button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-strip">
        <div class="hero-strip-track">
          @for (item of stripItems; track $index) {
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
        </div>
      </div>

      <div class="hero-fade" aria-hidden="true"></div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(155deg, #0a162e 0%, #122445 28%, #1a3570 55%, #15305f 78%, #0f2145 100%);
      overflow: hidden;
      padding: 88px 0 0;
    }

    .hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

    .hero-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(110px);
      pointer-events: none;
      will-change: transform;
    }
    .hero-glow--violet {
      width: 560px; height: 560px;
      background: radial-gradient(ellipse, rgba(109, 90, 240, 0.16), transparent 70%);
      top: -18%; left: 28%;
      animation: heroPulse 10s ease-in-out infinite;
    }
    .hero-glow--blue {
      width: 480px; height: 480px;
      background: radial-gradient(ellipse, rgba(59, 110, 245, 0.14), transparent 70%);
      bottom: -12%; right: 12%;
      animation: heroPulse 10s ease-in-out 2.5s infinite;
    }
    .hero-glow--teal {
      width: 360px; height: 360px;
      background: radial-gradient(ellipse, rgba(13, 148, 136, 0.08), transparent 70%);
      top: 42%; left: 6%;
      animation: heroPulse 10s ease-in-out 5s infinite;
    }
    .hero-noise {
      position: absolute;
      inset: 0;
      opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 180px 180px;
      mix-blend-mode: overlay;
    }
    .hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(240, 242, 247, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(240, 242, 247, 0.03) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%);
    }

    @keyframes heroPulse {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
      50% { transform: translate(16px, -14px) scale(1.06); opacity: 0.85; }
    }

    .container {
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }

    .hero-inner {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      align-items: center;
      gap: clamp(48px, 7vw, 96px);
      min-height: calc(100vh - 160px);
      padding: 40px 0 100px;
    }

    .hero-text {
      max-width: 560px;
      position: relative;
      z-index: 2;
    }
    .hero-logo { margin-bottom: 28px; }
    .hero-text h1 {
      font-size: clamp(2rem, 3.6vw, 2.85rem);
      font-weight: 750;
      line-height: 1.1;
      color: #f0f2f7;
      letter-spacing: -0.035em;
      margin-bottom: 22px;
    }
    .hero-lead {
      font-size: 1.02rem;
      line-height: 1.7;
      color: rgba(240, 242, 247, 0.52);
      margin-bottom: 34px;
      max-width: 34em;
    }
    .hero-lead strong { color: #f0f2f7; font-weight: 600; }

    .hero-ctas {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 44px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 24px;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      transition:
        transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1),
        background 220ms ease,
        border-color 220ms ease;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #3b6ef5 0%, #5b6ef0 100%);
      color: #fff;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.14) inset,
        0 6px 24px rgba(59, 110, 245, 0.32);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.16) inset,
        0 10px 32px rgba(59, 110, 245, 0.4);
    }
    .btn-outline {
      background: rgba(240, 242, 247, 0.04);
      border: 1px solid rgba(240, 242, 247, 0.12);
      color: #f0f2f7;
      backdrop-filter: blur(8px);
    }
    .btn-outline:hover {
      background: rgba(240, 242, 247, 0.08);
      border-color: rgba(240, 242, 247, 0.22);
      transform: translateY(-1px);
    }

    .hero-social { display: flex; align-items: center; gap: 14px; }
    .hs-avatars { display: flex; }
    .hs-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.58rem;
      font-weight: 700;
      color: #fff;
      border: 2px solid rgba(7, 11, 18, 0.85);
      margin-right: -8px;
    }
    .hs-avatar.more {
      background: rgba(240, 242, 247, 0.08);
      color: rgba(240, 242, 247, 0.55);
      font-size: 0.5rem;
    }
    .hs-text { display: flex; flex-direction: column; gap: 2px; }
    .hs-stars { display: flex; gap: 2px; color: #e8b84a; }
    .hs-text span { font-size: 0.72rem; color: rgba(240, 242, 247, 0.4); line-height: 1.35; }

    /* Visual column — isolated stage so float cards never invade copy */
    .hero-visual {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 0;
      z-index: 1;
    }
    .visual-stage {
      position: relative;
      width: min(100%, 460px);
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      /* space so profile badge sits under the photo without clipping */
      padding-bottom: 8px;
      box-sizing: border-box;
    }

    .hero-photo {
      width: min(100%, 380px);
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      z-index: 1;
      box-shadow:
        0 0 0 1px rgba(240, 242, 247, 0.08),
        0 24px 80px rgba(59, 110, 245, 0.18),
        0 8px 24px rgba(0, 0, 0, 0.35);
      background: rgba(15, 30, 60, 0.5);
    }
    .hero-photo img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
      opacity: 0;
      transform: scale(1.06);
      transition:
        opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
        transform 1.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 0;
      pointer-events: none;
    }
    .hero-photo img.active {
      opacity: 1;
      transform: scale(1);
      z-index: 1;
    }
    .hero-photo.is-fading img.active {
      opacity: 0.35;
      transform: scale(1.02);
    }
    .photo-ring {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 1px solid rgba(59, 110, 245, 0.18);
      pointer-events: none;
      z-index: -1;
    }

    /* Profile badge — centered under photo (not on top of metric cards) */
    .hero-profile-card {
      position: absolute;
      bottom: 2%;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(145deg, rgba(30, 58, 120, 0.92), rgba(20, 42, 90, 0.9));
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
      border: 1px solid rgba(147, 197, 253, 0.22);
      border-radius: 14px;
      padding: 12px 18px 10px;
      z-index: 5;
      text-align: center;
      box-shadow: 0 12px 40px rgba(15, 40, 90, 0.4);
      white-space: nowrap;
      pointer-events: auto;
      min-width: 168px;
      transition: opacity 350ms ease, transform 350ms ease;
    }
    .hero-profile-card.hpc-swap {
      opacity: 0.55;
      transform: translateX(-50%) translateY(4px);
    }
    .hpc-stars { display: flex; gap: 2px; color: #e8b84a; margin-bottom: 6px; justify-content: center; pointer-events: none; }
    .hpc-name { font-size: 0.8rem; font-weight: 600; color: #f0f2f7; pointer-events: none; }
    .hpc-crm { font-size: 0.66rem; color: rgba(240, 242, 247, 0.45); margin-bottom: 8px; pointer-events: none; }
    .hpc-dots {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
    }
    .hpc-dot {
      width: 7px;
      height: 7px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: rgba(240, 242, 247, 0.22);
      cursor: pointer;
      transition: background 0.3s ease, transform 0.3s ease;
    }
    .hpc-dot:hover {
      background: rgba(240, 242, 247, 0.45);
    }
    .hpc-dot.active {
      background: #8babff;
      transform: scale(1.35);
    }

    .float-card {
      position: absolute;
      background: linear-gradient(145deg, rgba(36, 70, 140, 0.82), rgba(22, 48, 100, 0.78));
      backdrop-filter: blur(22px) saturate(1.15);
      -webkit-backdrop-filter: blur(22px) saturate(1.15);
      border: 1px solid rgba(147, 197, 253, 0.2);
      border-radius: 14px;
      padding: 14px 16px;
      z-index: 3;
      min-width: 168px;
      max-width: 200px;
      box-shadow:
        0 8px 32px rgba(15, 40, 90, 0.32),
        0 0 0 1px rgba(147, 197, 253, 0.08) inset;
      transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease;
      /* keep cards inside stage so they don't stack on each other */
      will-change: transform;
    }
    .float-card:hover {
      z-index: 6;
      box-shadow: 0 14px 40px rgba(20, 50, 110, 0.4);
    }

    /*
      Corners of the stage — no shared bottom-right:
      revenue  → top-right
      schedule → mid-left
      term     → mid-right (above profile)
      profile  → bottom-center
    */
    .float-card--revenue {
      top: 0;
      right: 0;
      animation: floatUp 5.5s ease-in-out infinite;
    }
    .float-card--schedule {
      top: 38%;
      left: 0;
      animation: floatUp 5.5s ease-in-out 1.4s infinite;
    }
    .float-card--term {
      top: 58%;
      right: 0;
      bottom: auto;
      animation: floatUp 5.5s ease-in-out 2.8s infinite;
    }

    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .fc-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .fc-icon {
      width: 22px; height: 22px;
      border-radius: 7px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .fc-icon--blue { background: rgba(59, 110, 245, 0.15); color: #7aa0ff; }
    .fc-icon--teal { background: rgba(13, 148, 136, 0.15); color: #2dd4bf; }
    .fc-icon--purple { background: rgba(109, 90, 240, 0.15); color: #a78bfa; }
    .fc-head > span:not(.fc-icon):not(.fc-badge) {
      font-size: 0.68rem;
      color: rgba(240, 242, 247, 0.5);
      flex: 1;
    }
    .fc-badge {
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(59, 110, 245, 0.16);
      color: #8babff;
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .fc-value { font-size: 1.12rem; font-weight: 750; color: #f0f2f7; margin-bottom: 4px; letter-spacing: -0.02em; }
    .fc-sub { font-size: 0.64rem; color: rgba(240, 242, 247, 0.38); line-height: 1.35; }
    .fc-sub-strong { font-size: 0.72rem; font-weight: 600; color: rgba(240, 242, 247, 0.85); margin-bottom: 2px; }
    .fc-bar {
      width: 100%; height: 4px;
      border-radius: 4px;
      background: rgba(240, 242, 247, 0.08);
      margin: 6px 0;
      overflow: hidden;
    }
    .fc-bar-fill {
      width: 85%; height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, #3b6ef5, #6d8ef8);
    }

    /* Faixa de métricas — acima do fade para não ficar “lavada” de branco */
    .hero-strip {
      position: relative;
      z-index: 4;
      overflow: hidden;
      padding: 20px 0 40px;
      mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
      -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
    }
    .hero-strip-track {
      display: flex;
      gap: 14px;
      width: max-content;
      animation: stripScroll var(--strip-duration, 30s) linear infinite;
    }
    .hero-strip:hover .hero-strip-track { animation-play-state: paused; }
    @keyframes stripScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(var(--strip-distance, -50%)); }
    }
    .strip-card {
      /* fundo opaco o suficiente para o fade de baixo não atravessar o card */
      background: linear-gradient(145deg, rgba(28, 52, 100, 0.94), rgba(16, 34, 72, 0.96));
      border: 1px solid rgba(147, 197, 253, 0.18);
      border-radius: 12px;
      padding: 12px 18px;
      min-width: 158px;
      white-space: nowrap;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px rgba(5, 12, 28, 0.28);
    }
    .strip-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .strip-head svg { width: 13px; height: 13px; color: #7aa0ff; }
    .strip-head span { font-size: 0.64rem; color: rgba(240, 242, 247, 0.55); }
    .strip-badge {
      padding: 2px 6px;
      border-radius: 5px;
      background: rgba(59, 110, 245, 0.18);
      color: #8babff;
      font-size: 0.5rem;
      font-weight: 700;
    }
    .strip-value { font-size: 0.92rem; font-weight: 700; color: #f0f2f7; }
    .strip-sub { font-size: 0.58rem; color: rgba(240, 242, 247, 0.42); }

    /* Transição suave hero → seção seguinte; fica ABAIXO dos cards (z-index menor) */
    .hero-fade {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(15, 33, 69, 0.35) 40%,
        rgba(100, 140, 185, 0.55) 78%,
        rgba(130, 165, 205, 0.85) 100%
      );
      z-index: 1;
      pointer-events: none;
    }

    @media (max-width: 1024px) {
      .hero-inner {
        grid-template-columns: 1fr;
        text-align: center;
        min-height: auto;
        padding: 32px 0 80px;
        gap: 48px;
      }
      .hero-text { max-width: 100%; margin: 0 auto; }
      .hero-lead { margin-left: auto; margin-right: auto; }
      .hero-ctas { justify-content: center; }
      .hero-social { justify-content: center; flex-wrap: wrap; }
      .visual-stage {
        width: min(100%, 380px);
        /* room for profile card below photo */
        margin-bottom: 28px;
      }
      .hero-photo { width: min(100%, 300px); }
      .float-card--revenue { top: 0; right: 0; }
      .float-card--schedule { top: 36%; left: 0; }
      .float-card--term { top: 56%; right: 0; bottom: auto; }
      .hero-profile-card {
        bottom: -8px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
      }
    }

    @media (max-width: 560px) {
      .float-card { min-width: 132px; max-width: 150px; padding: 10px 12px; }
      .float-card--revenue { top: 2%; right: 0; }
      .float-card--schedule { top: 34%; left: 0; }
      .float-card--term { top: 54%; right: 0; }
      .hero-profile-card {
        bottom: -12px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
        padding: 10px 14px;
      }
      .btn { width: 100%; justify-content: center; }
      .hero-ctas { flex-direction: column; }
      .visual-stage { margin-bottom: 36px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .float-card--revenue,
      .float-card--schedule,
      .float-card--term {
        animation: none;
      }
      .hero-photo img {
        transition: none;
      }
      .hero-profile-card {
        transition: none;
      }
    }
  `],
})
export class HeroComponent implements OnDestroy {
  private readonly ngZone = inject(NgZone);

  /** Índice do médico exibido no hero */
  readonly doctorIndex = signal(0);
  readonly photoFading = signal(false);

  /** Médicos em rotação (fotos Unsplash de profissionais de saúde) */
  readonly doctors: HeroDoctor[] = [
    {
      name: 'Dra. Ana Beatriz',
      role: 'CRM 23872 · Estética',
      alt: 'Dra. Ana Beatriz, médica estética',
      src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',
    },
    {
      name: 'Dr. Ricardo Mendes',
      role: 'CRM 18401 · Clínica geral',
      alt: 'Dr. Ricardo Mendes, clínico geral',
      src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',
    },
    {
      name: 'Dra. Camila Torres',
      role: 'CRO 9124 · Odontologia',
      alt: 'Dra. Camila Torres, dentista',
      src: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80',
    },
    {
      name: 'Dr. Felipe Nogueira',
      role: 'CRM 30115 · Dermatologia',
      alt: 'Dr. Felipe Nogueira, dermatologista',
      src: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80',
    },
    {
      name: 'Dra. Juliana Prado',
      role: 'CRM 25640 · Ortopedia',
      alt: 'Dra. Juliana Prado, ortopedista',
      src: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&q=80',
    },
    {
      name: 'Dr. André Vasconcelos',
      role: 'CRM 17890 · Cardiologia',
      alt: 'Dr. André Vasconcelos, cardiologista',
      src: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&q=80',
    },
  ];

  readonly currentDoctor = computed(() => this.doctors[this.doctorIndex()] ?? this.doctors[0]);

  private rotateTimer: ReturnType<typeof setInterval> | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly ROTATE_MS = 10_000;

  constructor() {
    afterNextRender(() => {
      this.preloadDoctorImages();
      this.startDoctorRotation();
      this.setupStripAnimation();
    });
  }

  ngOnDestroy(): void {
    this.stopDoctorRotation();
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
  }

  /** Clique nos dots do card de perfil */
  selectDoctor(index: number): void {
    if (index === this.doctorIndex() || index < 0 || index >= this.doctors.length) return;
    this.goToDoctor(index);
    // Reinicia o ciclo automático a partir da escolha manual
    this.startDoctorRotation();
  }

  private startDoctorRotation(): void {
    this.stopDoctorRotation();
    // Interval fora da zone (menos ruído); updates de UI voltam com ngZone.run
    this.ngZone.runOutsideAngular(() => {
      this.rotateTimer = setInterval(() => this.nextDoctor(), this.ROTATE_MS);
    });
  }

  private stopDoctorRotation(): void {
    if (this.rotateTimer) {
      clearInterval(this.rotateTimer);
      this.rotateTimer = null;
    }
  }

  private nextDoctor(): void {
    const next = (this.doctorIndex() + 1) % this.doctors.length;
    this.goToDoctor(next);
  }

  private goToDoctor(index: number): void {
    this.ngZone.run(() => {
      this.photoFading.set(true);
      if (this.fadeTimer) clearTimeout(this.fadeTimer);
      // Crossfade: escurece levemente e troca o ativo
      this.fadeTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.doctorIndex.set(index);
          this.photoFading.set(false);
        });
      }, 320);
    });
  }

  private preloadDoctorImages(): void {
    this.doctors.forEach((d) => {
      const img = new Image();
      img.src = d.src;
    });
  }

  private setupStripAnimation(): void {
    const track = document.querySelector('.hero-strip-track') as HTMLElement;
    if (!track) return;

    const setCount = this.baseItems.length;
    const items = Array.from(track.children) as HTMLElement[];

    let setWidth = 0;
    for (let i = 0; i < setCount && i < items.length; i++) {
      setWidth += items[i].getBoundingClientRect().width;
      if (i < setCount - 1) {
        setWidth += parseFloat(getComputedStyle(track).gap) || 16;
      }
    }

    const speed = 60;
    const duration = setWidth / speed;

    track.style.setProperty('--strip-distance', `-${setWidth}px`);
    track.style.setProperty('--strip-duration', `${duration}s`);
  }

  private readonly baseItems = [
    { icon: '#ic-calendar', label: 'Agenda', value: '85%', badge: 'Hoje', sub: 'Ocupação' },
    { icon: '#ic-file-text', label: 'Termo assinado', value: 'Maria B.', badge: null, sub: 'Assinado às 10:14' },
    { icon: '#ic-banknote', label: 'Entradas', value: 'R$ 4.230', badge: 'Hoje', sub: 'Mais vendido: Preenchimento labial' },
    { icon: '#ic-trending-up', label: 'Atendimentos', value: '+38%', badge: 'Mês', sub: 'Total: 223 atendimentos' },
    { icon: '#ic-zap', label: 'Automação ativa', value: 'Live', badge: null, sub: 'Lembrete enviado • Confirmado' },
  ];

  readonly stripItems = [
    ...this.baseItems, ...this.baseItems,
    ...this.baseItems, ...this.baseItems,
  ];
}
