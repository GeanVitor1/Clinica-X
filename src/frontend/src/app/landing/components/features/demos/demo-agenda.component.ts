import { Component, ElementRef, signal, computed, viewChild, afterNextRender } from '@angular/core';
import gsap from 'gsap';

interface AgendaEvent {
  time: string;
  title: string;
  patient: string;
  color: string;
}

interface Day {
  num: number;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: AgendaEvent[];
  hasConflict: boolean;
}

@Component({
  selector: 'app-demo-agenda',
  standalone: true,
  template: `
    <div class="demo-agenda" #container>
      <div class="cal-header">
        <div class="cal-nav">
          <button class="nav-btn" (click)="prevMonth()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="month-label">{{ monthYear() }}</span>
          <button class="nav-btn" (click)="nextMonth()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="view-tabs">
          @for (v of views; track v) {
            <button [class.active]="currentView() === v" (click)="currentView.set(v)">{{ v }}</button>
          }
        </div>
      </div>

      <div class="cal-grid">
        @for (name of dayNames; track name) {
          <div class="day-name">{{ name }}</div>
        }
        @for (day of days(); track day.dateStr) {
          <div class="day-cell"
               [class.today]="day.isToday"
               [class.other-month]="!day.isCurrentMonth"
               [class.has-events]="day.events.length > 0"
               [class.conflict]="day.hasConflict"
               [class.selected]="selectedDay()?.dateStr === day.dateStr"
               (click)="selectDay(day)">
            <span class="day-num">{{ day.num }}</span>
            @if (day.events.length > 0) {
              <div class="event-pips">
                @for (e of day.events.slice(0, 3); track e.title) {
                  <span class="event-pip" [style.background]="e.color"></span>
                }
                @if (day.events.length > 3) {
                  <span class="event-more">+{{ day.events.length - 3 }}</span>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (selectedDay(); as day) {
        <div class="day-detail" #dayDetail>
          <div class="detail-top">
            <strong>{{ day.dateStr }}</strong>
            @if (day.hasConflict) {
              <span class="conflict-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Conflito
              </span>
            }
          </div>
          <div class="detail-events">
            @for (e of day.events; track e.title + e.time) {
              <div class="detail-event" [style.borderLeftColor]="e.color">
                <span class="ev-time">{{ e.time }}</span>
                <div class="ev-body">
                  <span class="ev-title">{{ e.title }}</span>
                  <span class="ev-patient">{{ e.patient }}</span>
                </div>
              </div>
            }
            @if (day.events.length === 0) {
              <div class="empty-state">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Nenhum agendamento</span>
              </div>
            }
          </div>
          <button class="btn-add">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo horário
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .demo-agenda {
    --cal-accent: #c9954a;
    --cal-bg: var(--clx-bg);
    --cal-border: var(--clx-border);
    font-size: 0.82rem;
    }

    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .cal-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-btn {
      width: 34px; height: 34px;
      border-radius: 10px;
      border: 1px solid var(--cal-border);
      background: var(--cal-bg);
      color: var(--clx-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: var(--clx-accent);
      color: #fff;
      border-color: var(--clx-accent);
    }
    .month-label {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--clx-text);
      min-width: 130px;
      text-align: center;
    }
    .view-tabs {
      display: flex;
      padding: 3px;
      background: var(--cal-bg);
      border: 1px solid var(--cal-border);
      border-radius: 10px;
    }
    .view-tabs button {
      padding: 5px 14px;
      border-radius: 7px;
      border: none;
      background: transparent;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--clx-text-muted);
      transition: all 0.2s;
    }
    .view-tabs button.active {
      background: var(--clx-accent);
      color: #fff;
      box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 16px;
    }
    .day-name {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--clx-text-muted);
      padding: 6px 0 8px;
    }
    .day-cell {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      border: 1.5px solid transparent;
      background: var(--cal-bg);
      transition: all 0.2s;
    }
    .day-cell:hover {
      border-color: var(--clx-accent);
      background: rgba(20, 184, 166, 0.04);
    }
    .day-cell.today {
      background: linear-gradient(135deg, #c9954a, #b8853a);
      color: #fff;
      box-shadow: 0 3px 12px rgba(201, 149, 74, 0.35);
    }
    .day-cell.today .day-num { color: #fff; }
    .day-cell.other-month { opacity: 0.3; }
    .day-cell.selected {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px rgba(201, 149, 74, 0.15);
    }
    .day-cell.conflict .day-num { color: #dc2626; }
    .day-cell.conflict.today .day-num { color: #fff; }
    .day-num {
      font-weight: 650;
      font-size: 0.82rem;
      color: var(--clx-text);
      line-height: 1;
    }
    .event-pips {
      display: flex;
      gap: 2px;
      align-items: center;
    }
    .event-pip {
      width: 5px; height: 5px;
      border-radius: 50%;
      display: block;
    }
    .event-more {
      font-size: 0.55rem;
      color: var(--clx-text-muted);
      font-weight: 600;
    }

    .day-detail {
      background: var(--clx-bg-alt);
      border: 1px solid var(--cal-border);
      border-radius: 14px;
      padding: 16px;
    }
    .detail-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .detail-top strong {
      font-size: 0.85rem;
      color: var(--clx-text);
    }
    .conflict-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      background: #fef2f2;
      color: #dc2626;
      font-size: 0.68rem;
      font-weight: 600;
    }
    .detail-events {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
      max-height: 150px;
      overflow-y: auto;
    }
    .detail-event {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-left: 3px solid;
      background: var(--clx-bg);
      border-radius: 10px;
      transition: 0.15s;
    }
    .detail-event:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .ev-time {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--clx-text-muted);
      min-width: 44px;
      font-variant-numeric: tabular-nums;
    }
    .ev-body {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .ev-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--clx-text);
    }
    .ev-patient {
      font-size: 0.7rem;
      color: var(--clx-text-muted);
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 20px;
      color: var(--clx-text-muted);
    }
    .empty-state svg { opacity: 0.3; }
    .empty-state span { font-size: 0.78rem; }
    .btn-add {
      width: 100%;
      padding: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1.5px dashed var(--clx-border);
      border-radius: 10px;
      background: transparent;
      color: var(--clx-accent);
      font-weight: 600;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add:hover {
      border-color: var(--clx-accent);
      background: rgba(20, 184, 166, 0.04);
    }
  `],
})
export class DemoAgendaComponent {
  readonly containerRef = viewChild<ElementRef>('container');
  readonly dayDetail = viewChild<ElementRef>('dayDetail');

  readonly views = ['Dia', 'Semana', 'Mês'] as const;
  readonly currentView = signal<'Dia' | 'Semana' | 'Mês'>('Mês');
  readonly today = new Date();
  readonly cursorDate = signal(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
  readonly selectedDay = signal<Day | null>(null);

  readonly dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  readonly monthYear = computed(() => {
    const d = this.cursorDate();
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  readonly days = computed(() => {
    const d = this.cursorDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const events = this.mockEvents();
    const result: Day[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrev - i;
      result.push(this.makeDay(year, month - 1, day, false, events));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(this.makeDay(year, month, i, true, events));
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      result.push(this.makeDay(year, month + 1, i, false, events));
    }

    return result;
  });

  private mockEvents(): Map<string, AgendaEvent[]> {
    const m = new Map<string, AgendaEvent[]>();
    const d = this.cursorDate();
    const y = d.getFullYear();
    const mo = d.getMonth();

    const add = (day: number, e: AgendaEvent) => {
      const key = `${y}-${mo}-${day}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    };

    add(5, { time: '09:00', title: 'Consulta Geral', patient: 'Maria Silva', color: '#c9954a' });
    add(5, { time: '10:00', title: 'Retorno', patient: 'João Santos', color: '#c9954a' });
    add(5, { time: '10:00', title: 'Emergência', patient: 'Ana Costa', color: '#ef4444' });
    add(12, { time: '14:30', title: 'Exame Rotina', patient: 'Carlos Lima', color: '#8b5cf6' });
    add(12, { time: '15:30', title: 'Acompanhamento', patient: 'Fernanda Rocha', color: '#c9954a' });
    add(18, { time: '08:00', title: 'Cirurgia', patient: 'Pedro Alves', color: '#ef4444' });
    add(18, { time: '11:00', title: 'Pós-operatório', patient: 'Lucia Mendes', color: '#c9954a' });
    add(22, { time: '16:00', title: 'Teleconsulta', patient: 'Rafael Torres', color: '#6366f1' });

    return m;
  }

  constructor() {
    afterNextRender(() => {
      const cells = document.querySelectorAll('.demo-agenda .day-cell:not(.other-month)');
      if (cells.length) {
        gsap.fromTo(cells,
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, stagger: 0.015, ease: 'back.out(1.7)' }
        );
      }
    });
  }

  private makeDay(year: number, month: number, dayNum: number, isCurrent: boolean, events: Map<string, AgendaEvent[]>): Day {
    const date = new Date(year, month, dayNum);
    const key = `${year}-${month}-${dayNum}`;
    const evs = events.get(key) || [];
    const isToday = date.toDateString() === this.today.toDateString();
    return {
      num: dayNum,
      dateStr: date.toLocaleDateString('pt-BR'),
      isToday,
      isCurrentMonth: isCurrent,
      events: evs,
      hasConflict: evs.length > 1,
    };
  }

  selectDay(day: Day) {
    this.selectedDay.set(day);
    afterNextRender(() => {
      const el = this.dayDetail()?.nativeElement;
      if (el) gsap.from(el, { opacity: 0, y: 10, duration: 0.35, ease: 'power2.out' });
    });
  }

  prevMonth() {
    const d = new Date(this.cursorDate());
    d.setMonth(d.getMonth() - 1);
    this.cursorDate.set(d);
    this.selectedDay.set(null);
  }

  nextMonth() {
    const d = new Date(this.cursorDate());
    d.setMonth(d.getMonth() + 1);
    this.cursorDate.set(d);
    this.selectedDay.set(null);
  }
}
