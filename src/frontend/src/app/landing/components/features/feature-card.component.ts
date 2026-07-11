import { Component, input, ElementRef, viewChild, afterNextRender } from '@angular/core';
import gsap from 'gsap';
import { DemoAgendaComponent } from './demos/demo-agenda.component';
import { DemoProntuarioComponent } from './demos/demo-prontuario.component';
import { DemoWhatsappComponent } from './demos/demo-whatsapp.component';
import { DemoRelatoriosComponent } from './demos/demo-relatorios.component';
import { DemoPacientesComponent } from './demos/demo-pacientes.component';
import { DemoPwaComponent } from './demos/demo-pwa.component';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [
    DemoAgendaComponent,
    DemoProntuarioComponent,
    DemoWhatsappComponent,
    DemoRelatoriosComponent,
    DemoPacientesComponent,
    DemoPwaComponent,
  ],
  template: `
    <div class="feature-card" #cardRef>
      <div class="fc-shine" aria-hidden="true"></div>
      <div class="fc-glow" #glowRef></div>
      <div class="fc-content">
        @switch (demoType()) {
          @case ('agenda') { <app-demo-agenda /> }
          @case ('prontuario') { <app-demo-prontuario /> }
          @case ('whatsapp') { <app-demo-whatsapp /> }
          @case ('relatorios') { <app-demo-relatorios /> }
          @case ('pacientes') { <app-demo-pacientes /> }
          @case ('pwa') { <app-demo-pwa /> }
        }
      </div>
    </div>
  `,
  styles: [`
    .feature-card {
      position: relative;
      background:
        linear-gradient(165deg, #c5d4e8 0%, #b4c6e0 48%, #a5b9d6 100%);
      backdrop-filter: blur(14px) saturate(1.1);
      -webkit-backdrop-filter: blur(14px) saturate(1.1);
      border-radius: 18px;
      padding: 22px;
      overflow: hidden;
      border: 1px solid rgba(20, 45, 90, 0.2);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.22) inset,
        0 4px 16px rgba(20, 42, 85, 0.14),
        0 16px 40px rgba(20, 42, 85, 0.12);
      color: #0f1b33;
      transition:
        transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1),
        border-color 280ms ease;
    }
    .feature-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        145deg,
        rgba(59, 110, 245, 0.22),
        transparent 40%,
        rgba(13, 148, 136, 0.12)
      );
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 400ms ease;
      pointer-events: none;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      border-color: rgba(59, 110, 245, 0.32);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.5) inset,
        0 8px 24px rgba(37, 70, 130, 0.14),
        0 20px 48px rgba(59, 110, 245, 0.12);
    }
    .feature-card:hover::before {
      opacity: 1;
    }
    .fc-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        120deg,
        transparent 30%,
        rgba(255, 255, 255, 0.04) 45%,
        transparent 60%
      );
      opacity: 0;
      transform: translateX(-30%);
      transition: opacity 400ms ease, transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 1;
    }
    .feature-card:hover .fc-shine {
      opacity: 1;
      transform: translateX(30%);
    }
    .fc-glow {
      position: absolute;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59, 110, 245, 0.1), transparent 70%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 300ms ease;
      transform: translate(-50%, -50%);
      z-index: 0;
    }
    .feature-card:hover .fc-glow {
      opacity: 1;
    }
    .fc-content {
      position: relative;
      z-index: 2;
    }
  `],
})
export class FeatureCardComponent {
  readonly demoType = input.required<string>();
  readonly cardRef = viewChild<ElementRef>('cardRef');
  readonly glowRef = viewChild<ElementRef>('glowRef');

  constructor() {
    afterNextRender(() => {
      const card = this.cardRef()?.nativeElement;
      const glow = this.glowRef()?.nativeElement;
      if (!card || !glow) return;

      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gsap.to(glow, { x, y, opacity: 1, duration: 0.35, ease: 'power2.out' });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(glow, { opacity: 0, duration: 0.35, ease: 'power2.out' });
      });
    });
  }
}
