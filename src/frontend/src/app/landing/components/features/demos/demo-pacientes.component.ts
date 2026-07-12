import { Component, signal, computed, afterNextRender, ElementRef, viewChild } from '@angular/core';
import gsap from 'gsap';

interface Patient {
  id: number;
  name: string;
  initials: string;
  age: number;
  lastVisit: string;
  nextVisit: string;
  phone: string;
  plan: string;
  status: 'ativo' | 'retorno' | 'novo';
  color: string;
}

@Component({
  selector: 'app-demo-pacientes',
  standalone: true,
  template: `
    <div class="demo-pacientes" #container>
      <div class="pac-cursor" [class.show]="cursorVisible()">
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
          <defs>
            <filter id="pacShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-opacity="0.35"/>
            </filter>
          </defs>
          <path d="M2 2L2 19L6.5 14.5L9.5 21L12 20L9 13.5L16 13.5L2 2Z" fill="#222" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" filter="url(#pacShadow)"/>
        </svg>
      </div>

      <header class="pac-toolbar">
        <div class="pac-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" placeholder="Buscar por nome ou telefone" readonly>
        </div>
        <div class="pac-filters">
          @for (f of filters; track f) {
            <button type="button" class="filter-chip"
              [class.active]="activeFilter() === f"
              [attr.data-filter]="f">{{ f }}</button>
          }
        </div>
      </header>

      <div class="pac-stats">
        <div class="ps-item"><span class="ps-val">5</span><span class="ps-lab">Total</span></div>
        <div class="ps-item"><span class="ps-val ps-val--ok">2</span><span class="ps-lab">Ativos</span></div>
        <div class="ps-item"><span class="ps-val ps-val--warn">2</span><span class="ps-lab">Retorno</span></div>
        <div class="ps-item"><span class="ps-val ps-val--new">1</span><span class="ps-lab">Novos</span></div>
      </div>

      <div class="pac-table">
        <div class="pac-thead" aria-hidden="true">
          <span class="col-patient">Paciente</span>
          <span class="col-plan">Convênio</span>
          <span class="col-visit">Última visita</span>
          <span class="col-status">Status</span>
          <span class="col-action"></span>
        </div>

        <div class="pac-tbody">
          @for (p of patients(); track p.id) {
            <div class="pac-row" [class.selected]="selectedId() === p.id" [attr.data-id]="p.id">
              <div class="col-patient">
                <div class="pac-avatar" [style.background]="p.color">{{ p.initials }}</div>
                <div class="pac-id">
                  <strong>{{ p.name }}</strong>
                  <span>{{ p.age }} anos · {{ p.phone }}</span>
                </div>
              </div>
              <div class="col-plan"><span class="plan-pill">{{ p.plan }}</span></div>
              <div class="col-visit">
                <span>{{ p.lastVisit }}</span>
                <small>Próx. {{ p.nextVisit }}</small>
              </div>
              <div class="col-status">
                <span class="status-dot" [attr.data-status]="p.status"></span>
                <span class="status-label">{{ statusLabel(p.status) }}</span>
              </div>
              <div class="col-action"><button type="button" class="row-btn">Agendar</button></div>
            </div>
          }
        </div>
      </div>

      @if (selectedPatient(); as sp) {
        <aside class="pac-preview">
          <div class="preview-head">
            <div class="pac-avatar pac-avatar--lg" [style.background]="sp.color">{{ sp.initials }}</div>
            <div>
              <strong>{{ sp.name }}</strong>
              <span>{{ sp.plan }} · {{ sp.age }} anos</span>
            </div>
          </div>
          <div class="preview-grid">
            <div><label>Telefone</label><p>{{ sp.phone }}</p></div>
            <div><label>Próxima consulta</label><p>{{ sp.nextVisit }}</p></div>
          </div>
          <div class="preview-actions">
            <button type="button" class="pa-btn pa-btn--ghost">Prontuário</button>
            <button type="button" class="pa-btn pa-btn--wa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.2-.4.2-.4.7-1.3.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.7 2.5.8 3.4.7.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3 0 0-.2-.1-.5-.2z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.2-1.3A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 0 1 3.8 12c0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z"/></svg>
              WhatsApp
            </button>
          </div>
        </aside>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .demo-pacientes {
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 0.8rem;
      min-width: 0;
      position: relative;
    }

    .pac-cursor {
      position: absolute;
      z-index: 20;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -10%);
      transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s;
    }
    .pac-cursor.show { opacity: 1; }

    .pac-toolbar { display: flex; flex-direction: column; gap: 10px; opacity: 0; }
    .pac-toolbar.visible { opacity: 1; }
    .pac-search {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 11px;
    }
    .pac-search svg { color: var(--clx-text-tertiary); flex-shrink: 0; }
    .pac-search input {
      flex: 1; min-width: 0; border: none; background: transparent;
      font-size: 0.82rem; color: var(--clx-text); outline: none; font-family: inherit;
    }
    .pac-search input::placeholder { color: var(--clx-text-tertiary); }

    .pac-filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-chip {
      padding: 5px 10px; border-radius: 8px; border: 1px solid var(--clx-border);
      background: var(--clx-bg); color: var(--clx-text-muted); font-size: 0.7rem;
      font-weight: 600; font-family: inherit; cursor: pointer; transition: all 160ms ease;
    }
    .filter-chip.active {
      background: rgba(59, 110, 245, 0.1); border-color: rgba(59, 110, 245, 0.28);
      color: var(--clx-accent);
    }

    .pac-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; opacity: 0; }
    .pac-stats.visible { opacity: 1; }
    .ps-item {
      padding: 10px 10px 9px; background: var(--clx-bg); border: 1px solid var(--clx-border);
      border-radius: 11px; display: flex; flex-direction: column; gap: 2px;
    }
    .ps-val { font-size: 1rem; font-weight: 750; color: var(--clx-text); font-variant-numeric: tabular-nums; }
    .ps-val--ok { color: #059669; }
    .ps-val--warn { color: #d97706; }
    .ps-val--new { color: #3b6ef5; }
    .ps-lab { font-size: 0.62rem; font-weight: 600; color: var(--clx-text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }

    .pac-table {
      background: var(--clx-bg); border: 1px solid var(--clx-border);
      border-radius: 14px; overflow: hidden; min-width: 0; opacity: 0;
    }
    .pac-table.visible { opacity: 1; }
    .pac-thead {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.7fr) minmax(0, 0.85fr) minmax(0, 0.7fr) 72px;
      gap: 8px; padding: 9px 12px; background: var(--clx-bg-alt);
      border-bottom: 1px solid var(--clx-border); font-size: 0.62rem;
      font-weight: 650; color: var(--clx-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;
    }
    .pac-tbody { max-height: 210px; overflow-y: auto; }
    .pac-row {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.7fr) minmax(0, 0.85fr) minmax(0, 0.7fr) 72px;
      gap: 8px; align-items: center; padding: 10px 12px;
      border-bottom: 1px solid var(--clx-border); cursor: pointer;
      transition: background 140ms ease; min-width: 0; opacity: 0;
    }
    .pac-row.visible { opacity: 1; }
    .pac-row:last-child { border-bottom: none; }
    .pac-row:hover { background: color-mix(in srgb, var(--clx-accent) 4%, transparent); }
    .pac-row.selected {
      background: rgba(59, 110, 245, 0.07);
      box-shadow: inset 3px 0 0 var(--clx-accent);
    }

    .col-patient { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .pac-avatar {
      width: 34px; height: 34px; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; color: #fff;
      font-weight: 700; font-size: 0.68rem; flex-shrink: 0;
    }
    .pac-avatar--lg { width: 40px; height: 40px; font-size: 0.75rem; }
    .pac-id { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .pac-id strong { font-size: 0.8rem; color: var(--clx-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pac-id span { font-size: 0.66rem; color: var(--clx-text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .col-plan, .col-visit, .col-status, .col-action { min-width: 0; }
    .plan-pill {
      display: inline-block; padding: 3px 8px; border-radius: 6px;
      background: var(--clx-bg-soft); border: 1px solid var(--clx-border);
      font-size: 0.66rem; font-weight: 600; color: var(--clx-text-secondary); white-space: nowrap;
    }
    .col-visit { display: flex; flex-direction: column; gap: 1px; }
    .col-visit span { font-size: 0.74rem; font-weight: 600; color: var(--clx-text); font-variant-numeric: tabular-nums; }
    .col-visit small { font-size: 0.62rem; color: var(--clx-text-tertiary); }
    .col-status { display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: #94a3b8; }
    .status-dot[data-status='ativo'] { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
    .status-dot[data-status='retorno'] { background: #d97706; box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15); }
    .status-dot[data-status='novo'] { background: #3b6ef5; box-shadow: 0 0 0 3px rgba(59, 110, 245, 0.15); }
    .status-label { font-size: 0.7rem; font-weight: 600; color: var(--clx-text-secondary); }
    .row-btn {
      padding: 5px 8px; border-radius: 7px; border: 1px solid var(--clx-border);
      background: var(--clx-bg-alt); color: var(--clx-text); font-size: 0.66rem;
      font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap;
      transition: border-color 140ms ease, color 140ms ease;
    }
    .row-btn:hover { border-color: var(--clx-accent); color: var(--clx-accent); }

    .pac-preview {
      display: flex; flex-direction: column; gap: 12px; padding: 14px;
      background: var(--clx-bg); border: 1px solid rgba(59, 110, 245, 0.18);
      border-radius: 14px; box-shadow: 0 8px 24px rgba(59, 110, 245, 0.06);
      animation: previewIn 0.3s ease-out;
    }
    @keyframes previewIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .preview-head { display: flex; align-items: center; gap: 12px; }
    .preview-head strong { display: block; font-size: 0.88rem; color: var(--clx-text); }
    .preview-head span { font-size: 0.72rem; color: var(--clx-text-muted); }
    .preview-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      padding-top: 10px; border-top: 1px solid var(--clx-border);
    }
    .preview-grid label {
      display: block; font-size: 0.62rem; font-weight: 650; text-transform: uppercase;
      letter-spacing: 0.04em; color: var(--clx-text-tertiary); margin-bottom: 3px;
    }
    .preview-grid p { font-size: 0.8rem; font-weight: 600; color: var(--clx-text); }
    .preview-actions { display: flex; gap: 8px; }
    .pa-btn {
      flex: 1; display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 8px 10px; border-radius: 9px; font-size: 0.72rem;
      font-weight: 650; font-family: inherit; cursor: pointer; border: none;
      transition: transform 140ms ease, box-shadow 140ms ease;
    }
    .pa-btn--ghost { background: var(--clx-bg-alt); border: 1px solid var(--clx-border); color: var(--clx-text); }
    .pa-btn--wa { background: #25D366; color: #fff; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25); }
    .pa-btn:hover { transform: translateY(-1px); }
  `],
})
export class DemoPacientesComponent {
  readonly containerRef = viewChild<ElementRef>('container');
  readonly cursorVisible = signal(false);
  private started = false;

  readonly filters = ['Todos', 'Ativos', 'Retorno', 'Novos'] as const;
  readonly activeFilter = signal<(typeof this.filters)[number]>('Todos');
  readonly selectedId = signal(1);

  readonly patients = signal<Patient[]>([
    { id: 1, name: 'Maria Silva', initials: 'MS', age: 34, lastVisit: '10/07', nextVisit: '10/10', phone: '(11) 99999-0001', plan: 'Particular', status: 'ativo', color: 'linear-gradient(135deg,#3b6ef5,#6d5af0)' },
    { id: 2, name: 'João Santos', initials: 'JS', age: 52, lastVisit: '28/06', nextVisit: '28/09', phone: '(11) 99999-0002', plan: 'Unimed', status: 'retorno', color: 'linear-gradient(135deg,#0d9488,#0891b2)' },
    { id: 3, name: 'Ana Costa', initials: 'AC', age: 28, lastVisit: '15/06', nextVisit: '15/08', phone: '(11) 99999-0003', plan: 'Amil', status: 'novo', color: 'linear-gradient(135deg,#d97706,#ea580c)' },
    { id: 4, name: 'Carlos Lima', initials: 'CL', age: 45, lastVisit: '05/07', nextVisit: '05/10', phone: '(11) 99999-0004', plan: 'Particular', status: 'ativo', color: 'linear-gradient(135deg,#6d5af0,#a78bfa)' },
    { id: 5, name: 'Fernanda Rocha', initials: 'FR', age: 31, lastVisit: '22/06', nextVisit: '22/09', phone: '(11) 99999-0005', plan: 'Bradesco', status: 'retorno', color: 'linear-gradient(135deg,#059669,#0d9488)' },
  ]);

  readonly selectedPatient = computed(() =>
    this.patients().find((p) => p.id === this.selectedId()) ?? null
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
      this.activeFilter.set('Todos');
      this.selectedId.set(1);
      await this.wait(100);

      this.animateEntrance();
      await this.wait(800);

      await this.clickRow(3);
      await this.wait(2200);

      await this.clickRow(5);
      await this.wait(2200);

      await this.clickFilter('Retorno');
      await this.wait(2000);

      await this.clickFilter('Ativos');
      await this.wait(2000);

      await this.clickFilter('Todos');
      await this.wait(500);

      await this.clickRow(2);
      await this.wait(2200);
    }
  }

  private animateEntrance() {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const toolbar = container.querySelector('.pac-toolbar');
    const stats = container.querySelector('.pac-stats');
    const table = container.querySelector('.pac-table');
    const rows = container.querySelectorAll('.pac-row');

    [toolbar, stats, table].forEach(el => {
      if (el) el.classList.remove('visible');
    });
    rows.forEach((r: HTMLElement) => r.classList.remove('visible'));

    gsap.fromTo(toolbar, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: () => toolbar?.classList.add('visible') });
    gsap.fromTo(stats, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.1, onComplete: () => stats?.classList.add('visible') });
    gsap.fromTo(table, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.15, onComplete: () => table?.classList.add('visible') });

    if (rows.length) {
      gsap.fromTo(rows,
        { x: -12, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.2,
          onComplete: () => rows.forEach((r: HTMLElement) => r.classList.add('visible')) }
      );
    }
  }

  private async clickRow(id: number) {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const row = container.querySelector(`.pac-row[data-id="${id}"]`) as HTMLElement;
    if (!row) return;

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const x = rowRect.left - containerRect.left + 60;
    const y = rowRect.top - containerRect.top + rowRect.height / 2;

    this.moveCursor(container, x, y);
    await this.wait(450);

    row.style.transition = 'background 0.12s ease, box-shadow 0.12s ease';
    row.style.background = 'rgba(59, 110, 245, 0.12)';
    await this.wait(120);
    row.style.background = '';

    this.selectedId.set(id);
    await this.wait(150);
    this.cursorVisible.set(false);
  }

  private async clickFilter(label: string) {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const chip = container.querySelector(`.filter-chip[data-filter="${label}"]`) as HTMLElement;
    if (!chip) return;

    const containerRect = container.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const x = chipRect.left - containerRect.left + chipRect.width / 2;
    const y = chipRect.top - containerRect.top + chipRect.height / 2;

    this.moveCursor(container, x, y);
    await this.wait(450);

    chip.style.transition = 'transform 0.12s ease';
    chip.style.transform = 'scale(0.9)';
    await this.wait(120);
    chip.style.transform = 'scale(1)';

    this.activeFilter.set(label as typeof this.filters[number]);
    await this.wait(200);
    this.cursorVisible.set(false);
  }

  private moveCursor(container: HTMLElement, x: number, y: number) {
    const cursorEl = container.querySelector('.pac-cursor') as HTMLElement;
    if (!cursorEl) return;
    cursorEl.style.left = x + 'px';
    cursorEl.style.top = y + 'px';
    this.cursorVisible.set(true);
  }

  statusLabel(s: Patient['status']) {
    return s === 'ativo' ? 'Ativo' : s === 'retorno' ? 'Retorno' : 'Novo';
  }
}
