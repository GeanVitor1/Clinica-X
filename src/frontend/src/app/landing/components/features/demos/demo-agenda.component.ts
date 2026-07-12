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
      <div class="demo-cursor" [class.show]="cursorVisible()">
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
          <defs>
            <filter id="calCursorShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-opacity="0.35"/>
            </filter>
          </defs>
          <path d="M2 2L2 19L6.5 14.5L9.5 21L12 20L9 13.5L16 13.5L2 2Z" fill="#222" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" filter="url(#calCursorShadow)"/>
        </svg>
      </div>
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

      <div class="cal-grid" #calGrid>
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
        <div class="modal-backdrop"></div>
        <div class="day-detail day-modal" #dayDetail>
          <div class="detail-top">
            <strong>{{ day.dateStr }}</strong>
            <div class="detail-top-right">
              @if (day.hasConflict) {
                <span class="conflict-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Conflito
                </span>
              }
              <button class="modal-close" #modalClose>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
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
    :host { display: block; width: 100%; }
    .demo-agenda {
      --cal-accent: #c9954a;
      --cal-bg: var(--clx-bg);
      --cal-border: var(--clx-border);
      font-size: 0.82rem;
      position: relative;
    }

    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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
      margin-bottom: 0;
    }
    .day-name {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--clx-text-muted);
      padding: 4px 0 6px;
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
      transition: border-color 0.2s, background 0.2s, transform 0.15s;
      opacity: 0;
    }
    .day-cell.visible {
      opacity: 1;
    }
    .day-cell:hover {
      border-color: var(--clx-accent);
      background: rgba(20, 184, 166, 0.04);
    }
    .day-cell.today {
      background: linear-gradient(135deg, #c9954a, #b8853a);
      color: #fff;
      animation: todayPulse 3s ease-in-out infinite;
    }
    .day-cell.today .day-num { color: #fff; }
    @keyframes todayPulse {
      0%, 100% { box-shadow: 0 3px 12px rgba(201, 149, 74, 0.3); }
      50% { box-shadow: 0 3px 20px rgba(201, 149, 74, 0.55); }
    }
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
      animation: pipPop 2s ease-in-out infinite;
    }
    .event-pip:nth-child(2) { animation-delay: 0.3s; }
    .event-pip:nth-child(3) { animation-delay: 0.6s; }
    @keyframes pipPop {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.4); }
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
      animation: detailIn 0.3s ease-out;
    }
    @keyframes detailIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
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
    .detail-top-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .modal-close {
      width: 26px; height: 26px;
      border-radius: 8px;
      border: 1px solid var(--cal-border);
      background: var(--clx-bg);
      color: var(--clx-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .modal-close:hover {
      background: #ef4444;
      color: #fff;
      border-color: #ef4444;
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
      animation: conflictBlink 1.5s ease-in-out infinite;
    }
    @keyframes conflictBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
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
      animation: eventSlide 0.3s ease-out backwards;
    }
    .detail-event:nth-child(1) { animation-delay: 0.05s; }
    .detail-event:nth-child(2) { animation-delay: 0.1s; }
    .detail-event:nth-child(3) { animation-delay: 0.15s; }
    @keyframes eventSlide {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
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

    /* Cursor */
    .demo-cursor {
      position: absolute;
      z-index: 20;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -10%);
      transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s;
    }
    .demo-cursor.show {
      opacity: 1;
    }
    .day-cell.cursor-click {
      transform: scale(0.85);
      border-color: var(--clx-accent);
      transition: transform 0.12s ease;
    }

    /* Modal */
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.35);
      border-radius: 14px;
      z-index: 15;
      animation: backdropIn 0.25s ease-out;
    }
    @keyframes backdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .day-modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 16;
      width: 85%;
      max-height: 80%;
      overflow-y: auto;
      animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `],
})
export class DemoAgendaComponent {
  readonly containerRef = viewChild<ElementRef>('container');
  readonly calGrid = viewChild<ElementRef>('calGrid');
  readonly dayDetail = viewChild<ElementRef>('dayDetail');
  readonly modalClose = viewChild<ElementRef>('modalClose');

  readonly views = ['Dia', 'Semana', 'Mês'] as const;
  readonly currentView = signal<'Dia' | 'Semana' | 'Mês'>('Mês');
  readonly today = new Date();
  readonly cursorDate = signal(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
  readonly selectedDay = signal<Day | null>(null);
  readonly cursorVisible = signal(false);

  readonly dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  private started = false;

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

  private wait(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }

  private async loop() {
    const curMonth = this.today.getMonth();
    const curYear = this.today.getFullYear();

    while (true) {
      this.cursorVisible.set(false);
      this.cursorDate.set(new Date(curYear, curMonth, 1));
      this.selectedDay.set(null);
      await this.wait(200);

      this.animateCells();
      await this.wait(1000);

      await this.clickDay(5);
      await this.wait(2000);

      await this.clickClose();
      await this.wait(600);

      await this.clickNav('next');
      await this.wait(200);

      this.animateCells();
      await this.wait(1000);

      await this.clickDay(12);
      await this.wait(2000);

      await this.clickClose();
      await this.wait(600);

      await this.clickNav('prev');
      await this.wait(200);
    }
  }

  private async clickDay(dayNum: number) {
    const day = this.days().find(d => d.num === dayNum && d.isCurrentMonth);
    if (!day) return;

    const container = this.containerRef()?.nativeElement;
    const cells = container?.querySelectorAll('.day-cell:not(.other-month)') as NodeListOf<HTMLElement> | undefined;
    if (!cells) return;

    let targetCell: HTMLElement | undefined;
    cells.forEach(c => {
      if (c.querySelector('.day-num')?.textContent?.trim() === String(dayNum)) targetCell = c;
    });
    if (!targetCell || !container) return;

    const gridRect = container.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();
    const x = cellRect.left - gridRect.left + cellRect.width / 2;
    const y = cellRect.top - gridRect.top + cellRect.height / 2;

    this.moveCursor(container, x, y);
    await this.wait(500);

    targetCell.style.transition = 'transform 0.15s ease';
    targetCell.style.transform = 'scale(0.85)';
    await this.wait(150);
    targetCell.style.transform = 'scale(1)';

    this.selectedDay.set(day);
    await this.wait(100);
  }

  private async clickClose() {
    const container = this.containerRef()?.nativeElement;
    const closeBtn = container?.querySelector('.modal-close') as HTMLElement | null;
    if (!closeBtn || !container) return;

    const gridRect = container.getBoundingClientRect();
    const btnRect = closeBtn.getBoundingClientRect();
    const x = btnRect.left - gridRect.left + btnRect.width / 2;
    const y = btnRect.top - gridRect.top + btnRect.height / 2;

    this.moveCursor(container, x, y);
    await this.wait(500);

    closeBtn.style.transition = 'transform 0.12s ease';
    closeBtn.style.transform = 'scale(0.7)';
    await this.wait(120);
    closeBtn.style.transform = 'scale(1)';

    this.selectedDay.set(null);
    await this.wait(100);
    this.cursorVisible.set(false);
  }

  private async clickNav(dir: 'next' | 'prev') {
    const container = this.containerRef()?.nativeElement;
    const btns = container?.querySelectorAll('.nav-btn') as NodeListOf<HTMLElement> | undefined;
    if (!btns || btns.length < 2 || !container) return;

    const targetBtn = btns[dir === 'next' ? 1 : 0] as HTMLElement;
    const gridRect = container.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();
    const x = btnRect.left - gridRect.left + btnRect.width / 2;
    const y = btnRect.top - gridRect.top + btnRect.height / 2;

    this.moveCursor(container, x, y);
    await this.wait(500);

    targetBtn.style.transition = 'transform 0.12s ease';
    targetBtn.style.transform = 'scale(0.8)';
    await this.wait(120);
    targetBtn.style.transform = 'scale(1)';

    if (dir === 'next') this.nextMonth();
    else this.prevMonth();

    await this.wait(100);
    this.cursorVisible.set(false);
  }

  private moveCursor(container: HTMLElement, x: number, y: number) {
    const cursorEl = container.querySelector('.demo-cursor') as HTMLElement | null;
    if (!cursorEl) return;
    cursorEl.style.left = x + 'px';
    cursorEl.style.top = y + 'px';
    this.cursorVisible.set(true);
  }

  private animateCells() {
    const cells = document.querySelectorAll('.demo-agenda .day-cell:not(.other-month)');
    if (!cells.length) return;
    cells.forEach(c => c.classList.remove('visible'));
    gsap.fromTo(cells,
      { scale: 0.7, opacity: 0 },
      {
        scale: 1, opacity: 1, duration: 0.3,
        stagger: { each: 0.018, grid: [6, 7], from: 'start' },
        ease: 'back.out(1.4)',
        onComplete: () => cells.forEach(c => c.classList.add('visible'))
      }
    );
  }

  selectDay(day: Day) {
    this.selectedDay.set(day);
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
