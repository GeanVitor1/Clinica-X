import { Component, ElementRef, AfterViewInit, OnInit, viewChild, inject } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LandingAnimationService } from '../../services/landing-animation.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  template: `
    <section class="hiw" id="como-funciona">
      <h2 class="hiw-title">Como funciona</h2>
      <div class="hiw-steps" #stepsContainer>
        <div class="hiw-step" #step>
          <div class="step-number" #counter>0</div>
          <h3>Cadastre Pacientes</h3>
          <p>Adicione seus pacientes com CPF, telefone e observações em segundos.</p>
        </div>
        <div class="hiw-step" #step>
          <div class="step-number" #counter>0</div>
          <h3>Agende Consultas</h3>
          <p>Visualize horários livres e agende com drag & drop no calendário.</p>
        </div>
        <div class="hiw-step" #step>
          <div class="step-number" #counter>0</div>
          <h3>Receba Lembretes</h3>
          <p>Notificações automáticas via WhatsApp reduzem faltas em até 80%.</p>
        </div>
      </div>
      <svg class="hiw-connector" viewBox="0 0 800 100" preserveAspectRatio="none">
        <path d="M50,50 C200,0 300,100 400,50 C500,0 600,100 750,50"
          stroke="var(--clx-accent)" stroke-width="2" fill="none" stroke-dasharray="1000"
          stroke-dashoffset="1000" #connectorPath/>
      </svg>
    </section>
  `,
  styles: [`
    .hiw {
      padding: 120px 24px;
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      background: var(--clx-bg-soft);
    }
    .hiw::before {
      content: '';
      position: absolute;
      top: -20%;
      left: -10%;
      width: 50%;
      height: 60%;
      background: radial-gradient(ellipse, rgba(37, 99, 235, 0.03), transparent);
      pointer-events: none;
    }
    .hiw-title {
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 60px;
    }
    .hiw-steps {
      display: flex;
      gap: 32px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .hiw-step {
      flex: 1;
      min-width: 240px;
      max-width: 300px;
      padding: 36px 28px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius);
      opacity: 0;
      transform: translateX(-30px);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .hiw-step:hover {
      transform: translateY(-4px);
      box-shadow: var(--clx-shadow-hover);
    }
    .step-number {
      font-size: 2.6rem;
      font-weight: 800;
      color: var(--clx-accent);
      margin-bottom: 16px;
      letter-spacing: -0.03em;
    }
    .hiw-step h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--clx-text);
      margin-bottom: 8px;
    }
    .hiw-step p {
      font-size: 0.9rem;
      color: var(--clx-text-muted);
      line-height: 1.5;
    }
    .hiw-connector {
      position: absolute;
      top: 50%;
      left: 10%;
      width: 80%;
      height: 100px;
      pointer-events: none;
      z-index: -1;
    }
  `],
})
export class HowItWorksComponent implements OnInit, AfterViewInit {
  private animation = inject(LandingAnimationService);
  readonly stepsContainer = viewChild<ElementRef<HTMLDivElement>>('stepsContainer');
  readonly counters = viewChild<ElementRef<HTMLDivElement>>('stepsContainer');
  readonly connectorPath = viewChild<ElementRef<SVGPathElement>>('connectorPath');

  ngOnInit() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit() {
    const steps = this.stepsContainer()?.nativeElement.querySelectorAll('.hiw-step');
    const counters = this.stepsContainer()?.nativeElement.querySelectorAll('.step-number');
    const path = this.connectorPath()?.nativeElement;

    if (steps) {
      ScrollTrigger.batch(steps as any, {
        start: 'top 85%',
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out' }),
        once: true,
      });
    }

    if (counters && steps) {
      ScrollTrigger.batch(counters as any, {
        start: 'top 85%',
        onEnter: (batch) => {
          batch.forEach((el, i) => {
            this.animation.countUp(el as HTMLElement, (i + 1) * 3);
          });
        },
        once: true,
      });
    }

    if (path) {
      ScrollTrigger.create({
        trigger: path,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(path, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' });
        },
        once: true,
      });
    }
  }
}
