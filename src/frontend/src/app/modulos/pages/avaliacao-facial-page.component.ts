import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PacienteService } from '../../pacientes/services/paciente.service';

interface AvaliacaoItem {
  id: string;
  pacienteId: string;
  data: string;
  resultadoJson: string;
  observacoes?: string;
  recomendacoes?: string;
  scoreGeral?: number;
}

@Component({
  selector: 'app-avaliacao-facial-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Avaliação facial com IA</h1>
          <span class="header-subtitle">Scores e recomendações gerados por IA</span>
        </div>
        <div class="header-actions">
          <button class="btn-primary" type="button" (click)="toggleForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ showForm ? 'Fechar' : 'Nova avaliação' }}
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
            <span class="kpi-sub">avaliações</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--avg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Score médio</span>
            <span class="kpi-value">{{ scoreMedio() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--top">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Maior score</span>
            <span class="kpi-value">{{ scoreMaximo() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--rec">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">C/ recomendações</span>
            <span class="kpi-value">{{ comRecomendacoes() }}</span>
          </div>
        </div>
      </div>

      @if (showForm) {
        <div class="panel">
          <div class="panel-header">
            <span class="panel-dot" style="background: linear-gradient(135deg, var(--clx-purple), var(--clx-rose));"></span>
            <h3>Nova avaliação facial</h3>
          </div>
          <div class="form-grid">
            <label>Paciente *
              <select [(ngModel)]="form.pacienteId">
                <option value="">Selecione um paciente</option>
                @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
              </select>
            </label>
            <label class="fw">Observações
              <textarea [(ngModel)]="form.observacoes" placeholder="Observações da avaliação..."></textarea>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="button" (click)="salvar()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Gerar avaliação com IA
            </button>
            <button class="btn-ghost" type="button" (click)="showForm = false">Cancelar</button>
          </div>
        </div>
      }

      <div class="panel">
        @if (items().length === 0) {
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
            <h4>Nenhuma avaliação encontrada</h4>
            <p>Clique em <strong>Nova avaliação</strong> para gerar a primeira avaliação facial com IA.</p>
          </div>
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar por recomendações ou observações..." [ngModel]="busca()" (ngModelChange)="busca.set($event)">
              @if (busca()) {
                <button class="search-clear" type="button" (click)="busca.set('')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              }
            </div>
            <div class="filter-group">
              <label class="filter-label">Filtrar:</label>
              <select class="filter-select" [ngModel]="filtroScore()" (ngModelChange)="filtroScore.set($event)">
                <option value="todos">Todos</option>
                <option value="alto">Score alto (≥ 80)</option>
                <option value="medio">Score médio (60–79)</option>
                <option value="baixo">Score baixo (&lt; 60)</option>
              </select>
            </div>
          </div>

          <div class="table-wrap">
            <table class="avaliacao-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Score</th>
                  <th>Recomendações</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of itemsFiltrados(); track item.id) {
                  <tr>
                    <td class="td-date" data-label="Data">{{ item.data | date:"dd/MM/yyyy" }}</td>
                    <td data-label="Score">
                      <div class="score-cell">
                        <div class="score-bar-track">
                          <div class="score-bar-fill" [style.width.%]="item.scoreGeral ?? 0"
                               [style.background]="scoreColor(item.scoreGeral)"></div>
                        </div>
                        <span class="score-value" [style.color]="scoreColor(item.scoreGeral)">{{ item.scoreGeral ?? '—' }}</span>
                      </div>
                    </td>
                    <td class="td-rec" data-label="Recomendações">{{ item.recomendacoes || '—' }}</td>
                    <td class="td-obs" data-label="Observações">{{ item.observacoes || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (itemsFiltrados().length === 0) {
            <p class="no-results">Nenhuma avaliação encontrada para "{{ busca() }}".</p>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
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
      background: linear-gradient(135deg, var(--clx-purple), var(--clx-rose));
      color: #fff;
      border: none;
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
      opacity: .9;
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
    .kpi-icon--avg { background: var(--clx-purple-muted); color: var(--clx-purple); }
    .kpi-icon--top { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--rec { background: var(--clx-amber-muted); color: var(--clx-amber); }

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
    .form-grid textarea { min-height: 80px; resize: vertical; }
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

    .no-results {
      text-align: center;
      padding: 20px;
      color: var(--clx-text-muted);
      font-size: 0.88rem;
    }

    .table-wrap {
      overflow-x: auto;
    }
    .avaliacao-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .avaliacao-table thead th {
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

    .avaliacao-table tbody tr {
      border-bottom: 1px solid var(--clx-border);
      transition: background .15s;
    }
    .avaliacao-table tbody tr:hover {
      background: var(--clx-surface-2);
    }
    .avaliacao-table tbody td {
      padding: 14px 16px;
      color: var(--clx-text-primary);
      vertical-align: middle;
    }
    .td-date { white-space: nowrap; color: var(--clx-text-secondary); font-weight: 500; }
    .td-rec { max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--clx-text-secondary); }
    .td-obs { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--clx-text-tertiary); }

    .score-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 140px;
    }
    .score-bar-track {
      flex: 1;
      height: 8px;
      background: var(--clx-surface-3);
      border-radius: var(--clx-radius-full);
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: var(--clx-radius-full);
      transition: width 0.6s var(--clx-ease-out);
    }
    .score-value {
      font-weight: 700;
      font-size: 0.92rem;
      font-variant-numeric: tabular-nums;
      min-width: 32px;
      text-align: right;
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

    @media (max-width: 700px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
      .filter-select { min-width: 0; flex: 1; }
      .table-wrap { overflow-x: visible; }
      .avaliacao-table thead { display: none; }
      .avaliacao-table { display: block; width: 100%; }
      .avaliacao-table tbody { display: block; }
      .avaliacao-table tbody tr {
        display: block;
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        margin-bottom: 8px;
        padding: 10px 12px;
        background: var(--clx-bg);
      }
      .avaliacao-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--clx-border);
        text-align: left;
        font-size: 0.78rem;
        white-space: normal;
      }
      .avaliacao-table tbody td:last-child { border-bottom: none; }
      .avaliacao-table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--clx-text-muted);
        margin-right: 10px;
        flex-shrink: 0;
      }
      .avaliacao-table tbody td.td-right,
      .avaliacao-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .panel { padding: 14px; }
    }

    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .avaliacao-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class AvaliacaoFacialPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly pacientesApi = inject(PacienteService);
  readonly auth = inject(AuthService);

  items = signal<AvaliacaoItem[]>([]);
  pacientes = signal<any[]>([]);
  showForm = false;
  busca = signal('');
  filtroScore = signal<string>('todos');
  form: any = {};

  scoreMedio = computed(() => {
    const scores = this.items().map(i => i.scoreGeral).filter((s): s is number => s != null);
    if (scores.length === 0) return '—';
    const media = scores.reduce((a, b) => a + b, 0) / scores.length;
    return media.toFixed(1);
  });

  scoreMaximo = computed(() => {
    const scores = this.items().map(i => i.scoreGeral).filter((s): s is number => s != null);
    if (scores.length === 0) return '—';
    return Math.max(...scores).toFixed(1);
  });

  comRecomendacoes = computed(() =>
    this.items().filter(i => i.recomendacoes && i.recomendacoes.length > 0).length
  );

  itemsFiltrados = computed(() => {
    const busca = this.busca().toLowerCase().trim();
    const score = this.filtroScore();

    let result = this.items();
    if (score === 'alto') result = result.filter(i => (i.scoreGeral ?? 0) >= 80);
    else if (score === 'medio') result = result.filter(i => {
      const s = i.scoreGeral ?? 0;
      return s >= 60 && s < 80;
    });
    else if (score === 'baixo') result = result.filter(i => (i.scoreGeral ?? 0) < 60);

    if (busca) {
      result = result.filter(i =>
        (i.recomendacoes && i.recomendacoes.toLowerCase().includes(busca)) ||
        (i.observacoes && i.observacoes.toLowerCase().includes(busca))
      );
    }

    return result;
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
    this.form = { pacienteId: firstPac, observacoes: '' };
  }

  load() {
    this.api.listAvaliacoes().subscribe({
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
    this.api.createAvaliacao(f).subscribe({
      next: () => {
        this.toast.show('success', 'Avaliação gerada com sucesso');
        this.showForm = false;
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error || 'Falha ao gerar avaliação'),
    });
  }

  scoreColor(score?: number): string {
    if (score == null) return 'var(--clx-text-muted)';
    if (score >= 80) return 'var(--clx-success)';
    if (score >= 60) return 'var(--clx-warning)';
    return 'var(--clx-error)';
  }
}
