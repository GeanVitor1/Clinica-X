import { Component, ElementRef, AfterViewInit, OnInit, viewChild, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Step {
  num: string;
  title: string;
  description: string;
  icon: SafeHtml;
  accent: string;
  detail: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  template: `
    <section class="hiw" id="como-funciona">
      <div class="hiw-bg" aria-hidden="true">
        <div class="hiw-orb hiw-orb--1"></div>
        <div class="hiw-orb hiw-orb--2"></div>
      </div>

      <div class="hiw-container">
        <header class="hiw-head">
          <span class="section-label">Fluxo</span>
          <h2 class="hiw-title">Como funciona</h2>
          <p class="hiw-subtitle">
            Três etapas para sair do caos operacional e assumir o controle da clínica —
            com setup em minutos, sem curva de aprendizado complexa.
          </p>
        </header>

        <div class="hiw-track" #stepsContainer>
          <div class="hiw-line" aria-hidden="true">
            <span class="hiw-line-fill" #lineFill></span>
          </div>

          @for (step of steps; track step.num; let i = $index) {
            <article class="hiw-step" [style.--step-accent]="step.accent">
              <div class="step-visual">
                <div class="step-ring">
                  <div class="step-icon" [innerHTML]="step.icon"></div>
                </div>
                <span class="step-index">{{ step.num }}</span>
              </div>
              <div class="step-body">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
                <span class="step-detail">{{ step.detail }}</span>
              </div>
              <div class="step-glow" aria-hidden="true"></div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hiw {
      position: relative;
      padding: 120px 24px;
      overflow: hidden;
      background: transparent;
    }
    .hiw-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .hiw-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
    }
    .hiw-orb--1 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, rgba(59, 110, 245, 0.1), transparent 70%);
      top: -10%; left: -5%;
    }
    .hiw-orb--2 {
      width: 360px; height: 360px;
      background: radial-gradient(circle, rgba(13, 148, 136, 0.08), transparent 70%);
      bottom: -15%; right: -5%;
    }

    .hiw-container {
      max-width: 1100px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hiw-head {
      text-align: center;
      max-width: 560px;
      margin: 0 auto 72px;
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
    .hiw-title {
      font-size: clamp(1.75rem, 3vw, 2.4rem);
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.035em;
      margin-bottom: 14px;
    }
    .hiw-subtitle {
      font-size: 0.98rem;
      color: var(--clx-text-muted);
      line-height: 1.65;
    }

    .hiw-track {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      position: relative;
    }

    .hiw-line {
      display: none;
    }

    .hiw-step {
      --step-accent: var(--clx-accent);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 32px 28px 28px;
      background: linear-gradient(165deg, #c5d4e8 0%, #b2c4de 100%);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(20, 45, 90, 0.18);
      border-radius: 18px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.2) inset,
        0 8px 28px rgba(20, 42, 85, 0.14);
      overflow: hidden;
      opacity: 0;
      transform: translateY(28px);
      transition:
        transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 280ms ease,
        border-color 280ms ease;
    }
    .hiw-step:hover {
      transform: translateY(-4px);
      border-color: color-mix(in srgb, var(--step-accent) 35%, var(--clx-border));
      box-shadow: var(--clx-shadow-card-hover);
    }

    .step-visual {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .step-ring {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--step-accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--step-accent) 18%, transparent);
      color: var(--step-accent);
      transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease;
    }
    .hiw-step:hover .step-ring {
      transform: scale(1.05);
      box-shadow: 0 8px 24px color-mix(in srgb, var(--step-accent) 22%, transparent);
    }
    .step-icon {
      display: flex;
      width: 24px;
      height: 24px;
    }
    .step-icon :global(svg),
    .step-icon ::ng-deep svg {
      width: 24px;
      height: 24px;
    }
    .step-index {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--clx-text);
      opacity: 0.08;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .step-body h3 {
      font-size: 1.12rem;
      font-weight: 700;
      color: var(--clx-text);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .step-body p {
      font-size: 0.9rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .step-detail {
      display: inline-flex;
      align-items: center;
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--step-accent);
      background: color-mix(in srgb, var(--step-accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--step-accent) 14%, transparent);
    }

    .step-glow {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      top: -40px;
      right: -40px;
      background: radial-gradient(circle, color-mix(in srgb, var(--step-accent) 12%, transparent), transparent 70%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 320ms ease;
    }
    .hiw-step:hover .step-glow { opacity: 1; }

    @media (max-width: 860px) {
      .hiw-track {
        grid-template-columns: 1fr;
        gap: 16px;
        max-width: 420px;
        margin: 0 auto;
      }
      .hiw { padding: 88px 20px; }
      .hiw-head { margin-bottom: 48px; }
    }
  `],
})
export class HowItWorksComponent implements OnInit, AfterViewInit {
  private readonly sanitizer = inject(DomSanitizer);
  readonly stepsContainer = viewChild<ElementRef<HTMLDivElement>>('stepsContainer');

  private icon(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  readonly steps: Step[] = [
    {
      num: '01',
      title: 'Cadastre pacientes',
      description: 'Importe ou adicione pacientes com CPF, telefone e observações clínicas em segundos.',
      detail: 'Setup em ~2 min',
      accent: '#3b6ef5',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>`),
    },
    {
      num: '02',
      title: 'Agende consultas',
      description: 'Visualize horários livres, evite conflitos e organize a agenda com drag & drop.',
      detail: 'Agenda inteligente',
      accent: '#0d9488',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`),
    },
    {
      num: '03',
      title: 'Receba lembretes',
      description: 'WhatsApp automático confirma presença e reduz faltas com comunicação no momento certo.',
      detail: 'Até −80% faltas',
      accent: '#6d5af0',
      icon: this.icon(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>`),
    },
  ];

  ngOnInit() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit() {
    const steps = this.stepsContainer()?.nativeElement.querySelectorAll('.hiw-step');

    if (steps?.length) {
      ScrollTrigger.batch(steps as any, {
        start: 'top 94%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.16,
            stagger: 0.025,
            ease: 'power2.out',
          }),
        once: true,
      });
    }
  }
}
