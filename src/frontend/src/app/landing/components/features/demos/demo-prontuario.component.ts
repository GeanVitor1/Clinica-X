import { Component, signal, computed, afterNextRender, ElementRef, viewChild } from '@angular/core';
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
}

@Component({
  selector: 'app-demo-prontuario',
  standalone: true,
  template: `
    <div class="demo-prontuario" #container>
      <div class="pront-cursor" [class.show]="cursorVisible()">
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
          <defs>
            <filter id="prontShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-opacity="0.35"/>
            </filter>
          </defs>
          <path d="M2 2L2 19L6.5 14.5L9.5 21L12 20L9 13.5L16 13.5L2 2Z" fill="#222" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" filter="url(#prontShadow)"/>
        </svg>
      </div>

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
        <span class="pront-count">{{ consultations.length }} consultas</span>
      </div>

      <!-- Compact list — never expands, so layout height is constant -->
      <div class="timeline" #timeline>
        @for (c of consultations; track c.id) {
          <div
            class="tl-item"
            [class.selected]="selectedId() === c.id"
            [attr.data-id]="c.id"
          >
            <div class="tl-marker" [class.tl-marker--latest]="$first"></div>
            <div class="tl-card">
              <div class="tl-head">
                <div class="tl-head-left">
                  <span class="tl-date">{{ c.date }}</span>
                  <span class="tl-doctor">{{ c.doctor }}</span>
                  <span class="tl-spec">{{ c.specialty }}</span>
                </div>
                <svg class="tl-chevron" [class.rotated]="selectedId() === c.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="tl-diagnosis">{{ c.diagnosis }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Fixed detail panel — same height for every consultation -->
      @if (active(); as c) {
        <div class="detail-panel" #detailPanel>
          <div class="tl-section">
            <div class="tl-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Observações
            </div>
            <p>{{ c.notes }}</p>
          </div>

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
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .demo-prontuario {
      font-size: 0.82rem;
      position: relative;
      overflow-anchor: none;
    }

    .pront-cursor {
      position: absolute;
      z-index: 20;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -10%);
      transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s;
    }
    .pront-cursor.show { opacity: 1; }

    .pront-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--clx-border);
      opacity: 0;
    }
    .pront-header.visible { opacity: 1; }
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
      margin-bottom: 12px;
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
      margin-bottom: 10px;
      opacity: 0;
    }
    .tl-item:last-child { margin-bottom: 0; }
    .tl-item.visible { opacity: 1; }
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
      transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    }
    .tl-marker--latest {
      background: var(--clx-accent);
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 4px rgba(201, 149, 74, 0.15);
    }
    .tl-item.selected .tl-marker {
      background: var(--clx-accent);
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 4px rgba(201, 149, 74, 0.15);
    }
    .tl-card {
      background: var(--clx-bg-alt);
      border: 1px solid var(--clx-border);
      border-radius: 12px;
      padding: 12px 14px;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.12s;
    }
    .tl-item.selected .tl-card {
      border-color: var(--clx-accent);
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
    .tl-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .tl-head-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex-wrap: wrap;
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
      transition: transform 0.25s;
    }
    .tl-chevron.rotated { transform: rotate(180deg); }
    .tl-diagnosis {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--clx-text);
      padding-right: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Fixed-size detail area — content swaps without resizing the card */
    .detail-panel {
      background: var(--clx-bg-alt);
      border: 1px solid var(--clx-border);
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      /* Locked panel height — longest consultation content fits; shorter ones leave internal free space only */
      height: 210px;
      min-height: 210px;
      max-height: 210px;
      overflow: hidden;
      box-sizing: border-box;
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
      font-size: 0.78rem;
      color: var(--clx-text);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .rx-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
      background: var(--clx-bg);
      border-radius: 8px;
      margin-bottom: 4px;
    }
    .rx-name { font-weight: 600; font-size: 0.78rem; color: var(--clx-text); }
    .rx-dose { color: var(--clx-text-muted); font-size: 0.72rem; }
    .attach-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .attach-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 8px;
      font-size: 0.7rem;
      color: var(--clx-text-muted);
    }
  `],
})
export class DemoProntuarioComponent {
  readonly containerRef = viewChild<ElementRef>('container');
  readonly timeline = viewChild<ElementRef>('timeline');
  readonly cursorVisible = signal(false);
  readonly selectedId = signal(3);
  private started = false;

  readonly consultations: Consultation[] = [
    {
      id: 3, date: '10/07/2026', doctor: 'Dra. Ana Beatriz',
      specialty: 'Clínico Geral', diagnosis: 'Hipertensão Arterial — Consulta de rotina',
      notes: 'Paciente apresenta pressão arterial controlada (12x8). Manter medicação atual. Retorno recomendado em 3 meses com novos exames de sangue.',
      prescriptions: [
        { medication: 'Losartana 50mg', dosage: '1 comprimido/dia' },
        { medication: 'Hidroclorotiazida 25mg', dosage: '1 comprimido/dia' },
      ],
      attachments: [{ name: 'Exame_Sangue_Jul2026.pdf', type: 'pdf' }],
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
    },
  ];

  readonly active = computed(() =>
    this.consultations.find(c => c.id === this.selectedId()) ?? this.consultations[0]
  );

  constructor() {
    afterNextRender(() => {
      const el = this.containerRef()?.nativeElement;
      if (!el) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && !this.started) {
          this.started = true;
          obs.disconnect();
          this.loop();
        }
      }, { threshold: 0.25 });
      obs.observe(el);
    });
  }

  private wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  private async loop() {
    while (true) {
      this.cursorVisible.set(false);
      this.selectedId.set(3);
      await this.wait(100);

      this.animateEntrance();
      await this.wait(900);

      await this.selectItem(2);
      await this.wait(2400);

      await this.selectItem(1);
      await this.wait(2400);

      await this.selectItem(3);
      await this.wait(2400);
    }
  }

  private animateEntrance() {
    const header = this.containerRef()?.nativeElement?.querySelector('.pront-header');
    const items = this.containerRef()?.nativeElement?.querySelectorAll('.tl-item');

    if (header) {
      header.classList.remove('visible');
      gsap.fromTo(header,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out',
          onComplete: () => header.classList.add('visible') }
      );
    }
    if (items?.length) {
      items.forEach((i: HTMLElement) => i.classList.remove('visible'));
      gsap.fromTo(items,
        { x: -12, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, stagger: 0.1, ease: 'power2.out', delay: 0.1,
          onComplete: () => items.forEach((i: HTMLElement) => i.classList.add('visible')) }
      );
    }
  }

  private async selectItem(id: number) {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const item = container.querySelector(`.tl-item[data-id="${id}"]`) as HTMLElement;
    if (!item) return;

    const card = item.querySelector('.tl-card') as HTMLElement;
    if (!card) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const x = cardRect.left - containerRect.left + cardRect.width / 2;
    const y = cardRect.top - containerRect.top + 20;

    const cursorEl = container.querySelector('.pront-cursor') as HTMLElement;
    if (cursorEl) {
      cursorEl.style.left = x + 'px';
      cursorEl.style.top = y + 'px';
    }
    this.cursorVisible.set(true);
    await this.wait(400);

    card.style.transform = 'scale(0.97)';
    await this.wait(100);
    card.style.transform = 'scale(1)';

    // Only swaps content inside fixed panel — zero layout shift
    this.selectedId.set(id);
    await this.wait(120);
    this.cursorVisible.set(false);
  }
}
