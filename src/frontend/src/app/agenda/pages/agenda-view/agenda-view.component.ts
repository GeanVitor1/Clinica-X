import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import confetti from 'canvas-confetti';
import {
  AgendamentoService,
  Agendamento,
  CreateAgendamentoRequest,
} from '../../services/agendamento.service';
import { PacienteService, Paciente } from '../../../pacientes/services/paciente.service';
import { ServicoService, Servico } from '../../../servicos/services/servico.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  BtnSubmitComponent,
  BtnSubmitState,
} from '../../../shared/components/btn-submit.component';

type ViewMode = 'day' | 'week' | 'month';

interface Slot {
  hora: string;
  date: Date;
  livre: boolean;
  agendamento?: Agendamento;
}

@Component({
  selector: 'app-agenda-view',
  standalone: true,
  imports: [FormsModule, BtnSubmitComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Agenda</h1>
        <div class="view-controls">
          <button [class.active]="view() === 'day'" (click)="view.set('day')">Dia</button>
          <button [class.active]="view() === 'week'" (click)="view.set('week')">Semana</button>
          <button [class.active]="view() === 'month'" (click)="view.set('month')">Mês</button>
        </div>
        <button class="btn-primary" (click)="abrirNovoForm()">+ Novo Agendamento</button>
      </header>

      <div class="nav-controls">
        <button (click)="prev()">←</button>
        <span class="current-period">{{ currentPeriodLabel() }}</span>
        <button (click)="next()">→</button>
      </div>

      @if (view() === 'day') {
        <div class="day-view">
          @for (slot of daySlots(); track slot.hora) {
            <div
              class="slot"
              [class.livre]="slot.livre"
              [class.ocupado]="!slot.livre"
              [attr.draggable]="!slot.livre"
              (dragstart)="onDragStart($event, slot)"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop($event, slot)"
            >
              <span class="hora">{{ slot.hora }}</span>
              @if (slot.livre) {
                <span class="badge-livre">Livre</span>
              } @else {
                <div
                  class="agendamento-info"
                  [style.border-left-color]="slot.agendamento?.cor || '#14b8a6'"
                >
                  <strong>{{ slot.agendamento?.pacienteNome }}</strong>
                  <span>{{ slot.agendamento?.servicoNome }}</span>
                </div>
                <button
                  type="button"
                  class="btn-cancel-slot"
                  (click)="abrirCancelar(slot.agendamento!.id); $event.stopPropagation()"
                  title="Cancelar agendamento"
                >
                  ✕
                </button>
              }
            </div>
          }
        </div>
      }

      @if (view() === 'week') {
        <div class="week-view">
          @for (day of weekDays(); track day.date) {
            <div class="week-day">
              <div class="day-header">{{ day.label }}</div>
              @for (slot of day.slots; track slot.hora) {
                <div
                  class="slot"
                  [class.livre]="slot.livre"
                  [class.ocupado]="!slot.livre"
                  [attr.draggable]="!slot.livre"
                  (dragstart)="onDragStart($event, slot)"
                  (dragover)="$event.preventDefault()"
                  (drop)="onDrop($event, slot)"
                >
                  <span class="hora">{{ slot.hora }}</span>
                  @if (slot.livre) {
                    <span class="badge-livre">Livre</span>
                  } @else {
                    <span class="slot-name">{{ slot.agendamento?.pacienteNome }}</span>
                    <button
                      type="button"
                      class="btn-cancel-slot btn-cancel-slot--sm"
                      (click)="abrirCancelar(slot.agendamento!.id); $event.stopPropagation()"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      @if (view() === 'month') {
        <div class="month-view">
          <div class="month-header">
            @for (d of ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; track d) {
              <span>{{ d }}</span>
            }
          </div>
          @for (week of monthWeeks(); track week[0]?.date) {
            <div class="month-week">
              @for (day of week; track day.date) {
                <div
                  class="month-day"
                  [class.other-month]="day.otherMonth"
                  [class.today]="day.today"
                >
                  <span class="day-num">{{ day.num }}</span>
                  @for (s of day.slots; track s.hora + (s.agendamento?.id || '')) {
                    @if (!s.livre) {
                      <div
                        class="mini-event"
                        [style.background]="s.agendamento?.cor || '#14b8a6'"
                        (click)="abrirCancelar(s.agendamento!.id)"
                        title="Clique para cancelar"
                      >
                        {{ s.agendamento?.pacienteNome }}
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    @if (showNewForm) {
      <div class="modal-overlay" (click)="showNewForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Novo Agendamento</h2>
          <form (ngSubmit)="createAgendamento()" class="agenda-form">
            <div class="field">
              <label>Paciente *</label>
              <select [(ngModel)]="formPacienteId" name="paciente" required>
                <option value="">Selecione...</option>
                @for (p of pacientes(); track p.id) {
                  <option [value]="p.id">{{ p.nome }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label>Serviço *</label>
              <select [(ngModel)]="formServicoId" name="servico" required>
                <option value="">Selecione...</option>
                @for (s of servicos(); track s.id) {
                  <option [value]="s.id">{{ s.nome }} ({{ s.duracaoMin }}min)</option>
                }
              </select>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Data *</label>
                <input [(ngModel)]="formData" name="data" type="date" required />
              </div>
              <div class="field">
                <label>Horário *</label>
                <input [(ngModel)]="formHora" name="hora" type="time" required />
              </div>
            </div>
            <div class="field">
              <label>Observação</label>
              <textarea [(ngModel)]="formObservacao" name="observacao" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="showNewForm = false">
                Voltar
              </button>
              <app-btn-submit
                label="Agendar"
                loadingLabel="Agendando..."
                doneLabel="Agendado!"
                [state]="saveState()"
              />
            </div>
          </form>
        </div>
      </div>
    }

    @if (showCancelForm) {
      <div class="modal-overlay" (click)="showCancelForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Cancelar Agendamento</h2>
          <form (ngSubmit)="confirmarCancelamento()" class="agenda-form">
            <div class="field">
              <label>Motivo do cancelamento *</label>
              <textarea [(ngModel)]="cancelMotivo" name="motivo" required rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="showCancelForm = false">
                Voltar
              </button>
              <button type="submit" class="btn-danger" [disabled]="!cancelMotivo.trim()">
                Confirmar Cancelamento
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 14px;
        margin-bottom: 16px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 750;
        color: var(--clx-text-primary);
        letter-spacing: -0.02em;
      }

      .btn-primary {
        padding: 9px 18px;
        background: var(--clx-accent);
        color: #fff;
        border: none;
        border-radius: var(--clx-radius-md);
        font-weight: 600;
        font-size: 0.84rem;
        cursor: pointer;
        font-family: var(--clx-font);
        transition: all var(--clx-transition-fast);
      }
      .btn-primary:hover {
        background: var(--clx-accent-hover);
        box-shadow: var(--clx-shadow-glow);
        transform: translateY(-1px);
      }

      .btn-secondary {
        padding: 9px 18px;
        background: transparent;
        color: var(--clx-text-secondary);
        border: 1px solid var(--clx-border-strong);
        border-radius: var(--clx-radius-md);
        cursor: pointer;
        font-size: 0.84rem;
        font-weight: 500;
        font-family: var(--clx-font);
        transition: all var(--clx-transition-fast);
      }
      .btn-secondary:hover {
        border-color: var(--clx-text-tertiary);
        color: var(--clx-text-primary);
      }

      .btn-danger {
        padding: 9px 18px;
        background: var(--clx-error);
        color: #fff;
        border: none;
        border-radius: var(--clx-radius-md);
        font-weight: 600;
        font-size: 0.84rem;
        cursor: pointer;
        font-family: var(--clx-font);
        transition: all var(--clx-transition-fast);
      }
      .btn-danger:hover {
        background: #dc2626;
      }
      .btn-danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .view-controls {
        display: flex;
        gap: 2px;
        background: var(--clx-surface-3);
        border-radius: var(--clx-radius-md);
        padding: 3px;
      }
      .view-controls button {
        padding: 7px 16px;
        border: none;
        border-radius: var(--clx-radius-sm);
        background: transparent;
        color: var(--clx-text-secondary);
        cursor: pointer;
        font-size: 0.82rem;
        font-weight: 500;
        font-family: var(--clx-font);
        transition: all var(--clx-transition-fast);
      }
      .view-controls button.active {
        background: var(--clx-accent);
        color: #fff;
      }

      .nav-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .nav-controls button {
        padding: 7px 10px;
        border: 1px solid var(--clx-border-strong);
        border-radius: var(--clx-radius-sm);
        background: var(--clx-surface-1);
        cursor: pointer;
        color: var(--clx-text-secondary);
        font-family: var(--clx-font);
        font-size: 0.9rem;
        transition: all var(--clx-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nav-controls button:hover {
        border-color: var(--clx-accent);
        color: var(--clx-accent);
      }
      .current-period {
        font-weight: 650;
        color: var(--clx-text-primary);
        min-width: 200px;
        text-align: center;
        font-size: 0.9rem;
      }

      .day-view {
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: var(--clx-card-bg, var(--clx-surface-1));
        border: 1px solid var(--clx-border);
        border-radius: var(--clx-radius-xl);
        padding: 12px;
        box-shadow: var(--clx-shadow-card);
      }
      .slot {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: var(--clx-radius-md);
        border: 1px solid var(--clx-border);
        background: color-mix(in srgb, var(--clx-surface-1) 80%, #fff);
        transition: all var(--clx-transition-fast);
        min-height: 52px;
      }
      .slot.livre {
        border-style: dashed;
        opacity: 0.85;
      }
      .slot.ocupado {
        cursor: grab;
        border-left: 3px solid var(--clx-accent);
        background: color-mix(in srgb, var(--clx-surface-1) 60%, #fff);
        box-shadow: 0 2px 8px rgba(20, 42, 85, 0.08);
      }
      .slot.ocupado:active {
        cursor: grabbing;
      }
      .slot:hover {
        border-color: color-mix(in srgb, var(--clx-accent) 40%, var(--clx-border));
        transform: translateY(-1px);
      }

      .hora {
        font-size: 0.84rem;
        font-weight: 700;
        color: var(--clx-text-secondary);
        min-width: 52px;
        font-variant-numeric: tabular-nums;
      }

      .badge-livre {
        font-size: 0.72rem;
        color: var(--clx-success);
        font-weight: 600;
        padding: 2px 8px;
        background: var(--clx-success-muted);
        border-radius: var(--clx-radius-full);
      }

      .agendamento-info {
        display: flex;
        flex-direction: column;
        border-left: 3px solid;
        padding-left: 10px;
        font-size: 0.84rem;
        flex: 1;
        min-width: 0;
      }

      .agendamento-info strong {
        color: var(--clx-text-primary);
        font-size: 0.82rem;
      }
      .agendamento-info span {
        color: var(--clx-text-secondary);
        font-size: 0.74rem;
      }

      .slot-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.78rem;
      }

      .btn-cancel-slot {
        margin-left: auto;
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border: none;
        border-radius: var(--clx-radius-xs);
        background: var(--clx-error-muted);
        color: var(--clx-error);
        font-size: 0.7rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--clx-transition-fast);
      }
      .btn-cancel-slot:hover {
        background: var(--clx-error);
        color: #fff;
      }
      .btn-cancel-slot--sm {
        width: 20px;
        height: 20px;
        font-size: 0.6rem;
      }

      .week-view {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .week-day {
        border: 1px solid var(--clx-border);
        border-radius: var(--clx-radius-lg);
        overflow: hidden;
        background: var(--clx-card-bg, var(--clx-surface-1));
        box-shadow: var(--clx-shadow-xs);
        min-width: 120px;
      }
      .day-header {
        padding: 10px 8px;
        text-align: center;
        font-size: 0.74rem;
        font-weight: 700;
        background: color-mix(in srgb, var(--clx-accent) 12%, var(--clx-surface-2));
        color: var(--clx-text-primary);
        border-bottom: 1px solid var(--clx-border);
      }
      .week-day .slot {
        padding: 8px;
        font-size: 0.72rem;
        gap: 4px;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-top: none;
        min-height: 44px;
      }
      .week-day .slot.ocupado {
        border-left: 3px solid var(--clx-accent);
      }

      .month-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-size: 0.74rem;
        color: var(--clx-text-tertiary);
        padding: 8px 0;
        font-weight: 600;
      }
      .month-week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-top: 1px solid var(--clx-border);
      }
      .month-day {
        min-height: 92px;
        padding: 6px;
        border-right: 1px solid var(--clx-border);
        font-size: 0.74rem;
        background: color-mix(in srgb, var(--clx-surface-1) 70%, #fff);
      }
      .month-day:nth-child(7n) {
        border-right: none;
      }
      .month-day.other-month {
        opacity: 0.25;
      }

      .day-num {
        font-weight: 600;
        color: var(--clx-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-bottom: 2px;
      }
      .month-day.today .day-num {
        background: var(--clx-accent);
        color: #fff;
        border-radius: 50%;
      }

      .mini-event {
        padding: 2px 5px;
        border-radius: var(--clx-radius-xs);
        color: #fff;
        font-size: 0.62rem;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        font-weight: 500;
        transition: opacity var(--clx-transition-fast);
      }
      .mini-event:hover {
        opacity: 0.8;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.15s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal {
        background: var(--clx-surface-1);
        border: 1px solid var(--clx-border-strong);
        border-radius: var(--clx-radius-xl);
        padding: 28px;
        width: 90%;
        max-width: 500px;
        box-shadow: var(--clx-shadow-xl);
        animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes modalIn {
        from {
          opacity: 0;
          transform: scale(0.96) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .modal h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 24px;
        color: var(--clx-text-primary);
      }

      .agenda-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
      }
      .field label {
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--clx-text-secondary);
      }
      .field input,
      .field select,
      .field textarea {
        padding: 9px 12px;
        border: 1px solid var(--clx-border-strong);
        border-radius: var(--clx-radius-sm);
        background: var(--clx-surface-2);
        color: var(--clx-text-primary);
        font-size: 0.88rem;
        font-family: var(--clx-font);
        outline: none;
        transition: all var(--clx-transition-fast);
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        border-color: var(--clx-accent);
        box-shadow: 0 0 0 3px var(--clx-accent-muted);
      }
      .field-row {
        display: flex;
        gap: 12px;
      }
      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 8px;
      }

      @media (max-width: 768px) {
        .week-view {
          grid-template-columns: repeat(7, minmax(100px, 1fr));
          overflow-x: auto;
        }
        .month-day {
          min-height: 55px;
        }
        .page-header {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
})
export class AgendaViewComponent implements OnInit {
  private router = inject(Router);
  private agendamentoService = inject(AgendamentoService);
  private pacienteService = inject(PacienteService);
  private servicoService = inject(ServicoService);
  private toast = inject(ToastService);

  view = signal<ViewMode>('week');
  currentDate = signal(new Date());
  showNewForm = false;
  showCancelForm = false;
  saveState = signal<BtnSubmitState>('idle');

  formPacienteId = '';
  formServicoId = '';
  formData = '';
  formHora = '';
  formObservacao = '';

  cancelAgendamentoId: string | null = null;
  cancelMotivo = '';

  pacientes = signal<Paciente[]>([]);
  servicos = signal<Servico[]>([]);
  agendamentos = signal<Agendamento[]>([]);

  draggedSlot: { agendamento: Agendamento; hora: string } | null = null;

  ngOnInit() {
    this.pacienteService.getAll().subscribe({ next: (r) => this.pacientes.set(r.items) });
    this.servicoService.getAll().subscribe({ next: (r) => this.servicos.set(r) });
    this.carregarAgendamentos();
    if (this.router.url.includes('/novo')) {
      this.abrirNovoForm();
    }
  }

  private carregarAgendamentos() {
    const hoje = new Date(this.currentDate());
    const start = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);
    this.agendamentoService.getAll(start.toISOString(), end.toISOString()).subscribe({
      next: (data) => this.agendamentos.set(data),
      error: () => this.agendamentos.set([]),
    });
  }

  currentPeriodLabel = computed(() => {
    const d = this.currentDate();
    switch (this.view()) {
      case 'day':
        return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      case 'week':
        return `Semana de ${d.toLocaleDateString('pt-BR', { day: 'numeric' })}`;
      case 'month':
        return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  });

  private getAgendamentosPorData(date: Date): Agendamento[] {
    return this.agendamentos().filter((a) => {
      const d = new Date(a.dataHoraInicio);
      return d.toDateString() === date.toDateString() && a.status !== 'Cancelado';
    });
  }

  private getHoras(): string[] {
    return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }

  private gerarSlots(date: Date): Slot[] {
    const agendamentos = this.getAgendamentosPorData(date);
    return this.getHoras().map((h) => {
      const ag = agendamentos.find((a) => {
        const d = new Date(a.dataHoraInicio);
        return (
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` ===
          h
        );
      });
      return { hora: h, date: new Date(date), livre: !ag, agendamento: ag };
    });
  }

  daySlots = computed(() => this.gerarSlots(this.currentDate()));

  weekDays = computed(() => {
    const start = new Date(this.currentDate());
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        date: d.toISOString(),
        label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
        slots: this.gerarSlots(d),
      };
    });
  });

  monthWeeks = computed(() => {
    const d = new Date(this.currentDate().getFullYear(), this.currentDate().getMonth(), 1);
    const weeks: {
      date: string;
      num: number;
      otherMonth: boolean;
      today: boolean;
      slots: Slot[];
    }[][] = [];
    let week: (typeof weeks)[0] = [];
    const startPad = d.getDay();
    for (let i = 0; i < startPad; i++) {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - (startPad - i));
      week.push({
        date: prev.toISOString(),
        num: prev.getDate(),
        otherMonth: true,
        today: false,
        slots: [],
      });
    }
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(d.getFullYear(), d.getMonth(), i);
      week.push({
        date: date.toISOString(),
        num: i,
        otherMonth: false,
        today: date.toDateString() === today.toDateString(),
        slots: this.gerarSlots(date).filter((s) => !s.livre),
      });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) weeks.push(week);
    return weeks;
  });

  prev() {
    const d = new Date(this.currentDate());
    switch (this.view()) {
      case 'day':
        d.setDate(d.getDate() - 1);
        break;
      case 'week':
        d.setDate(d.getDate() - 7);
        break;
      case 'month':
        d.setMonth(d.getMonth() - 1);
        break;
    }
    this.currentDate.set(d);
    this.carregarAgendamentos();
  }

  next() {
    const d = new Date(this.currentDate());
    switch (this.view()) {
      case 'day':
        d.setDate(d.getDate() + 1);
        break;
      case 'week':
        d.setDate(d.getDate() + 7);
        break;
      case 'month':
        d.setMonth(d.getMonth() + 1);
        break;
    }
    this.currentDate.set(d);
    this.carregarAgendamentos();
  }

  onDragStart(e: DragEvent, slot: Slot) {
    if (slot.livre || !slot.agendamento) {
      e.preventDefault();
      return;
    }
    this.draggedSlot = {
      agendamento: slot.agendamento,
      hora: slot.hora,
    };
    e.dataTransfer?.setData('text/plain', slot.agendamento.id);
  }

  onDrop(e: DragEvent, targetSlot: Slot) {
    e.preventDefault();
    if (!this.draggedSlot || !targetSlot.livre) {
      this.draggedSlot = null;
      return;
    }

    const [h, m] = targetSlot.hora.split(':').map(Number);
    // Usa a data do slot de destino (dia/semana), não currentDate sozinho
    const novaData = new Date(targetSlot.date);
    novaData.setHours(h, m, 0, 0);

    if (
      this.draggedSlot.agendamento.id &&
      new Date(this.draggedSlot.agendamento.dataHoraInicio).getTime() === novaData.getTime()
    ) {
      this.draggedSlot = null;
      return;
    }

    this.agendamentoService
      .remarcar(this.draggedSlot.agendamento.id, {
        dataHoraInicio: novaData.toISOString(),
      })
      .subscribe({
        next: () => {
          this.draggedSlot = null;
          this.toast.show('success', 'Agendamento remarcado com sucesso!');
          this.carregarAgendamentos();
        },
        error: () => {
          this.draggedSlot = null;
          this.toast.show('error', 'Erro ao remarcar agendamento.');
        },
      });
  }

  abrirNovoForm() {
    this.formPacienteId = '';
    this.formServicoId = '';
    this.formData = new Date().toISOString().split('T')[0];
    this.formHora = '08:00';
    this.formObservacao = '';
    this.saveState.set('idle');
    this.showNewForm = true;
  }

  createAgendamento() {
    if (!this.formPacienteId || !this.formServicoId || !this.formData || !this.formHora) return;
    if (this.saveState() !== 'idle') return;
    this.saveState.set('loading');
    const dataHora = new Date(`${this.formData}T${this.formHora}:00`);
    const request: CreateAgendamentoRequest = {
      pacienteId: this.formPacienteId,
      servicoId: this.formServicoId,
      dataHoraInicio: dataHora.toISOString(),
      observacao: this.formObservacao || null,
    };
    this.agendamentoService.create(request).subscribe({
      next: () => {
        this.saveState.set('done');
        this.carregarAgendamentos();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        this.toast.show('success', 'Agendamento criado com sucesso!');
        setTimeout(() => {
          this.saveState.set('idle');
          this.showNewForm = false;
          if (this.router.url.includes('/novo')) {
            void this.router.navigateByUrl('/agenda', { replaceUrl: true });
          }
        }, 1000);
      },
      error: () => {
        this.saveState.set('idle');
        this.toast.show('error', 'Erro ao criar agendamento.');
      },
    });
  }

  abrirCancelar(agendamentoId: string) {
    this.cancelAgendamentoId = agendamentoId;
    this.cancelMotivo = '';
    this.showCancelForm = true;
  }

  confirmarCancelamento() {
    if (!this.cancelAgendamentoId || !this.cancelMotivo.trim()) return;
    this.agendamentoService
      .cancelar(this.cancelAgendamentoId, { motivoCancelamento: this.cancelMotivo.trim() })
      .subscribe({
        next: () => {
          this.showCancelForm = false;
          this.cancelAgendamentoId = null;
          this.carregarAgendamentos();
          this.toast.show('info', 'Agendamento cancelado.');
        },
        error: () => this.toast.show('error', 'Erro ao cancelar agendamento.'),
      });
  }
}
