import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PacienteService } from '../../pacientes/services/paciente.service';

interface PortalItem {
  id: string;
  pacienteId: string;
  email: string;
  tokenAcesso: string;
  habilitado: boolean;
  ultimoAcesso?: string;
  observacoes?: string;
}

@Component({
  selector: 'app-portal-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Painel do paciente</h1>
          <span class="header-subtitle">Acessos liberados para o portal do paciente</span>
        </div>
        <div class="header-actions">
          <button class="btn-primary" type="button" (click)="toggleForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ showForm ? 'Fechar' : 'Novo acesso' }}
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
            <span class="kpi-sub">acessos liberados</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Ativos</span>
            <span class="kpi-value">{{ ativos() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--inactive">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Inativos</span>
            <span class="kpi-value">{{ inativos() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--recent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Último acesso</span>
            <span class="kpi-value kpi-value--sm">{{ ultimoAcessoLabel() }}</span>
          </div>
        </div>
      </div>

      @if (showForm) {
        <div class="panel">
          <div class="panel-header">
            <span class="panel-dot" style="background: var(--clx-info);"></span>
            <h3>Liberar acesso ao portal</h3>
          </div>
          <div class="form-grid">
            <label>Paciente *
              <select [(ngModel)]="form.pacienteId">
                <option value="">Selecione um paciente</option>
                @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
              </select>
            </label>
            <label>E-mail *
              <input type="email" [(ngModel)]="form.email" placeholder="paciente@email.com" />
            </label>
            <label class="fw">Observações
              <textarea [(ngModel)]="form.observacoes" placeholder="Observações sobre o acesso..."></textarea>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="button" (click)="salvar()">Salvar</button>
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
            <h4>Nenhum acesso liberado</h4>
            <p>Clique em <strong>Novo acesso</strong> para liberar o portal do paciente.</p>
          </div>
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar por e-mail ou token..." [ngModel]="busca()" (ngModelChange)="busca.set($event)">
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
              <select class="filter-select" [ngModel]="filtroStatus()" (ngModelChange)="filtroStatus.set($event)">
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>
          </div>

          <div class="table-wrap">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Token</th>
                  <th>Status</th>
                  <th>Último acesso</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of itemsFiltrados(); track item.id) {
                  <tr>
                    <td class="td-email" data-label="E-mail">{{ item.email }}</td>
                    <td class="td-token" data-label="Token">
                      <code class="token-code">{{ item.tokenAcesso }}</code>
                    </td>
                    <td data-label="Status">
                      <span class="status-tag" [class.status-tag--active]="item.habilitado" [class.status-tag--inactive]="!item.habilitado">
                        <span class="status-dot"></span>
                        {{ item.habilitado ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="td-date" data-label="Último acesso">{{ item.ultimoAcesso ? (item.ultimoAcesso | date:"dd/MM/yyyy HH:mm") : '—' }}</td>
                    <td class="td-obs" data-label="Observações">{{ item.observacoes || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (itemsFiltrados().length === 0) {
            <p class="no-results">Nenhum acesso encontrado para "{{ busca() }}".</p>
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
    .kpi-icon--active { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--inactive { background: var(--clx-rose-muted); color: var(--clx-rose); }
    .kpi-icon--recent { background: var(--clx-amber-muted); color: var(--clx-amber); }

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
    .portal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .portal-table thead th {
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

    .portal-table tbody tr {
      border-bottom: 1px solid var(--clx-border);
      transition: background .15s;
    }
    .portal-table tbody tr:hover {
      background: var(--clx-surface-2);
    }
    .portal-table tbody td {
      padding: 14px 16px;
      color: var(--clx-text-primary);
      vertical-align: middle;
    }
    .td-email { font-weight: 600; }
    .td-date { white-space: nowrap; color: var(--clx-text-secondary); }
    .td-obs { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--clx-text-secondary); }

    .token-code {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.78rem;
      background: var(--clx-surface-3);
      padding: 3px 8px;
      border-radius: var(--clx-radius-xs);
      color: var(--clx-text-secondary);
      letter-spacing: 0.02em;
    }

    .status-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: var(--clx-radius-full);
      font-size: 0.76rem;
      font-weight: 600;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .status-tag--active {
      background: var(--clx-success-muted);
      color: var(--clx-success);
    }
    .status-tag--active .status-dot {
      background: var(--clx-success);
      box-shadow: 0 0 6px var(--clx-success);
    }
    .status-tag--inactive {
      background: var(--clx-error-muted);
      color: var(--clx-error);
    }
    .status-tag--inactive .status-dot {
      background: var(--clx-error);
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
      .portal-table thead { display: none; }
      .portal-table { display: block; width: 100%; }
      .portal-table tbody { display: block; }
      .portal-table tbody tr {
        display: block;
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        margin-bottom: 8px;
        padding: 10px 12px;
        background: var(--clx-bg);
      }
      .portal-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--clx-border);
        text-align: left;
        font-size: 0.78rem;
        white-space: normal;
      }
      .portal-table tbody td:last-child { border-bottom: none; }
      .portal-table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--clx-text-muted);
        margin-right: 10px;
        flex-shrink: 0;
      }
      .portal-table tbody td.td-right,
      .portal-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .panel { padding: 14px; }
    }

    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .portal-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class PortalPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly pacientesApi = inject(PacienteService);
  readonly auth = inject(AuthService);

  items = signal<PortalItem[]>([]);
  pacientes = signal<any[]>([]);
  showForm = false;
  busca = signal('');
  filtroStatus = signal<'todos' | 'ativos' | 'inativos'>('todos');
  form: any = {};

  ativos = computed(() => this.items().filter(i => i.habilitado).length);
  inativos = computed(() => this.items().filter(i => !i.habilitado).length);

  ultimoAcessoLabel = computed(() => {
    const active = this.items().filter(i => i.habilitado && i.ultimoAcesso);
    if (active.length === 0) return '—';
    const sorted = active.sort((a, b) => {
      const da = a.ultimoAcesso ? new Date(a.ultimoAcesso).getTime() : 0;
      const db = b.ultimoAcesso ? new Date(b.ultimoAcesso).getTime() : 0;
      return db - da;
    });
    try {
      return new Date(sorted[0].ultimoAcesso!).toLocaleDateString('pt-BR');
    } catch {
      return sorted[0].ultimoAcesso || '—';
    }
  });

  itemsFiltrados = computed(() => {
    const busca = this.busca().toLowerCase().trim();
    const status = this.filtroStatus();

    let result = this.items();
    if (status === 'ativos') result = result.filter(i => i.habilitado);
    else if (status === 'inativos') result = result.filter(i => !i.habilitado);

    if (busca) {
      result = result.filter(i =>
        i.email.toLowerCase().includes(busca) ||
        i.tokenAcesso.toLowerCase().includes(busca) ||
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
    this.form = { pacienteId: firstPac, email: '', observacoes: '' };
  }

  load() {
    this.api.listPortal().subscribe({
      next: (d: any) => this.items.set(d || []),
      error: () => this.items.set([]),
    });
  }

  salvar() {
    const f = this.form;
    if (!f.pacienteId || !f.email) {
      this.toast.show('error', 'Preencha todos os campos obrigatórios');
      return;
    }
    this.api.createPortal(f).subscribe({
      next: () => {
        this.toast.show('success', 'Acesso liberado com sucesso');
        this.showForm = false;
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error || 'Falha ao liberar acesso'),
    });
  }
}
