import { Component, signal, afterNextRender, ElementRef, viewChild } from '@angular/core';
import gsap from 'gsap';

interface Prescription {
  medication: string;
  dosage: string;
}

interface Attachment {
  name: string;
  type: 'pdf' | 'image';
}

interface Consultation {
  id: number;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  notes: string;
  prescriptions: Prescription[];
  attachments: Attachment[];
  expanded: boolean;
}

@Component({
  selector: 'app-demo-prontuario',
  standalone: true,
  template: `
    <div class="demo-prontuario">
      <div class="pront-header">
        <div class="patient-info">
          <div class="patient-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <strong class="patient-name">Maria Silva</strong>
            <span class="patient-meta">34 anos • Feminino • CPF: ***.123.456-**</span>
          </div>
        </div>
        <span class="pront-count">{{ consultations().length }} consultas</span>
      </div>

      <div class="timeline">
        @for (c of consultations(); track c.id) {
          <div class="tl-item" [class.expanded]="c.expanded">
            <div class="tl-marker" [class.tl-marker--latest]="$first"></div>
            <div class="tl-card" (click)="toggleConsult(c.id)">
              <div class="tl-head">
                <div class="tl-head-left">
                  <span class="tl-date">{{ c.date }}</span>
                  <span class="tl-doctor">{{ c.doctor }}</span>
                  <span class="tl-spec">{{ c.specialty }}</span>
                </div>
                <svg class="tl-chevron" [class.rotated]="c.expanded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              <div class="tl-diagnosis">{{ c.diagnosis }}</div>

              @if (c.expanded) {
                <div class="tl-body">
                  <div class="tl-section">
                    <div class="tl-section-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      Observações
                    </div>
                    <p>{{ c.notes }}</p>
                  </div>

                  @if (c.prescriptions.length > 0) {
                    <div class="tl-section">
                      <div class="tl-section-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2.343A7 7 0 0 0 2 11v4a3 3 0 0 0 3 3h1v4h12v-4h1a3 3 0 0 0 3-3v-4a7 7 0 0 0-8-6.657V2z"/><path d="M9 12v4"/><path d="M15 12v4"/></svg>
                        Prescrições
                      </div>
                      @for (p of c.prescriptions; track p.medication) {
                        <div class="rx-item">
                          <span class="rx-name">{{ p.medication }}</span>
                          <span class="rx-dose">{{ p.dosage }}</span>
                        </div>
                      }
                    </div>
                  }

                  @if (c.attachments.length > 0) {
                    <div class="tl-section">
                      <div class="tl-section-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        Anexos
                      </div>
                      <div class="attach-list">
                        @for (a of c.attachments; track a.name) {
                          <div class="attach-chip">
                            @if (a.type === 'pdf') {
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            } @else {
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            }
                            {{ a.name }}
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .demo-prontuario { font-size: 0.82rem; }

    .pront-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--clx-border);
    }
    .patient-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .patient-avatar {
      width: 42px; height: 42px;
      border-radius: 14px;
      background: linear-gradient(135deg, #c9954a, #b8853a);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .patient-name {
      display: block;
      font-size: 0.92rem;
      color: var(--clx-text);
    }
    .patient-meta {
      font-size: 0.72rem;
      color: var(--clx-text-muted);
    }
    .pront-count {
      padding: 4px 12px;
      border-radius: 20px;
      background: var(--clx-bg-alt);
      border: 1px solid var(--clx-border);
      color: var(--clx-text-muted);
      font-size: 0.72rem;
      font-weight: 500;
    }

    .timeline {
      position: relative;
      padding-left: 24px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: linear-gradient(180deg, #c9954a, var(--clx-border) 60%, transparent);
      border-radius: 2px;
    }
    .tl-item {
      position: relative;
      margin-bottom: 16px;
    }
    .tl-marker {
      position: absolute;
      left: -18px;
      top: 16px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--clx-bg);
      border: 2.5px solid var(--clx-border);
      z-index: 1;
      transition: all 0.3s;
    }
    .tl-marker--latest {
      background: var(--clx-accent);
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 4px rgba(201, 149, 74, 0.15);
    }
    .tl-card {
      background: var(--clx-bg-alt);
      border: 1px solid var(--clx-border);
      border-radius: 14px;
      padding: 14px 16px;
      cursor: pointer;
      transition: all 0.25s;
    }
    .tl-card:hover {
      border-color: var(--clx-accent);
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .tl-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .tl-head-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tl-date {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--clx-accent);
      background: rgba(20, 184, 166, 0.08);
      padding: 2px 10px;
      border-radius: 6px;
    }
    .tl-doctor { font-size: 0.75rem; font-weight: 600; color: var(--clx-text); }
    .tl-spec {
      font-size: 0.68rem;
      color: var(--clx-text-muted);
      padding: 2px 8px;
      background: var(--clx-bg);
      border-radius: 4px;
    }
    .tl-chevron {
      flex-shrink: 0;
      color: var(--clx-text-muted);
      transition: transform 0.3s;
    }
    .tl-chevron.rotated { transform: rotate(180deg); }
    .tl-diagnosis {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--clx-text);
      padding-right: 24px;
    }

    .tl-body {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--clx-border);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .tl-section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--clx-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }
    .tl-section-label svg { opacity: 0.5; }
    .tl-section p {
      font-size: 0.8rem;
      color: var(--clx-text);
      line-height: 1.5;
    }
    .rx-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: var(--clx-bg);
      border-radius: 8px;
      margin-bottom: 4px;
    }
    .rx-name { font-weight: 600; font-size: 0.8rem; color: var(--clx-text); }
    .rx-dose { color: var(--clx-text-muted); font-size: 0.75rem; }
    .attach-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .attach-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 8px;
      font-size: 0.72rem;
      color: var(--clx-text-muted);
      transition: 0.15s;
    }
    .attach-chip:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
    }
  `],
})
export class DemoProntuarioComponent {
  readonly containerRef = viewChild<ElementRef>('container');

  constructor() {
    afterNextRender(() => {
      const items = document.querySelectorAll('.demo-prontuario .tl-item');
      if (items.length) {
        gsap.fromTo(items,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.2 }
        );
      }
    });
  }

  readonly consultations = signal<Consultation[]>([
    {
      id: 3, date: '10/07/2026', doctor: 'Dra. Ana Beatriz',
      specialty: 'Clínico Geral', diagnosis: 'Hipertensão Arterial — Consulta de rotina',
      notes: 'Paciente apresenta pressão arterial controlada (12x8). Manter medicação atual. Retorno recomendado em 3 meses com novos exames de sangue.',
      prescriptions: [
        { medication: 'Losartana 50mg', dosage: '1 comprimido/dia' },
        { medication: 'Hidroclorotiazida 25mg', dosage: '1 comprimido/dia' },
      ],
      attachments: [{ name: 'Exame_Sangue_Jul2026.pdf', type: 'pdf' }],
      expanded: true,
    },
    {
      id: 2, date: '12/04/2026', doctor: 'Dr. Carlos Mendes',
      specialty: 'Cardiologia', diagnosis: 'Check-up cardiológico anual',
      notes: 'ECG normal. Ecocardiograma sem alterações significativas. Colesterol LDL levemente elevado — orientado sobre dieta e atividade física.',
      prescriptions: [
        { medication: 'Rosuvastatina 10mg', dosage: '1 comprimido/noite' },
      ],
      attachments: [
        { name: 'Eco_Jul2026.pdf', type: 'pdf' },
        { name: 'ECG_Abr2026.jpg', type: 'image' },
      ],
      expanded: false,
    },
    {
      id: 1, date: '05/01/2026', doctor: 'Dr. Rafael Oliveira',
      specialty: 'Ortopedia', diagnosis: 'Lombalgia crônica — Sessão de fisioterapia',
      notes: 'Paciente relata melhora com alongamentos diários. Encaminhado para nova sessão de RPG. Evitar esforços repetitivos por 30 dias.',
      prescriptions: [
        { medication: 'Naproxeno 500mg', dosage: '12/12h por 5 dias' },
        { medication: 'Tramadol 50mg', dosage: 'Se dor intensa, máximo 3x/dia' },
      ],
      attachments: [
        { name: 'Raio-X_Jan2026.jpg', type: 'image' },
        { name: 'Ressonancia_Mar2026.pdf', type: 'pdf' },
      ],
      expanded: false,
    },
  ]);

  toggleConsult(id: number) {
    this.consultations.update(all =>
      all.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c)
    );
  }
}
