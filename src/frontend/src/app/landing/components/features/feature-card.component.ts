import { Component, input, ElementRef, viewChild, afterNextRender, effect } from '@angular/core';
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
      <div class="fc-glow" #glowRef></div>
      @switch (demoType()) {
        @case ('agenda') { <app-demo-agenda /> }
        @case ('prontuario') { <app-demo-prontuario /> }
        @case ('whatsapp') { <app-demo-whatsapp /> }
        @case ('relatorios') { <app-demo-relatorios /> }
        @case ('pacientes') { <app-demo-pacientes /> }
        @case ('pwa') { <app-demo-pwa /> }
      }
    </div>
  `,
  styles: [`
    .feature-card {
      position: relative;
      background: linear-gradient(135deg, var(--clx-bg), var(--clx-bg-alt));
      border-radius: var(--clx-radius);
      padding: 20px;
      transition: transform 0.25s, box-shadow 0.25s;
      overflow: hidden;
    }
    .feature-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: calc(var(--clx-radius) + 1px);
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), transparent, rgba(124, 58, 237, 0.06));
      opacity: 0;
      transition: opacity 0.6s;
      pointer-events: none;
    }
    .feature-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: var(--clx-shadow-hover), 0 0 0 1px rgba(37, 99, 235, 0.06);
    }
    .feature-card:hover::before {
      opacity: 1;
    }
    .fc-glow {
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.06), transparent);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      transform: translate(-50%, -50%);
    }
    .feature-card:hover .fc-glow {
      opacity: 1;
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
        gsap.to(glow, { x, y, opacity: 1, duration: 0.3 });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(glow, { opacity: 0, duration: 0.3 });
      });
    });
  }
}
