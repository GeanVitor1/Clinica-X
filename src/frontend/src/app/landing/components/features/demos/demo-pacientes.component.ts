import { Component, signal, computed, afterNextRender } from '@angular/core';
import gsap from 'gsap';

interface Patient {
  id: number;
  name: string;
  initials: string;
  age: number;
  lastVisit: string;
  nextVisit: string;
  phone: string;
  email: string;
  plan: string;
  color: string;
  expanded: boolean;
}

@Component({
  selector: 'app-demo-pacientes',
  standalone: true,
  template: `
    <div class="demo-pacientes">
      <div class="pac-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Buscar paciente por nome ou telefone..."
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
        />
        <div class="search-shortcut">⌘K</div>
      </div>

      <div class="pac-list">
        @for (p of filteredPatients(); track p.id) {
          <div class="pac-card" [class.expanded]="p.expanded" (click)="togglePatient(p.id)">
            <div class="pac-row">
              <div class="pac-avatar" [style.background]="p.color">{{ p.initials }}</div>
              <div class="pac-info">
                <strong>{{ p.name }}</strong>
                <div class="pac-meta">
                  <span>{{ p.age }} anos</span>
                  <span class="meta-dot">·</span>
                  <span>Última: {{ p.lastVisit }}</span>
                </div>
              </div>
              <div class="pac-status" [class.online]="p.id <= 2"></div>
              <svg class="pac-chevron" [class.rotated]="p.expanded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>

            @if (p.expanded) {
              <div class="pac-detail">
                <div class="pac-detail-grid">
                  <div class="pac-detail-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>{{ p.phone }}</span>
                  </div>
                  <div class="pac-detail-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{{ p.email }}</span>
                  </div>
                  <div class="pac-detail-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>Próxima: {{ p.nextVisit }}</span>
                  </div>
                  <div class="pac-detail-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span>{{ p.plan }}</span>
                  </div>
                </div>
                <div class="pac-actions">
                  <button class="pac-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Histórico
                  </button>
                  <button class="pac-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Agendar
                  </button>
                  <button class="pac-btn pac-btn-wa">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    WhatsApp
                  </button>
                </div>
              </div>
            }
          </div>
        }

        @if (filteredPatients().length === 0) {
          <div class="pac-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Nenhum paciente encontrado</span>
          </div>
        }
      </div>

      <div class="pac-footer">
        <span>{{ filteredPatients().length }} de {{ patients().length }} pacientes</span>
        <button class="pac-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo paciente
        </button>
      </div>
    </div>
  `,
  styles: [`
    .demo-pacientes { font-size: 0.82rem; }

    .pac-search {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 12px;
      margin-bottom: 12px;
      transition: 0.2s;
    }
    .pac-search:focus-within {
      border-color: #c9954a;
      box-shadow: 0 0 0 3px rgba(201, 149, 74, 0.08);
    }
    .pac-search svg { color: var(--clx-text-muted); flex-shrink: 0; }
    .pac-search input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.82rem;
      color: var(--clx-text);
      outline: none;
    }
    .pac-search input::placeholder { color: var(--clx-text-muted); }
    .search-shortcut {
      padding: 2px 8px;
      border-radius: 5px;
      background: var(--clx-bg-alt);
      border: 1px solid var(--clx-border);
      font-size: 0.65rem;
      color: var(--clx-text-muted);
      font-weight: 600;
    }

    .pac-list { display: flex; flex-direction: column; gap: 6px; max-height: 260px; overflow-y: auto; }
    .pac-card {
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pac-card:hover { border-color: var(--clx-accent); box-shadow: 0 2px 12px rgba(0,0,0,0.03); }
    .pac-card.expanded { border-color: var(--clx-accent); }
    .pac-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
    }
    .pac-avatar {
      width: 38px; height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 0.75rem;
      flex-shrink: 0;
    }
    .pac-info { flex: 1; min-width: 0; }
    .pac-info strong { display: block; font-size: 0.85rem; color: var(--clx-text); }
    .pac-meta { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--clx-text-muted); }
    .meta-dot { opacity: 0.3; }
    .pac-status {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--clx-border);
      flex-shrink: 0;
    }
    .pac-status.online { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12); }
    .pac-chevron {
      color: var(--clx-text-muted);
      flex-shrink: 0;
      transition: transform 0.3s;
    }
    .pac-chevron.rotated { transform: rotate(180deg); }

    .pac-detail {
      padding: 0 14px 14px;
      border-top: 1px solid var(--clx-border);
    }
    .pac-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 12px 0;
    }
    .pac-detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.74rem;
      color: var(--clx-text-muted);
    }
    .pac-detail-item svg { flex-shrink: 0; opacity: 0.5; }
    .pac-actions { display: flex; gap: 6px; }
    .pac-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 7px;
      border-radius: 8px;
      border: 1px solid var(--clx-border);
      background: var(--clx-bg-alt);
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--clx-text);
      cursor: pointer;
      transition: all 0.15s;
    }
    .pac-btn:hover { border-color: var(--clx-accent); color: var(--clx-accent); }
    .pac-btn-wa:hover { border-color: #25D366; color: #25D366; }

    .pac-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px;
      color: var(--clx-text-muted);
    }
    .pac-empty svg { opacity: 0.2; }
    .pac-empty span { font-size: 0.8rem; }

    .pac-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      margin-top: 6px;
      border-top: 1px solid var(--clx-border);
    }
    .pac-footer span { font-size: 0.7rem; color: var(--clx-text-muted); }
    .pac-add-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 8px;
      background: #c9954a;
      color: #fff;
      border: none;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pac-add-btn:hover {
      background: #b8853a;
      box-shadow: 0 3px 12px rgba(201, 149, 74, 0.3);
    }
  `],
})
export class DemoPacientesComponent {
  constructor() {
    afterNextRender(() => {
      const cards = document.querySelectorAll('.demo-pacientes .pac-card');
      if (cards.length) {
        gsap.fromTo(cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
        );
      }
    });
  }

  readonly searchQuery = signal('');
  readonly patients = signal<Patient[]>([
    { id: 1, name: 'Maria Silva', initials: 'MS', age: 34, lastVisit: '10/07/2026', nextVisit: '10/10/2026', phone: '(11) 99999-0001', email: 'maria@email.com', plan: 'Particular', color: '#c9954a', expanded: true },
    { id: 2, name: 'João Santos', initials: 'JS', age: 52, lastVisit: '28/06/2026', nextVisit: '28/09/2026', phone: '(11) 99999-0002', email: 'joao@email.com', plan: 'Unimed', color: '#6366f1', expanded: false },
    { id: 3, name: 'Ana Costa', initials: 'AC', age: 28, lastVisit: '15/06/2026', nextVisit: '15/08/2026', phone: '(11) 99999-0003', email: 'ana@email.com', plan: 'Amil', color: '#f59e0b', expanded: false },
    { id: 4, name: 'Carlos Lima', initials: 'CL', age: 45, lastVisit: '05/07/2026', nextVisit: '05/10/2026', phone: '(11) 99999-0004', email: 'carlos@email.com', plan: 'Particular', color: '#ef4444', expanded: false },
    { id: 5, name: 'Fernanda Rocha', initials: 'FR', age: 31, lastVisit: '22/06/2026', nextVisit: '22/09/2026', phone: '(11) 99999-0005', email: 'fernanda@email.com', plan: 'Bradesco', color: '#8b5cf6', expanded: false },
  ]);

  readonly filteredPatients = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.patients().filter(p =>
      p.name.toLowerCase().includes(q) || p.phone.includes(q)
    );
  });

  togglePatient(id: number) {
    this.patients.update(all =>
      all.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p)
    );
  }
}
