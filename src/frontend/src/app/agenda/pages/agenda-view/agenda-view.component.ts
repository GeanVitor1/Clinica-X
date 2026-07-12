import { Component, signal, computed, inject, OnInit, ElementRef, viewChild } from '@angular/core';
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

interface BatchItem {
  pacienteId: string;
  pacienteNome: string;
  servicoId: string;
  servicoNome: string;
  servicoCor: string;
  data: string;
  hora: string;
  observacao: string;
  profissional?: string;
  sala?: string;
  equipamento?: string;
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
        <button class="nav-btn" (click)="prev()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="current-period">{{ currentPeriodLabel() }}</span>
        <button class="nav-btn" (click)="next()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="calendar-card">
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                    [class.has-events]="day.slots.length > 0"
                    (click)="day.slots.length ? openDayDetail(day) : null"
                  >
                    <span class="day-num">{{ day.num }}</span>
                    @if (day.slots.length > 0) {
                      <div class="event-pips">
                        @for (s of day.slots.slice(0, 3); track s.hora + (s.agendamento?.id || '')) {
                          <span class="event-pip" [style.background]="s.agendamento?.cor || '#14b8a6'"></span>
                        }
                        @if (day.slots.length > 3) {
                          <span style="font-size:0.55rem;color:var(--clx-text-muted);font-weight:600;">+{{ day.slots.length - 3 }}</span>
                        }
                      </div>
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
        <div class="modal modal-xl" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
              </div>
              <div>
                <h2>Novo Agendamento</h2>
                <p class="modal-subtitle">Adicione um ou mais agendamentos</p>
              </div>
            </div>
            <button class="modal-close" (click)="showNewForm = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-section">
              <span class="section-label">Paciente</span>
              <div class="search-input-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  [value]="formPacienteSearch()"
                  (input)="onPacienteSearch($event)"
                  placeholder="Buscar paciente..."
                  autocomplete="off"
                />
                @if (formPacienteId) {
                  <button class="search-clear" (mousedown)="clearPaciente()" type="button">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                }
              </div>
              <div class="inline-list">
                @for (p of filteredPacientes(); track p.id) {
                  <button
                    class="inline-list-item"
                    [class.selected]="formPacienteId === p.id"
                    type="button"
                    (click)="selectPaciente(p)"
                  >
                    <div class="option-avatar">{{ p.nome.charAt(0) }}</div>
                    <div class="option-info">
                      <span class="option-name">{{ p.nome }}</span>
                      <span class="option-detail">{{ p.telefone }}</span>
                    </div>
                    @if (formPacienteId === p.id) {
                      <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    }
                  </button>
                }
                @if (filteredPacientes().length === 0) {
                  <div class="inline-list-empty">Nenhum paciente encontrado</div>
                }
              </div>
            </div>

            <div class="form-section">
              <span class="section-label">Serviços</span>
              <div class="servico-checkbox-list">
                @for (s of servicos(); track s.id) {
                  <label class="servico-checkbox" [class.selected]="selectedServicoIds.includes(s.id)">
                    <input
                      type="checkbox"
                      [checked]="selectedServicoIds.includes(s.id)"
                      (change)="toggleServico(s.id)"
                    />
                    <span class="servico-color-dot" [style.background]="s.cor"></span>
                    <div class="servico-info">
                      <span class="servico-name">{{ s.nome }}</span>
                      <span class="servico-detail">{{ s.duracaoMin }}min · R$ {{ s.valor }}</span>
                    </div>
                  </label>
                }
                @if (servicos().length === 0) {
                  <div class="inline-list-empty">Nenhum serviço cadastrado</div>
                }
              </div>
            </div>

            <div class="form-section">
              <span class="section-label">Data e Horário</span>
              <div class="field-row">
                <div class="field">
                  <label>Data *</label>
                  <div class="custom-date-input">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input
                      type="text"
                      [value]="formatDateDisplay(formData)"
                      (focus)="openDatePicker()"
                      readonly
                      class="date-display"
                    />
                    <input
                      #dateInputRef
                      type="date"
                      [value]="formData"
                      (change)="formData = $any($event.target).value"
                      class="date-hidden"
                    />
                  </div>
                </div>
                <div class="field">
                  <label>Horário *</label>
                  <div class="time-picker">
                    <button type="button" class="time-adj" (click)="adjustHour(-1)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <div class="time-display">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>{{ formHora }}</span>
                    </div>
                    <button type="button" class="time-adj" (click)="adjustHour(1)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <span class="section-label">Recursos (visão por profissional / sala / equipamento)</span>
              <div class="field-row">
                <div class="field">
                  <label>Profissional</label>
                  <input type="text" [(ngModel)]="formProfissional" name="profissional" placeholder="Ex.: Dra. Ana" />
                </div>
                <div class="field">
                  <label>Sala</label>
                  <input type="text" [(ngModel)]="formSala" name="sala" placeholder="Ex.: Sala 1" />
                </div>
                <div class="field">
                  <label>Equipamento</label>
                  <input type="text" [(ngModel)]="formEquipamento" name="equipamento" placeholder="Ex.: Laser" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <span class="section-label">Observação</span>
              <div class="field">
                <textarea [(ngModel)]="formObservacao" name="observacao" rows="2" placeholder="Opcional..."></textarea>
              </div>
            </div>

            <button class="btn-add-to-list" type="button" (click)="addToBatch()" [disabled]="!canAddToBatch()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar à lista
            </button>
          </div>

          @if (batch.length > 0) {
            <div class="batch-bar">
              <div class="batch-bar-left">
                <span class="batch-count">{{ batch.length }}</span>
                <span class="batch-label">horário(s) na fila</span>
              </div>
              <div class="batch-bar-actions">
                <button class="batch-clear" type="button" (click)="batch = []">Limpar tudo</button>
                <div class="batch-bar-items">
                  @for (item of batch; track $index) {
                    <span class="batch-pill">
                      <span class="batch-pill-dot" [style.background]="item.servicoCor"></span>
                      {{ item.pacienteNome }} · {{ item.data }} {{ item.hora }}
                      <button class="batch-pill-x" type="button" (click)="removeFromBatch($index)">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  }
                </div>
              </div>
            </div>
          }

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="showNewForm = false">
              Cancelar
            </button>
            <app-btn-submit
              [label]="batch.length > 0 ? 'Agendar ' + batch.length + ' horário(s)' : 'Agendar'"
              loadingLabel="Agendando..."
              doneLabel="Agendado!"
              [state]="saveState()"
              (click)="submitBatch()"
            />
          </div>
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

    @if (selectedDayDetail) {
      <div class="modal-backdrop" (click)="selectedDayDetail = null"></div>
      <div class="day-detail-modal" (click)="$event.stopPropagation()">
        <div class="detail-top">
          <strong>{{ selectedDayDetail.label }}</strong>
          <div class="detail-top-right">
            @if (selectedDayDetail.hasConflict) {
              <span class="conflict-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Conflito
              </span>
            }
            <button class="modal-close" (click)="selectedDayDetail = null">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="detail-events">
          @for (s of selectedDayDetail.slots; track s.hora + (s.agendamento?.id || '')) {
            @if (!s.livre && s.agendamento) {
              <div class="detail-event" [style.border-left-color]="s.agendamento.cor || '#14b8a6'">
                <span class="ev-time">{{ s.hora }}</span>
                <div class="ev-body">
                  <span class="ev-title">{{ s.agendamento.servicoNome }} · {{ s.agendamento.status }}</span>
                  <span class="ev-patient">{{ s.agendamento.pacienteNome }}
                    @if (s.agendamento.profissional) { · {{ s.agendamento.profissional }} }
                    @if (s.agendamento.sala) { · {{ s.agendamento.sala }} }
                  </span>
                  <div class="ev-actions">
                    @if (s.agendamento.status === 'Agendado') {
                      <button type="button" class="ev-btn" (click)="confirmarAgendamento(s.agendamento!.id)">Confirmar</button>
                    }
                    @if (s.agendamento.status === 'Agendado' || s.agendamento.status === 'Confirmado') {
                      <button type="button" class="ev-btn ok" (click)="realizarAgendamento(s.agendamento!.id)">Realizado</button>
                      <button type="button" class="ev-btn warn" (click)="faltaAgendamento(s.agendamento!.id)">Falta</button>
                      <button type="button" class="ev-btn danger" (click)="abrirCancelar(s.agendamento!.id)">Cancelar</button>
                    }
                  </div>
                </div>
              </div>
            }
          }
          @if (selectedDayDetail.slots.every(s => s.livre)) {
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:20px;color:var(--clx-text-muted);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style="font-size:0.78rem;">Nenhum agendamento</span>
            </div>
          }
        </div>
        <button class="btn-add-detail" (click)="selectedDayDetail = null; abrirNovoForm()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo horário
        </button>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }

      .page {
        max-width: 1200px;
        margin: 0 auto;
        --cal-accent: #c9954a;
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
        transition: all 0.2s;
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
        transition: all 0.2s;
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
        transition: all 0.2s;
      }
      .btn-danger:hover { background: #dc2626; }
      .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

      .view-controls {
        display: flex;
        padding: 3px;
        background: var(--clx-bg);
        border: 1px solid var(--clx-border);
        border-radius: 10px;
      }
      .view-controls button {
        padding: 5px 14px;
        border-radius: 7px;
        border: none;
        background: transparent;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        color: var(--clx-text-muted);
        transition: all 0.2s;
        font-family: var(--clx-font);
      }
      .view-controls button.active {
        background: var(--clx-accent);
        color: #fff;
        box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
      }

      .nav-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .nav-btn {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid var(--clx-border);
        background: var(--clx-bg);
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
      .current-period {
        font-weight: 700;
        color: var(--clx-text);
        min-width: 200px;
        text-align: center;
        font-size: 0.95rem;
      }

      .calendar-card {
        background: var(--clx-card-bg, var(--clx-surface-1));
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        padding: 18px;
        box-shadow: var(--clx-shadow-card);
      }

      /* ── Day View ── */
      .day-view {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .slot {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1.5px solid transparent;
        background: var(--clx-bg);
        transition: all 0.2s;
        min-height: 52px;
      }
      .slot.livre {
        border: 1.5px dashed var(--clx-border);
        opacity: 0.7;
      }
      .slot.livre:hover {
        border-color: var(--clx-accent);
        opacity: 1;
      }
      .slot.ocupado {
        cursor: grab;
        border-left: 3px solid var(--clx-accent);
        background: var(--clx-bg);
      }
      .slot.ocupado:active { cursor: grabbing; }
      .slot:hover {
        border-color: var(--clx-accent);
        background: rgba(20, 184, 166, 0.03);
      }

      .hora {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--clx-text-muted);
        min-width: 52px;
        font-variant-numeric: tabular-nums;
      }

      .badge-livre {
        font-size: 0.72rem;
        color: var(--clx-success);
        font-weight: 600;
        padding: 2px 8px;
        background: var(--clx-success-muted);
        border-radius: 10px;
      }

      .agendamento-info {
        display: flex;
        flex-direction: column;
        border-left: 3px solid;
        padding-left: 10px;
        flex: 1;
        min-width: 0;
      }
      .agendamento-info strong {
        color: var(--clx-text);
        font-size: 0.82rem;
        font-weight: 600;
      }
      .agendamento-info span {
        color: var(--clx-text-muted);
        font-size: 0.72rem;
      }

      .slot-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.78rem;
        color: var(--clx-text);
      }

      .btn-cancel-slot {
        margin-left: auto;
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 1px solid var(--clx-border);
        background: var(--clx-bg);
        color: var(--clx-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .btn-cancel-slot:hover {
        background: #ef4444;
        color: #fff;
        border-color: #ef4444;
      }
      .btn-cancel-slot--sm {
        width: 20px;
        height: 20px;
        font-size: 0.6rem;
      }

      /* ── Week View ── */
      .week-view {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .week-day {
        border: 1px solid var(--clx-border);
        border-radius: 12px;
        overflow: hidden;
        background: var(--clx-bg);
        min-width: 120px;
      }
      .day-header {
        padding: 10px 8px;
        text-align: center;
        font-size: 0.74rem;
        font-weight: 700;
        background: color-mix(in srgb, var(--clx-accent) 12%, var(--clx-surface-2));
        color: var(--clx-text);
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
        border-bottom: none;
        min-height: 44px;
      }
      .week-day .slot.ocupado {
        border-left: 3px solid var(--clx-accent);
      }

      /* ── Month View ── */
      .month-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-size: 0.72rem;
        color: var(--clx-text-muted);
        padding: 4px 0 6px;
        font-weight: 600;
      }
      .month-week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }
      .month-day {
        min-height: 72px;
        padding: 5px 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 3px;
        border-radius: 10px;
        cursor: pointer;
        position: relative;
        border: 1.5px solid transparent;
        background: var(--clx-bg);
        transition: border-color 0.2s, background 0.2s, transform 0.15s;
        font-size: 0.72rem;
      }
      .month-day:hover {
        border-color: var(--clx-accent);
        background: rgba(20, 184, 166, 0.04);
      }
      .month-day.other-month {
        opacity: 0.25;
      }

      .day-num {
        font-weight: 650;
        font-size: 0.78rem;
        color: var(--clx-text);
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
      .month-day.today {
        background: linear-gradient(135deg, #c9954a, #b8853a);
        animation: todayPulse 3s ease-in-out infinite;
      }
      .month-day.today .day-num {
        color: #fff;
      }
      @keyframes todayPulse {
        0%, 100% { box-shadow: 0 3px 12px rgba(201, 149, 74, 0.3); }
        50% { box-shadow: 0 3px 20px rgba(201, 149, 74, 0.55); }
      }

      .event-pips {
        display: flex;
        gap: 2px;
        align-items: center;
      }
      .event-pip {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        display: block;
      }

      .mini-event {
        padding: 2px 5px;
        border-radius: 6px;
        color: #fff;
        font-size: 0.6rem;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        font-weight: 600;
        transition: opacity 0.15s;
        width: 100%;
      }
      .mini-event:hover { opacity: 0.8; }

      /* ── Day Detail Modal (month view) ── */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        z-index: 2000;
        animation: backdropIn 0.25s ease-out;
      }
      @keyframes backdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .day-detail-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2001;
        width: 90%;
        max-width: 420px;
        background: var(--clx-bg-alt);
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        padding: 16px;
        animation: detailModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes detailModalIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
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
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 1px solid var(--clx-border);
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
        border-radius: 10px;
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
        max-height: 200px;
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
      .btn-add-detail {
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
      .btn-add-detail:hover {
        border-color: var(--clx-accent);
        background: rgba(20, 184, 166, 0.04);
      }

      /* ── Create / Cancel Modal ── */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .modal {
        background: var(--clx-surface-1);
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        padding: 0;
        width: 92%;
        max-width: 480px;
        box-shadow: 0 4px 16px rgba(0,0,0,.08), 0 0 0 1px rgba(255,255,255,.05) inset;
        animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
      }
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 22px 24px 0;
      }
      .modal-header-left {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .modal-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--clx-accent), color-mix(in srgb, var(--clx-accent) 70%, #000));
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .modal h2 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
        color: var(--clx-text);
        line-height: 1.2;
      }
      .modal-subtitle {
        font-size: 0.76rem;
        color: var(--clx-text-muted);
        margin: 2px 0 0;
      }
      .modal-close {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: 1px solid var(--clx-border);
        background: var(--clx-bg);
        color: var(--clx-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .modal-close:hover {
        background: #ef4444;
        color: #fff;
        border-color: #ef4444;
      }

      .agenda-form {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 20px 24px 24px;
      }

      .modal-body {
        padding: 0 24px;
        overflow-y: auto;
        max-height: 65vh;
      }

      .modal-footer {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        padding: 16px 24px;
        border-top: 1px solid var(--clx-border);
      }

      .modal-xl {
        max-width: 560px;
        width: 95%;
      }

      .form-section {
        padding: 14px 0;
        border-bottom: 1px solid var(--clx-border);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-section:last-of-type {
        border-bottom: none;
      }
      .section-label {
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--clx-text-muted);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
      }
      .field label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--clx-text-secondary);
      }
      .field textarea {
        padding: 9px 12px;
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        background: var(--clx-bg);
        color: var(--clx-text);
        font-size: 0.85rem;
        font-family: var(--clx-font);
        outline: none;
        transition: all 0.2s;
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
        min-height: 56px;
      }
      .field textarea::placeholder {
        color: var(--clx-text-muted);
      }
      .field textarea:focus {
        border-color: var(--clx-accent);
        box-shadow: 0 0 0 3px var(--clx-accent-muted);
      }
      .field-row {
        display: flex;
        gap: 10px;
      }

      /* ── Inline List (pacientes/serviços) ── */
      .inline-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 220px;
        overflow-y: auto;
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        background: var(--clx-bg);
      }
      .inline-list-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 10px;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition: background 0.12s;
        font-family: var(--clx-font);
        border-bottom: 1px solid color-mix(in srgb, var(--clx-border) 50%, transparent);
      }
      .inline-list-item:last-child {
        border-bottom: none;
      }
      .inline-list-item:hover {
        background: color-mix(in srgb, var(--clx-accent) 6%, transparent);
      }
      .inline-list-item.selected {
        background: color-mix(in srgb, var(--clx-accent) 10%, transparent);
      }
      .inline-list-item .option-avatar {
        width: 28px;
        height: 28px;
        font-size: 0.7rem;
      }
      .inline-list-item .option-color {
        width: 10px;
        height: 10px;
      }
      .check-icon {
        margin-left: auto;
        color: var(--clx-accent);
        flex-shrink: 0;
      }
      .inline-list-empty {
        padding: 20px;
        text-align: center;
        font-size: 0.78rem;
        color: var(--clx-text-muted);
      }

      .search-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        background: var(--clx-bg);
        transition: all 0.2s;
      }
      .search-input-wrapper:focus-within {
        border-color: var(--clx-accent);
        box-shadow: 0 0 0 3px var(--clx-accent-muted);
      }
      .search-input-wrapper svg {
        color: var(--clx-text-muted);
        flex-shrink: 0;
      }
      .search-input-wrapper input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 10px 0;
        color: var(--clx-text);
        font-size: 0.85rem;
        font-family: var(--clx-font);
        outline: none;
        min-width: 0;
      }
      .search-input-wrapper input::placeholder {
        color: var(--clx-text-muted);
      }
      .search-clear {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: var(--clx-border);
        color: var(--clx-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .search-clear:hover {
        background: #ef4444;
        color: #fff;
      }

      /* ── Search Dropdown (serviço) ── */
      .search-field {
        position: relative;
      }
      .search-field.open .search-input-wrapper {
        border-color: var(--clx-accent);
        box-shadow: 0 0 0 3px var(--clx-accent-muted);
      }
      .search-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: var(--clx-surface-1);
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,.08);
        z-index: 10;
        overflow: hidden;
        animation: dropdownIn 0.15s ease;
      }
      @keyframes dropdownIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .search-option {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition: background 0.12s;
        font-family: var(--clx-font);
      }
      .search-option:hover {
        background: color-mix(in srgb, var(--clx-accent) 8%, transparent);
      }

      .option-avatar {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--clx-accent), color-mix(in srgb, var(--clx-accent) 60%, #000));
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .option-color {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .option-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .option-name {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--clx-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .option-detail {
        font-size: 0.7rem;
        color: var(--clx-text-muted);
      }

      /* ── Custom Date Input ── */
      .custom-date-input {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        background: var(--clx-bg);
        transition: all 0.2s;
        cursor: pointer;
        overflow: hidden;
      }
      .custom-date-input:hover {
        border-color: color-mix(in srgb, var(--clx-accent) 50%, var(--clx-border));
      }
      .custom-date-input:focus-within {
        border-color: var(--clx-accent);
        box-shadow: 0 0 0 3px var(--clx-accent-muted);
      }
      .custom-date-input svg {
        color: var(--clx-text-muted);
        flex-shrink: 0;
        pointer-events: none;
      }
      .date-display {
        flex: 1;
        border: none !important;
        background: transparent !important;
        padding: 10px 0 !important;
        color: var(--clx-text) !important;
        font-size: 0.85rem !important;
        font-family: var(--clx-font) !important;
        outline: none !important;
        cursor: pointer;
        box-shadow: none !important;
        pointer-events: none;
      }
      .date-hidden {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
        z-index: 1;
      }

      /* ── Time Picker ── */
      .time-picker {
        display: flex;
        align-items: center;
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        background: var(--clx-bg);
        overflow: hidden;
        transition: all 0.2s;
      }
      .time-picker:hover {
        border-color: color-mix(in srgb, var(--clx-accent) 50%, var(--clx-border));
      }
      .time-picker:focus-within {
        border-color: var(--clx-accent);
        box-shadow: 0 0 0 3px var(--clx-accent-muted);
      }
      .time-adj {
        width: 34px;
        height: 38px;
        border: none;
        background: transparent;
        color: var(--clx-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .time-adj:hover {
        background: color-mix(in srgb, var(--clx-accent) 10%, transparent);
        color: var(--clx-accent);
      }
      .time-adj:active {
        transform: scale(0.9);
      }
      .time-display {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 4px;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--clx-text);
        font-variant-numeric: tabular-nums;
        user-select: none;
      }
      .time-display svg {
        color: var(--clx-text-muted);
      }

      /* ── Serviço Checkbox List ── */
      .servico-checkbox-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 240px;
        overflow-y: auto;
        border: 1px solid var(--clx-border);
        border-radius: 10px;
        background: var(--clx-bg);
      }
      .servico-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid color-mix(in srgb, var(--clx-border) 50%, transparent);
        transition: background 0.12s;
        user-select: none;
      }
      .servico-checkbox:last-child {
        border-bottom: none;
      }
      .servico-checkbox:hover {
        background: color-mix(in srgb, var(--clx-accent) 6%, transparent);
      }
      .servico-checkbox.selected {
        background: color-mix(in srgb, var(--clx-accent) 10%, transparent);
      }
      .servico-checkbox input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--clx-accent);
        cursor: pointer;
        flex-shrink: 0;
      }
      .servico-color-dot {
        width: 10px;
        height: 10px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .servico-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .servico-name {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--clx-text);
      }
      .servico-detail {
        font-size: 0.7rem;
        color: var(--clx-text-muted);
      }

      /* ── Add to List Button ── */
      .btn-add-to-list {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 10px;
        border: 1.5px dashed var(--clx-border);
        border-radius: 10px;
        background: transparent;
        color: var(--clx-accent);
        font-weight: 600;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.2s;
        margin: 12px 0;
        font-family: var(--clx-font);
      }
      .btn-add-to-list:hover:not(:disabled) {
        border-color: var(--clx-accent);
        background: rgba(20, 184, 166, 0.04);
      }
      .btn-add-to-list:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .btn-add-to-list {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 10px;
        border: 1.5px dashed var(--clx-border);
        border-radius: 10px;
        background: transparent;
        color: var(--clx-accent);
        font-weight: 600;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.2s;
        margin: 12px 0;
        font-family: var(--clx-font);
      }
      .btn-add-to-list:hover:not(:disabled) {
        border-color: var(--clx-accent);
        background: rgba(20, 184, 166, 0.04);
      }
      .btn-add-to-list:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── Batch Bar ── */
      .batch-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 24px;
        border-top: 1px solid var(--clx-border);
        background: color-mix(in srgb, var(--clx-accent) 4%, transparent);
        flex-wrap: wrap;
      }
      .batch-bar-left {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .batch-count {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: var(--clx-accent);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .batch-label {
        font-size: 0.78rem;
        color: var(--clx-text-secondary);
        font-weight: 500;
      }
      .batch-bar-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }
      .batch-clear {
        border: none;
        background: transparent;
        color: var(--clx-error);
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        font-family: var(--clx-font);
        transition: opacity 0.15s;
        flex-shrink: 0;
      }
      .batch-clear:hover { opacity: 0.7; }
      .batch-bar-items {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .batch-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        border-radius: 10px;
        background: var(--clx-bg);
        border: 1px solid var(--clx-border);
        font-size: 0.7rem;
        color: var(--clx-text-secondary);
        font-weight: 500;
        white-space: nowrap;
        animation: pillIn 0.2s ease;
      }
      @keyframes pillIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      .batch-pill-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .batch-pill-x {
        border: none;
        background: transparent;
        color: var(--clx-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0;
        transition: color 0.12s;
      }
      .batch-pill-x:hover { color: var(--clx-error); }

      @media (max-width: 768px) {
        .week-view {
          grid-template-columns: repeat(7, minmax(100px, 1fr));
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .page-header {
          flex-direction: column;
          align-items: stretch;
        }
        .nav-controls { flex-wrap: wrap; }
        .current-period { min-width: 0; flex: 1; text-align: left; font-size: 0.85rem; }
        .calendar-card { padding: 10px; }
        .modal { width: 95%; max-width: none; }
        .modal-header { padding: 16px 16px 0; }
        .modal-body { padding: 0 16px; max-height: 70vh; }
        .modal-footer { padding: 12px 16px; flex-direction: column; gap: 8px; }
        .modal-footer button { width: 100%; }
        .field-row { flex-direction: column; gap: 8px; }
        .batch-bar { padding: 10px 14px; }
        .batch-bar-left { width: 100%; }
      }
      @media (max-width: 480px) {
        .page { padding: 0; }
        .view-controls { width: 100%; }
        .view-controls button { flex: 1; padding: 6px 8px; font-size: 0.72rem; }
        .month-day { min-height: 48px; padding: 3px 2px; font-size: 0.65rem; }
        .day-num { width: 20px; height: 20px; font-size: 0.68rem; }
        .event-pip { width: 4px; height: 4px; }
        .week-day { min-width: 80px; }
        .day-header { padding: 6px 4px; font-size: 0.65rem; }
        .week-day .slot { padding: 4px; font-size: 0.65rem; min-height: 36px; }
        .slot { padding: 8px 10px; gap: 8px; }
        .hora { min-width: 40px; font-size: 0.75rem; }
        .day-detail-modal { width: 95%; max-width: 360px; padding: 12px; }
      }
      .ev-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .ev-btn {
        border: 1px solid var(--clx-border); background: var(--clx-bg-soft);
        border-radius: 8px; padding: 4px 8px; font-size: 0.68rem; font-weight: 600;
        cursor: pointer; color: var(--clx-text);
      }
      .ev-btn.ok { background: color-mix(in srgb, var(--clx-teal, #0d9488) 14%, transparent); color: #0d9488; border-color: transparent; }
      .ev-btn.warn { background: color-mix(in srgb, #d97706 14%, transparent); color: #b45309; border-color: transparent; }
      .ev-btn.danger { background: color-mix(in srgb, #e11d48 12%, transparent); color: #be123c; border-color: transparent; }
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
  selectedServicoIds: string[] = [];
  formData = '';
  formHora = '';
  formObservacao = '';
  formProfissional = '';
  formSala = '';
  formEquipamento = '';

  cancelAgendamentoId: string | null = null;
  cancelMotivo = '';

  formPacienteSearch = signal('');
  batch: BatchItem[] = [];

  readonly dateInputRef = viewChild<ElementRef>('dateInputRef');

  pacientes = signal<Paciente[]>([]);
  servicos = signal<Servico[]>([]);
  agendamentos = signal<Agendamento[]>([]);

  draggedSlot: { agendamento: Agendamento; hora: string } | null = null;

  selectedDayDetail: { label: string; slots: Slot[]; hasConflict: boolean } | null = null;

  ngOnInit() {
    // Carrega até 500 pacientes ativos para o seletor da agenda
    this.pacienteService.getAll('', 1, 500, true).subscribe({
      next: (r) => this.pacientes.set(r.items || []),
      error: () => this.pacientes.set([]),
    });
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

  filteredPacientes = computed(() => {
    const q = this.formPacienteSearch().toLowerCase().trim();
    if (!q) return this.pacientes();
    return this.pacientes().filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        (p.cpf || '').includes(q) ||
        (p.telefone || '').includes(q)
    );
  });

  private getAgendamentosPorData(date: Date): Agendamento[] {
    return this.agendamentos().filter((a) => {
      const d = new Date(a.dataHoraInicio);
      return d.toDateString() === date.toDateString() && a.status !== 'Cancelado';
    });
  }

  /** Slots de 30 em 30 min (08–18h) + horários reais dos agendamentos do dia */
  private getHoras(date?: Date): string[] {
    const base: string[] = [];
    for (let h = 8; h < 18; h++) {
      base.push(`${String(h).padStart(2, '0')}:00`);
      base.push(`${String(h).padStart(2, '0')}:30`);
    }
    if (date) {
      for (const a of this.getAgendamentosPorData(date)) {
        const d = new Date(a.dataHoraInicio);
        const key = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        if (!base.includes(key)) base.push(key);
      }
    }
    return base.sort();
  }

  private gerarSlots(date: Date): Slot[] {
    const agendamentos = this.getAgendamentosPorData(date);
    return this.getHoras(date).map((h) => {
      const ag = agendamentos.find((a) => {
        const d = new Date(a.dataHoraInicio);
        return (
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` === h
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

  openDayDetail(day: { date: string; num: number; otherMonth: boolean; today: boolean; slots: Slot[] }) {
    const date = new Date(day.date);
    const label = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    const occupied = day.slots.filter(s => !s.livre);
    this.selectedDayDetail = {
      label,
      slots: day.slots,
      hasConflict: occupied.length > 1,
    };
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
    this.selectedServicoIds = [];
    this.formPacienteSearch.set('');
    this.formData = new Date().toISOString().split('T')[0];
    this.formHora = '08:00';
    this.formObservacao = '';
    this.batch = [];
    this.saveState.set('idle');
    this.showNewForm = true;
  }

  onPacienteSearch(e: Event) {
    this.formPacienteSearch.set((e.target as HTMLInputElement).value);
    this.formPacienteId = '';
  }

  selectPaciente(p: Paciente) {
    this.formPacienteId = p.id;
    this.formPacienteSearch.set(p.nome);
  }

  toggleServico(servicoId: string) {
    if (this.selectedServicoIds.includes(servicoId)) {
      this.selectedServicoIds = this.selectedServicoIds.filter(id => id !== servicoId);
    } else {
      this.selectedServicoIds = [...this.selectedServicoIds, servicoId];
    }
  }

  clearPaciente() {
    this.formPacienteId = '';
    this.formPacienteSearch.set('');
  }

  adjustHour(delta: number) {
    const [h, m] = this.formHora.split(':').map(Number);
    const newH = Math.max(0, Math.min(23, h + delta));
    this.formHora = `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  openDatePicker() {
    const el = this.dateInputRef()?.nativeElement;
    el?.showPicker?.();
  }

  canAddToBatch(): boolean {
    return !!(this.formPacienteId && this.selectedServicoIds.length > 0 && this.formData && this.formHora);
  }

  addToBatch() {
    if (!this.canAddToBatch()) return;
    const paciente = this.pacientes().find(p => p.id === this.formPacienteId);
    if (!paciente) return;

    for (const servicoId of this.selectedServicoIds) {
      const servico = this.servicos().find(s => s.id === servicoId);
      if (!servico) continue;
      this.batch.push({
        pacienteId: this.formPacienteId,
        pacienteNome: paciente.nome,
        servicoId: servico.id,
        servicoNome: servico.nome,
        servicoCor: servico.cor,
        data: this.formData,
        hora: this.formHora,
        observacao: this.formObservacao,
        profissional: this.formProfissional || undefined,
        sala: this.formSala || undefined,
        equipamento: this.formEquipamento || undefined,
      });
    }

    this.formPacienteId = '';
    this.formPacienteSearch.set('');
    this.selectedServicoIds = [];
    this.formObservacao = '';
  }

  removeFromBatch(index: number) {
    this.batch.splice(index, 1);
  }

  submitBatch() {
    if (this.batch.length === 0) {
      if (!this.canAddToBatch()) return;
      this.addToBatch();
      if (this.batch.length === 0) return;
    }
    if (this.saveState() !== 'idle') return;
    this.saveState.set('loading');

    const requests = this.batch.map(item => {
      // Envia horário local sem conversão UTC (evita shift de fuso)
      const dataHoraInicio = `${item.data}T${item.hora}:00`;
      return this.agendamentoService.create({
        pacienteId: item.pacienteId,
        servicoId: item.servicoId,
        dataHoraInicio,
        observacao: item.observacao || null,
        profissional: item.profissional || null,
        sala: item.sala || null,
        equipamento: item.equipamento || null,
      });
    });

    let completed = 0;
    let errors = 0;
    const total = requests.length;

    requests.forEach(req => {
      req.subscribe({
        next: () => {
          completed++;
          if (completed + errors === total) {
            this.saveState.set('done');
            this.carregarAgendamentos();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            this.toast.show('success', `${total} agendamento(s) criado(s) com sucesso!`);
            setTimeout(() => {
              this.saveState.set('idle');
              this.showNewForm = false;
              this.batch = [];
              if (this.router.url.includes('/novo')) {
                void this.router.navigateByUrl('/agenda', { replaceUrl: true });
              }
            }, 1000);
          }
        },
        error: () => {
          errors++;
          if (completed + errors === total) {
            this.saveState.set('idle');
            this.toast.show('error', `Erro ao criar agendamento. ${completed} de ${total} criados.`);
          }
        },
      });
    });
  }

  confirmarAgendamento(id: string) {
    this.agendamentoService.confirmar(id).subscribe({
      next: () => {
        this.toast.show('success', 'Consulta confirmada. WhatsApp já registrado no histórico.');
        this.carregarAgendamentos();
      },
      error: (err) => this.toast.show('error', err?.error?.message || 'Falha ao confirmar'),
    });
  }

  realizarAgendamento(id: string) {
    this.agendamentoService.realizar(id).subscribe({
      next: () => {
        this.toast.show('success', 'Consulta realizada — receita e comissão geradas no financeiro; pós-consulta WhatsApp enviado.');
        this.carregarAgendamentos();
      },
      error: (err) => this.toast.show('error', err?.error?.message || 'Falha ao marcar realizado'),
    });
  }

  faltaAgendamento(id: string) {
    this.agendamentoService.falta(id).subscribe({
      next: () => {
        this.toast.show('warning', 'Falta registrada (no-show).');
        this.carregarAgendamentos();
      },
      error: (err) => this.toast.show('error', err?.error?.message || 'Falha ao registrar falta'),
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
