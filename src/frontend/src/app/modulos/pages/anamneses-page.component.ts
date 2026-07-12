import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PacienteService } from '../../pacientes/services/paciente.service';

interface AnamneseItem {
  id: string;
  titulo: string;
  data: string;
  queixaPrincipal: string;
  alergias: string;
  historicoMedico?: string;
  medicamentosUso?: string;
  habitos?: string;
  observacoes?: string;
  pacienteNome?: string;
}

@Component({
  selector: 'app-anamneses-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Fichas de anamnese</h1>
          <span class="header-subtitle">Histórico clínico estruturado por paciente</span>
        </div>
        <div class="header-actions">
          <button class="btn-primary" type="button" (click)="toggleForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ showForm ? 'Fechar' : 'Nova ficha' }}
          </button>
        </div>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--total">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Total</span>
            <span class="kpi-value">{{ items().length }}</span>
            <span class="kpi-sub">fichas cadastradas</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--today">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Este mês</span>
            <span class="kpi-value">{{ thisMes() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--patients">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Pacientes</span>
            <span class="kpi-value">{{ totalPacientes() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--latest">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Última ficha</span>
            <span class="kpi-value kpi-value--sm">{{ ultimaData() }}</span>
          </div>
        </div>
      </div>

      @if (showForm) {
        <div class="panel">
          <div class="panel-header">
            <span class="panel-dot" style="background: var(--clx-accent);"></span>
            <h3>Nova ficha de anamnese</h3>
          </div>
          <div class="form-grid">
            <label>Paciente
              <select [(ngModel)]="form.pacienteId">
                <option value="">Selecione um paciente</option>
                @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
              </select>
            </label>
            <label>Título
              <input [(ngModel)]="form.titulo" placeholder="Título da ficha" />
            </label>
            <label>Queixa principal
              <input [(ngModel)]="form.queixaPrincipal" placeholder="Queixa principal do paciente" />
            </label>
            <label>Alergias
              <input [(ngModel)]="form.alergias" placeholder="Ex: dipirona, látex" />
            </label>
            <label>Medicamentos em uso
              <input [(ngModel)]="form.medicamentosUso" placeholder="Medicamentos atuais" />
            </label>
            <label>Hábitos
              <input [(ngModel)]="form.habitos" placeholder="Tabagismo, álcool, etc" />
            </label>
            <label class="fw">Histórico médico
              <textarea [(ngModel)]="form.historicoMedico" placeholder="Histórico clínico completo..."></textarea>
            </label>
            <label class="fw">Observações
              <textarea [(ngModel)]="form.observacoes" placeholder="Observações adicionais..."></textarea>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="button" (click)="salvar()">Salvar</button>
            <button class="btn-ghost" type="button" (click)="showForm = false">Cancelar</button>
          </div>
        </div>
      }

      <div class="panel">
        @if (items().length > 0) {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar por título, paciente ou queixa..." [ngModel]="busca()" (ngModelChange)="busca.set($event)">
              @if (busca()) {
                <button class="search-clear" type="button" (click)="busca.set('')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              }
            </div>
            <div class="filter-group">
              <label class="filter-label">Ordenar por:</label>
              <select class="filter-select" [ngModel]="ordenarPor()" (ngModelChange)="ordenarPor.set($event)">
                <option value="data">Data</option>
                <option value="titulo">Título</option>
                <option value="paciente">Paciente</option>
              </select>
              <button class="sort-dir-btn" type="button" (click)="ordemCrescente.set(!ordemCrescente())" [title]="ordemCrescente() ? 'Decrescente' : 'Crescente'">
                @if (ordemCrescente()) {
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                } @else {
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="anamnese-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Paciente</th>
                  <th>Data</th>
                  <th>Queixa principal</th>
                  <th>Alergias</th>
                  <th class="th-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of itemsFiltrados(); track item.id) {
                  <tr>
                    <td class="td-title" data-label="Título">{{ item.titulo || 'Sem título' }}</td>
                    <td class="td-patient" data-label="Paciente">{{ item.pacienteNome || '—' }}</td>
                    <td class="td-date" data-label="Data">{{ item.data | date:"dd/MM/yyyy" }}</td>
                    <td class="td-queixa" data-label="Queixa principal">{{ item.queixaPrincipal || '—' }}</td>
                    <td class="td-alergias" data-label="Alergias">{{ item.alergias || '—' }}</td>
                    <td class="td-right" data-label="Ações">
                      <div class="actions-cell">
                        <button class="btn-icon" type="button" title="Excluir" (click)="excluir(item)">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (itemsFiltrados().length === 0) {
            <p class="no-results">Nenhuma ficha encontrada para "{{ busca() }}".</p>
          }
        } @else {
          <div class="empty-wrap">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="30" width="120" height="140" rx="16" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <rect x="54" y="58" width="92" height="8" rx="4" fill="currentColor" opacity="0.15"/>
              <rect x="54" y="76" width="64" height="6" rx="3" fill="currentColor" opacity="0.1"/>
              <rect x="54" y="90" width="76" height="6" rx="3" fill="currentColor" opacity="0.1"/>
              <circle cx="100" cy="40" r="22" fill="currentColor" opacity="0.06"/>
              <path d="M92 40h16M100 32v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.2"/>
              <path d="M60 120h80M60 136h56M60 152h68" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.08"/>
            </svg>
            <h4>Nenhuma ficha encontrada</h4>
            <p>Clique em <strong>Nova ficha</strong> para cadastrar a primeira anamnese.</p>
          </div>
        }
      </div>
    </div>

    @if (showDeleteConfirm()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal modal--confirm" (click)="$event.stopPropagation()">
          <div class="confirm-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>Excluir ficha</h3>
          <p>Tem certeza que deseja excluir <strong>{{ deleteTarget()?.titulo || 'esta ficha' }}</strong>?</p>
          <p class="confirm-hint">Essa ação não pode ser desfeita.</p>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
            <button type="button" class="btn-danger" (click)="confirmDelete()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 0 12px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary);
      letter-spacing: -0.02em; margin: 0 0 4px 0; line-height: 1.2;
    }
    .header-subtitle {
      font-size: 0.82rem; color: var(--clx-text-tertiary); font-weight: 500;
    }
    .header-actions { display: flex; gap: 8px; }

    .btn-primary {
      padding: 9px 16px;
      background: var(--clx-accent);
      color: #fff;
      border: 1px solid var(--clx-accent);
      border-radius: var(--clx-radius-md);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 550;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      line-height: 1;
      box-shadow: var(--clx-shadow-sm);
    }
    .btn-primary:hover {
      background: var(--clx-accent-hover);
      border-color: var(--clx-accent-hover);
      box-shadow: var(--clx-shadow-glow);
      transform: translateY(-1px);
    }
    .btn-ghost {
      padding: 9px 16px;
      background: transparent;
      color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 550;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      line-height: 1;
    }
    .btn-ghost:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
      background: var(--clx-accent-muted);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      padding: 18px 20px;
      display: flex; align-items: center; gap: 14px;
      transition: all var(--clx-transition-fast);
    }
    .kpi-card:hover {
      border-color: var(--clx-border-strong);
      box-shadow: var(--clx-shadow-sm);
      transform: translateY(-2px);
    }
    .kpi-icon {
      width: 44px; height: 44px;
      border-radius: var(--clx-radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon--total { background: var(--clx-accent-muted); color: var(--clx-accent); }
    .kpi-icon--today { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--patients { background: var(--clx-purple-muted); color: var(--clx-purple); }
    .kpi-icon--latest { background: var(--clx-amber-muted); color: var(--clx-amber); }

    .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-label { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550; text-transform: uppercase; letter-spacing: 0.03em; }
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .kpi-value--sm { font-size: 0.92rem; }
    .kpi-sub { font-size: 0.7rem; color: var(--clx-text-tertiary); }

    .panel {
      background: var(--clx-card-bg, var(--clx-surface-1));
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-2xl, 16px);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--clx-shadow-card, 0 2px 12px rgba(0,0,0,0.03));
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .panel-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 750;
      letter-spacing: -0.015em;
    }
    .panel-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }
    .form-grid label {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.76rem;
      font-weight: 650;
      color: var(--clx-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .form-grid input,
    .form-grid select,
    .form-grid textarea {
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      padding: 10px 13px;
      background: var(--clx-surface-2);
      font-size: 0.9rem;
      color: var(--clx-text);
      font-family: var(--clx-font);
      outline: none;
      transition: all var(--clx-transition-fast);
    }
    .form-grid input:hover,
    .form-grid select:hover,
    .form-grid textarea:hover {
      border-color: var(--clx-text-tertiary);
    }
    .form-grid input:focus,
    .form-grid select:focus,
    .form-grid textarea:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .form-grid textarea { min-height: 96px; resize: vertical; }
    .form-grid .fw { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 4px;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 18px;
      padding: 16px 20px;
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      flex-wrap: wrap;
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--clx-text-muted);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 12px 42px 12px 42px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1);
      color: var(--clx-text-primary);
      font-size: 0.92rem;
      font-family: var(--clx-font);
      font-weight: 500;
      outline: none;
      transition: border-color var(--clx-transition-fast), box-shadow var(--clx-transition-fast);
    }
    .search-input::placeholder { color: var(--clx-text-muted); font-weight: 400; }
    .search-input:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--clx-text-muted);
      cursor: pointer;
      border-radius: var(--clx-radius-sm);
      transition: all var(--clx-transition-fast);
    }
    .search-clear:hover { background: var(--clx-surface-3); color: var(--clx-text-primary); }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .filter-label {
      font-size: 0.84rem;
      color: var(--clx-text-secondary);
      font-weight: 600;
      white-space: nowrap;
    }
    .filter-select {
      padding: 11px 36px 11px 14px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1);
      color: var(--clx-text-primary);
      font-size: 0.88rem;
      font-family: var(--clx-font);
      font-weight: 550;
      outline: none;
      cursor: pointer;
      min-width: 170px;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color var(--clx-transition-fast), box-shadow var(--clx-transition-fast);
    }
    .filter-select:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }

    .sort-dir-btn {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1);
      color: var(--clx-text-secondary);
      cursor: pointer;
      transition: all var(--clx-transition-fast);
    }
    .sort-dir-btn:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
      background: var(--clx-accent-muted);
      box-shadow: var(--clx-shadow-xs);
    }

    .no-results {
      text-align: center;
      padding: 20px;
      color: var(--clx-text-muted);
      font-size: 0.88rem;
    }

    .table-wrap {
      overflow-x: auto;
    }
    .anamnese-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .anamnese-table thead th {
      text-align: left;
      padding: 10px 16px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--clx-text-muted);
      border-bottom: 2px solid var(--clx-border-strong);
      white-space: nowrap;
    }
    .anamnese-table thead th.th-right { text-align: right; }

    .anamnese-table tbody tr {
      border-bottom: 1px solid var(--clx-border);
      transition: background .15s;
    }
    .anamnese-table tbody tr:hover {
      background: var(--clx-surface-2);
    }
    .anamnese-table tbody td {
      padding: 14px 16px;
      color: var(--clx-text-primary);
      vertical-align: middle;
    }
    .td-title { font-weight: 600; }
    .td-date { white-space: nowrap; color: var(--clx-text-secondary); }
    .td-patient { color: var(--clx-text-secondary); }
    .td-queixa, .td-alergias { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--clx-text-secondary); }
    .td-right { text-align: right; }

    .actions-cell { display: flex; gap: 6px; justify-content: flex-end; }
    .btn-icon {
      width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
      border-radius: var(--clx-radius-sm);
      background: transparent;
      color: var(--clx-text-muted);
      cursor: pointer;
      transition: all var(--clx-transition-fast);
    }
    .btn-icon:hover {
      background: var(--clx-error-muted);
      color: var(--clx-error);
      border-color: transparent;
    }

    .empty-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 24px;
      text-align: center;
    }
    .empty-wrap svg {
      width: 140px;
      height: 140px;
      opacity: 0.25;
      margin-bottom: 20px;
    }
    .empty-wrap h4 {
      margin: 0 0 6px;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--clx-text-primary);
    }
    .empty-wrap p {
      margin: 0;
      color: var(--clx-text-muted);
      font-size: 0.85rem;
      max-width: 360px;
      line-height: 1.5;
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      backdrop-filter: blur(6px); display: flex; align-items: center;
      justify-content: center; z-index: 2000; animation: fadeIn .15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal {
      background: var(--clx-surface-1); border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-lg); width: 92%; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,.08), 0 0 0 1px rgba(255,255,255,.04) inset;
      animation: modalIn .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal--confirm {
      max-width: 400px;
      text-align: center;
      padding: 32px 28px 24px;
    }
    .confirm-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: rgba(239, 68, 68, 0.1); color: #ef4444;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .modal--confirm h3 {
      margin: 0 0 8px; font-size: 1.05rem; font-weight: 700;
      color: var(--clx-text-primary);
    }
    .modal--confirm > p {
      margin: 0; font-size: .88rem; color: var(--clx-text-secondary); line-height: 1.5;
    }
    .confirm-hint {
      font-size: .78rem !important; color: var(--clx-text-tertiary) !important;
      margin-top: 4px !important;
    }
    .confirm-actions {
      display: flex; gap: 10px; justify-content: center;
      margin-top: 24px;
    }
    .confirm-actions .btn-cancel {
      flex: 1;
    }
    .btn-cancel {
      padding: 10px 20px; background: transparent; color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong); border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 500; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-cancel:hover { border-color: var(--clx-text-tertiary); color: var(--clx-text-primary); }
    .btn-danger {
      flex: 1;
      padding: 10px 20px; background: #ef4444; color: #fff;
      border: none; border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 600; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-danger:hover { background: #dc2626; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
      .filter-select { min-width: 0; flex: 1; }
      .table-wrap { overflow-x: visible; }
      .anamnese-table thead { display: none; }
      .anamnese-table { display: block; width: 100%; }
      .anamnese-table tbody { display: block; }
      .anamnese-table tbody tr {
        display: block;
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        margin-bottom: 8px;
        padding: 10px 12px;
        background: var(--clx-bg);
      }
      .anamnese-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--clx-border);
        text-align: left;
        font-size: 0.78rem;
        white-space: normal;
      }
      .anamnese-table tbody td:last-child { border-bottom: none; }
      .anamnese-table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--clx-text-muted);
        margin-right: 10px;
        flex-shrink: 0;
      }
      .anamnese-table tbody td.td-right,
      .anamnese-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .anamnese-table tbody td.td-queixa,
      .anamnese-table tbody td.td-alergias {
        max-width: none; overflow: visible; text-overflow: unset; white-space: normal;
      }
      .panel { padding: 14px; }
    }

    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .anamnese-table { font-size: 0.72rem; }
      .anamnese-table thead th,
      .anamnese-table tbody td { padding: 6px 4px; }
      .anamnese-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class AnamnesesPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly pacientesApi = inject(PacienteService);
  readonly auth = inject(AuthService);

  items = signal<AnamneseItem[]>([]);
  pacientes = signal<any[]>([]);
  showForm = false;
  busca = signal('');
  ordenarPor = signal<'data' | 'titulo' | 'paciente'>('data');
  ordemCrescente = signal(false);
  form: any = {};
  showDeleteConfirm = signal(false);
  deleteTarget = signal<AnamneseItem | null>(null);

  thisMes = computed(() => {
    const now = new Date();
    const mes = now.getMonth();
    const ano = now.getFullYear();
    return this.items().filter(i => {
      if (!i.data) return false;
      const d = new Date(i.data);
      return d.getMonth() === mes && d.getFullYear() === ano;
    }).length;
  });

  totalPacientes = computed(() => {
    const unique = new Set(this.items().map(i => i.pacienteNome).filter(Boolean));
    return unique.size;
  });

  ultimaData = computed(() => {
    if (this.items().length === 0) return '—';
    const sorted = [...this.items()].filter(i => i.data).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    if (sorted.length === 0) return '—';
    try {
      return new Date(sorted[0].data).toLocaleDateString('pt-BR');
    } catch {
      return sorted[0].data;
    }
  });

  itemsFiltrados = computed(() => {
    const busca = this.busca().toLowerCase().trim();
    const por = this.ordenarPor();
    const crescente = this.ordemCrescente();

    let result = this.items();
    if (busca) {
      result = result.filter(i =>
        (i.titulo && i.titulo.toLowerCase().includes(busca)) ||
        (i.pacienteNome && i.pacienteNome.toLowerCase().includes(busca)) ||
        (i.queixaPrincipal && i.queixaPrincipal.toLowerCase().includes(busca)) ||
        (i.alergias && i.alergias.toLowerCase().includes(busca))
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (por === 'data') {
        const da = a.data ? new Date(a.data).getTime() : 0;
        const db = b.data ? new Date(b.data).getTime() : 0;
        cmp = da - db;
      } else if (por === 'titulo') {
        cmp = (a.titulo || '').localeCompare(b.titulo || '');
      } else if (por === 'paciente') {
        cmp = (a.pacienteNome || '').localeCompare(b.pacienteNome || '');
      }
      return crescente ? cmp : -cmp;
    });
  });

  ngOnInit() {
    this.load();
    this.pacientesApi.getAll('', 1, 100).subscribe({
      next: (r: any) => this.pacientes.set(r.items || r || []),
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) this.resetForm();
  }

  private resetForm() {
    const firstPac = this.pacientes()[0]?.id || '';
    this.form = {
      pacienteId: firstPac,
      titulo: '',
      queixaPrincipal: '',
      alergias: '',
      historicoMedico: '',
      medicamentosUso: '',
      habitos: '',
      observacoes: '',
    };
  }

  load() {
    this.api.listAnamneses().subscribe({
      next: (d: any) => this.items.set(d || []),
      error: () => this.items.set([]),
    });
  }

  salvar() {
    const f = this.form;
    if (!f.pacienteId) {
      this.toast.show('error', 'Selecione um paciente');
      return;
    }
    this.api.createAnamnese(f).subscribe({
      next: () => {
        this.toast.show('success', 'Ficha salva com sucesso');
        this.showForm = false;
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error || 'Falha ao salvar'),
    });
  }

  excluir(item: AnamneseItem) {
    this.deleteTarget.set(item);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const item = this.deleteTarget();
    if (!item) return;
    this.api.deleteAnamnese(item.id).subscribe({
      next: () => {
        this.toast.show('success', 'Ficha excluída');
        this.cancelDelete();
        this.load();
      },
      error: () => this.toast.show('error', 'Falha ao excluir'),
    });
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deleteTarget.set(null);
  }
}
