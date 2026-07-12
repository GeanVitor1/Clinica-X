import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModulosApiService } from '../services/modulos-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'concluida';
  prazo: string;
  geradaPorIa: boolean;
  criadaEm: string;
}

const PRIORIDADE_LABEL: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };
const PRIORIDADE_CLASS: Record<string, string> = {
  baixa: 'stg--neutral', media: 'stg--info', alta: 'stg--negative', urgente: 'stg--urgent',
};
const STATUS_LABEL: Record<string, string> = { pendente: 'Pendente', em_andamento: 'Em andamento', concluida: 'Concluída' };
const STATUS_CLASS: Record<string, string> = {
  pendente: 'stg--warn', em_andamento: 'stg--info', concluida: 'stg--positive',
};

@Component({
  selector: 'app-tarefas-page',
  standalone: true,
  imports: [FormsModule, DatePipe, SkeletonComponent, EmptyStateComponent],
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 0 12px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary);
      letter-spacing: -0.02em; margin: 0 0 4px 0; line-height: 1.2;
    }
    .header-subtitle { font-size: 0.82rem; color: var(--clx-text-tertiary); font-weight: 500; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

    .btn-export {
      padding: 9px 16px; background: var(--clx-surface-1); color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong); border-radius: var(--clx-radius-md);
      cursor: pointer; font-size: 0.8rem; font-weight: 550; font-family: var(--clx-font);
      transition: all var(--clx-transition-fast); display: inline-flex; align-items: center; gap: 7px; line-height: 1;
    }
    .btn-export:hover {
      border-color: var(--clx-accent); color: var(--clx-accent);
      background: var(--clx-accent-muted); box-shadow: var(--clx-shadow-sm); transform: translateY(-1px);
    }

    .btn-export--ai {
      background: linear-gradient(135deg, var(--clx-purple-muted), var(--clx-accent-muted));
      border-color: var(--clx-purple); color: var(--clx-purple);
    }
    .btn-export--ai:hover {
      background: var(--clx-purple); color: #fff; border-color: var(--clx-purple);
    }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    .kpi-card {
      background: var(--clx-surface-1); border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg); padding: 18px 20px;
      display: flex; align-items: center; gap: 14px; transition: all var(--clx-transition-fast);
    }
    .kpi-card:hover { border-color: var(--clx-border-strong); box-shadow: var(--clx-shadow-sm); transform: translateY(-2px); }
    .kpi-icon {
      width: 44px; height: 44px; border-radius: var(--clx-radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .kpi-icon--total { background: var(--clx-accent-muted); color: var(--clx-accent); }
    .kpi-icon--concluidas { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--andamento { background: var(--clx-amber-muted); color: var(--clx-amber); }
    .kpi-icon--urgentes { background: var(--clx-rose-muted); color: var(--clx-rose); }

    .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-label { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550; text-transform: uppercase; letter-spacing: 0.03em; }
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; }

    .controls-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 14px;
    }
    .tab-group {
      display: flex; gap: 4px; background: var(--clx-surface-3);
      padding: 4px; border-radius: var(--clx-radius-md);
    }
    .tab {
      padding: 8px 20px; border: none; background: transparent; border-radius: var(--clx-radius-sm);
      cursor: pointer; font-size: 0.84rem; color: var(--clx-text-secondary); font-weight: 500;
      font-family: var(--clx-font); transition: all var(--clx-transition-fast);
      display: inline-flex; align-items: center; gap: 7px; line-height: 1; white-space: nowrap;
    }
    .tab:hover { color: var(--clx-text-primary); }
    .tab--active { background: var(--clx-surface-1); color: var(--clx-text-primary); font-weight: 650; box-shadow: var(--clx-shadow-xs); }

    .panel {
      background: var(--clx-card-bg, var(--clx-surface-1));
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-2xl, 16px);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--clx-shadow-card, 0 2px 12px rgba(0,0,0,0.03));
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
    .search-box { position: relative; flex: 1; min-width: 260px; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--clx-text-muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 12px 42px 12px 42px; border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md); background: var(--clx-surface-1); color: var(--clx-text-primary);
      font-size: 0.92rem; font-family: var(--clx-font); font-weight: 500; outline: none;
      transition: border-color var(--clx-transition-fast), box-shadow var(--clx-transition-fast);
    }
    .search-input::placeholder { color: var(--clx-text-muted); font-weight: 400; }
    .search-input:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .search-clear {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; color: var(--clx-text-muted); cursor: pointer;
      border-radius: var(--clx-radius-sm); transition: all var(--clx-transition-fast);
    }
    .search-clear:hover { background: var(--clx-surface-3); color: var(--clx-text-primary); }

    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-label { font-size: 0.84rem; color: var(--clx-text-secondary); font-weight: 600; white-space: nowrap; }
    .filter-select {
      padding: 11px 36px 11px 14px; border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md); background: var(--clx-surface-1); color: var(--clx-text-primary);
      font-size: 0.88rem; font-family: var(--clx-font); font-weight: 550; outline: none; cursor: pointer;
      min-width: 170px; appearance: none; -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 12px center;
      transition: border-color var(--clx-transition-fast), box-shadow var(--clx-transition-fast);
    }
    .filter-select:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }

    .sort-dir-btn {
      width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--clx-border-strong); border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1); color: var(--clx-text-secondary); cursor: pointer;
      transition: all var(--clx-transition-fast);
    }
    .sort-dir-btn:hover { border-color: var(--clx-accent); color: var(--clx-accent); background: var(--clx-accent-muted); box-shadow: var(--clx-shadow-xs); }

    .no-results { text-align: center; padding: 20px; color: var(--clx-text-muted); font-size: 0.88rem; }

    .table-wrap { overflow-x: auto; }
    .report-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .report-table thead th {
      text-align: left; padding: 10px 16px; font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em; color: var(--clx-text-muted);
      border-bottom: 2px solid var(--clx-border-strong); white-space: nowrap;
    }
    .report-table thead th.th-center { text-align: center; }
    .report-table thead th.th-right { text-align: right; }

    .report-table tbody tr { border-bottom: 1px solid var(--clx-border); transition: background .15s; }
    .report-table tbody tr:hover { background: var(--clx-surface-2); }
    .report-table tbody td { padding: 14px 16px; color: var(--clx-text-primary); vertical-align: middle; }
    .row-overdue { background: rgba(239, 68, 68, 0.04); }
    .row-overdue:hover { background: rgba(239, 68, 68, 0.08); }

    .td-title { font-weight: 650; }
    .td-prazo { white-space: nowrap; }
    .td-prazo--overdue { color: #dc2626; font-weight: 650; }

    .td-service {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .service-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.4);
    }

    .actions-cell { display: flex; gap: 6px; justify-content: flex-end; }
    .act-btn {
      width: 32px; height: 32px; border-radius: var(--clx-radius-sm); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--clx-border); background: var(--clx-surface-1);
      color: var(--clx-text-secondary); transition: all var(--clx-transition-fast);
    }
    .act-btn--edit:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .act-btn--delete:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }

    /* ── Status tags ── */
    .stg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: var(--clx-radius-badge, 6px);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.4;
      text-transform: capitalize;
    }
    .stg--positive { background: var(--clx-success-muted, rgba(16, 185, 129, 0.15)); color: var(--clx-success, #10b981); }
    .stg--negative { background: var(--clx-error-muted, rgba(239, 68, 68, 0.15)); color: var(--clx-error, #ef4444); }
    .stg--warn     { background: var(--clx-warning-muted, rgba(245, 158, 11, 0.15)); color: var(--clx-warning, #f59e0b); }
    .stg--urgent   { background: var(--clx-rose-muted, rgba(244, 63, 94, 0.15)); color: var(--clx-rose, #f43f5e); }
    .stg--neutral  { background: var(--clx-bg-alt, #f1f5f9); color: var(--clx-text-muted, #64748b); }
    .stg--info     { background: var(--clx-info-muted, rgba(59, 130, 246, 0.15)); color: var(--clx-info, #3b82f6); }

    .report-table tfoot tr {
      border-top: 2px solid var(--clx-border-strong);
      background: linear-gradient(135deg, var(--clx-accent-muted), var(--clx-purple-muted));
    }
    .report-table tfoot td { padding: 14px 16px; }
    .tf-label { font-weight: 650; color: var(--clx-text-primary); }
    .tf-value { font-size: 1.05rem; font-weight: 750; color: var(--clx-accent); }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
      animation: fadeIn .15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      background: var(--clx-surface-1); border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-lg); width: 92%; max-width: 520px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,.08); animation: modalIn .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .modal-top {
      display: flex; align-items: flex-start; justify-content: space-between; padding: 24px 26px 0;
    }
    .modal-top-left { display: flex; align-items: flex-start; gap: 13px; }
    .modal-deco {
      width: 40px; height: 40px; border-radius: 11px;
      background: linear-gradient(135deg, var(--clx-purple), #6d28d9);
      color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .modal-top-left h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--clx-text); }
    .modal-sub { margin: 3px 0 0; font-size: .78rem; color: var(--clx-text-muted); }
    .modal-x {
      width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--clx-border);
      background: var(--clx-bg); color: var(--clx-text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all .15s; flex-shrink: 0;
    }
    .modal-x:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
    .modal-body { display: flex; flex-direction: column; gap: 16px; padding: 20px 26px 24px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: .8rem; font-weight: 600; color: var(--clx-text-secondary); }
    .field input, .field select, .field textarea {
      padding: 10px 13px; border: 1px solid var(--clx-border-strong); border-radius: 10px;
      background: var(--clx-surface-2); color: var(--clx-text); font-size: .87rem;
      font-family: var(--clx-font); outline: none; transition: all .2s;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .field textarea { resize: vertical; min-height: 80px; }
    .modal-footer {
      display: flex; gap: 10px; justify-content: flex-end; padding: 16px 26px; border-top: 1px solid var(--clx-border);
    }
    .btn-cancel {
      padding: 10px 20px; background: transparent; color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong); border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 500; font-family: var(--clx-font); transition: all .2s;
    }
    .btn-cancel:hover { border-color: var(--clx-text-tertiary); color: var(--clx-text-primary); }
    .btn-save {
      padding: 10px 20px; background: var(--clx-accent); color: #fff; border: none; border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 600; font-family: var(--clx-font);
      transition: all .2s; display: inline-flex; align-items: center; gap: 7px;
    }
    .btn-save:hover { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); }

    .modal--confirm { max-width: 400px; text-align: center; padding: 32px 28px 24px; }
    .confirm-icon {
      width: 48px; height: 48px; border-radius: 50%; background: rgba(239, 68, 68, 0.1);
      color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }
    .modal--confirm h3 { margin: 0 0 8px; font-size: 1.05rem; font-weight: 700; color: var(--clx-text-primary); }
    .modal--confirm > p { margin: 0; font-size: .88rem; color: var(--clx-text-secondary); line-height: 1.5; }
    .confirm-hint { font-size: .78rem !important; color: var(--clx-text-tertiary) !important; margin-top: 4px !important; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; margin-top: 24px; }
    .confirm-actions .btn-cancel { flex: 1; }
    .btn-danger {
      flex: 1; padding: 10px 20px; background: #ef4444; color: #fff;
      border: none; border-radius: 10px; cursor: pointer; font-size: .85rem;
      font-weight: 600; font-family: var(--clx-font); transition: all .2s;
    }
    .btn-danger:hover { background: #dc2626; }

    .hidden { display: none; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; gap: 14px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { flex-wrap: wrap; }
      .filter-select { min-width: 0; flex: 1; }
      .table-wrap { overflow-x: visible; }
      .report-table thead { display: none; }
      .report-table tfoot { display: none; }
      .report-table { display: block; width: 100%; }
      .report-table tbody { display: block; }
      .report-table tbody tr {
        display: block;
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        margin-bottom: 8px;
        padding: 10px 12px;
        background: var(--clx-bg);
      }
      .report-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--clx-border);
        text-align: left;
        font-size: 0.78rem;
        white-space: normal;
      }
      .report-table tbody td:last-child { border-bottom: none; }
      .report-table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--clx-text-muted);
        margin-right: 10px;
        flex-shrink: 0;
      }
      .report-table tbody td.td-right,
      .report-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .panel { padding: 14px; }
    }
    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .tab-group { flex-wrap: wrap; }
      .report-table { font-size: 0.72rem; }
      .report-table thead th,
      .report-table tbody td { padding: 6px 4px; }
      .report-table tbody td { font-size: 0.72rem; }
    }
  `],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Tarefas</h1>
          <span class="header-subtitle">Assistente de tarefas com IA</span>
        </div>
        <div class="header-actions">
          <button class="btn-export btn-export--ai" type="button" (click)="sugerirTarefas()" [disabled]="sugerindo()">
            @if (sugerindo()) {
              <span class="spinner"></span>
              Sugerindo...
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.93A3.5 3.5 0 0 0 7.5 16.5a3.5 3.5 0 0 0 3.5 3.5h1a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-3.75-6.57A4 4 0 0 0 12 2z"/>
              </svg>
              Sugerir com IA
            }
          </button>
          <button class="btn-export" type="button" (click)="openForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova Tarefa
          </button>
          <button class="btn-export" type="button" (click)="exportCsv()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar CSV
          </button>
        </div>
      </header>

      <div class="controls-bar">
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'todas'" (click)="filtroTab.set('todas')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            Todas
          </button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'pendentes'" (click)="filtroTab.set('pendentes')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Pendentes
          </button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'em_andamento'" (click)="filtroTab.set('em_andamento')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Em andamento
          </button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'concluidas'" (click)="filtroTab.set('concluidas')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Concluídas
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-skeleton variant="table" />
        <app-skeleton variant="chart" />
      }

      <div [class.hidden]="loading()">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--total">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total</span>
              <span class="kpi-value">{{ total() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--concluidas">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Concluídas</span>
              <span class="kpi-value">{{ concluidas() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--andamento">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Em andamento</span>
              <span class="kpi-value">{{ emAndamento() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--urgentes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Urgentes</span>
              <span class="kpi-value">{{ urgentes() }}</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Lista de tarefas</h2>
          <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;">
            {{ filtroTabLabel() }} — {{ filteredItems().length }} tarefa{{ filteredItems().length !== 1 ? 's' : '' }}
          </p>

          @if (items().length === 0) {
            <app-empty-state icon="relatorios" message="Nenhuma tarefa cadastrada. Clique em 'Nova Tarefa' ou 'Sugerir com IA' para começar." />
          } @else {
            <div class="table-toolbar">
              <div class="search-box">
                <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" class="search-input" placeholder="Buscar tarefa..."
                  [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                @if (searchQuery()) {
                  <button class="search-clear" type="button" (click)="searchQuery.set('')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                }
              </div>
              <div class="filter-group">
                <label class="filter-label">Ordenar por:</label>
                <select class="filter-select" [ngModel]="ordenarPor()" (ngModelChange)="ordenarPor.set($event)">
                  <option value="titulo">Título</option>
                  <option value="prioridade">Prioridade</option>
                  <option value="status">Status</option>
                  <option value="prazo">Prazo</option>
                </select>
                <button class="sort-dir-btn" type="button" (click)="ordemCrescente.set(!ordemCrescente())" [title]="ordemCrescente() ? 'Ordem decrescente' : 'Ordem crescente'">
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
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>Prazo</th>
                    <th class="th-center">IA</th>
                    <th class="th-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of filteredOrdenados(); track item.id) {
                    <tr [class.row-overdue]="isOverdue(item)">
                      <td class="td-service" data-label="Título">
                        <span class="service-dot" [style.background]="dotColors[$index % dotColors.length]"></span>
                        {{ item.titulo || '—' }}
                      </td>
                      <td data-label="Prioridade"><span class="stg" [class]="prioridadeClasse(item.prioridade)">{{ prioridadeLabel(item.prioridade) }}</span></td>
                      <td data-label="Status"><span class="stg" [class]="statusClasse(item.status)">{{ statusLabel(item.status) }}</span></td>
                      <td class="td-prazo" data-label="Prazo" [class.td-prazo--overdue]="isOverdue(item)">
                        @if (item.prazo) {
                          {{ item.prazo | date:'dd/MM/yyyy' }}
                        } @else {
                          <span style="color: var(--clx-text-muted);">—</span>
                        }
                      </td>
                      <td class="td-center" data-label="IA">
                        @if (item.geradaPorIa) {
                          <span class="stg stg--info" style="text-transform: none;">IA</span>
                        } @else {
                          <span style="color: var(--clx-text-muted);">—</span>
                        }
                      </td>
                      <td class="td-right" data-label="Ações">
                        <div class="actions-cell">
                          <button class="act-btn act-btn--edit" type="button" (click)="editItem(item)" title="Editar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button class="act-btn act-btn--delete" type="button" (click)="deleteItem(item)" title="Excluir">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="5" class="tf-label">Total ({{ filteredOrdenados().length }} tarefa{{ filteredOrdenados().length !== 1 ? 's' : '' }})</td>
                    <td class="td-right tf-value">{{ urgentesFiltradas() }} urgente{{ urgentesFiltradas() !== 1 ? 's' : '' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            @if (filteredOrdenados().length === 0 && searchQuery()) {
              <p class="no-results">Nenhuma tarefa encontrada para "{{ searchQuery() }}".</p>
            }
          }
        </div>
      </div>
    </div>

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <h2>{{ editingId() ? 'Editar tarefa' : 'Nova tarefa' }}</h2>
                <p class="modal-sub">Preencha os dados da tarefa</p>
              </div>
            </div>
            <button class="modal-x" (click)="closeForm()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form (ngSubmit)="salvar()">
            <div class="modal-body">
              <div class="field">
                <label>Título *</label>
                <input [(ngModel)]="form.titulo" name="titulo" required placeholder="Título da tarefa" />
              </div>
              <div class="field">
                <label>Prioridade</label>
                <select [(ngModel)]="form.prioridade" name="prioridade">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div class="field">
                <label>Descrição</label>
                <textarea [(ngModel)]="form.descricao" name="descricao" placeholder="Detalhes da tarefa" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn-save">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDeleteConfirm()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal modal--confirm" (click)="$event.stopPropagation()">
          <div class="confirm-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>Excluir tarefa</h3>
          <p>Tem certeza que deseja excluir a tarefa <strong>{{ deleteTarget()?.titulo }}</strong>?</p>
          <p class="confirm-hint">Essa ação não pode ser desfeita.</p>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
            <button type="button" class="btn-danger" (click)="confirmDelete()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class TarefasPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);

  items = signal<Tarefa[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filtroTab = signal<'todas' | 'pendentes' | 'em_andamento' | 'concluidas'>('todas');
  ordenarPor = signal<'titulo' | 'prioridade' | 'status' | 'prazo'>('prazo');
  ordemCrescente = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  showDeleteConfirm = signal(false);
  deleteTarget = signal<Tarefa | null>(null);
  sugerindo = signal(false);
  form: any = {};

  dotColors = [
    'var(--clx-accent)',
    'var(--clx-purple)',
    'var(--clx-teal)',
    'var(--clx-amber)',
    'var(--clx-cyan)',
    'var(--clx-rose)',
  ];

  total = computed(() => this.items().length);
  concluidas = computed(() => this.items().filter(i => i.status === 'concluida').length);
  emAndamento = computed(() => this.items().filter(i => i.status === 'em_andamento').length);
  urgentes = computed(() => this.items().filter(i => i.prioridade === 'urgente' && i.status !== 'concluida').length);

  filteredItems = computed(() => {
    const tab = this.filtroTab();
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.items();
    if (tab === 'pendentes') list = list.filter(i => i.status === 'pendente');
    else if (tab === 'em_andamento') list = list.filter(i => i.status === 'em_andamento');
    else if (tab === 'concluidas') list = list.filter(i => i.status === 'concluida');
    if (q) list = list.filter(i =>
      (i.titulo || '').toLowerCase().includes(q) ||
      (i.descricao || '').toLowerCase().includes(q)
    );
    return list;
  });

  filteredOrdenados = computed(() => {
    const por = this.ordenarPor();
    const crescente = this.ordemCrescente();
    return [...this.filteredItems()].sort((a, b) => {
      let cmp = 0;
      if (por === 'titulo') cmp = (a.titulo || '').localeCompare(b.titulo || '');
      else if (por === 'prioridade') cmp = prioridadePeso(a.prioridade) - prioridadePeso(b.prioridade);
      else if (por === 'status') cmp = statusPeso(a.status) - statusPeso(b.status);
      else cmp = (a.prazo || '').localeCompare(b.prazo || '');
      return crescente ? cmp : -cmp;
    });
  });

  urgentesFiltradas = computed(() =>
    this.filteredOrdenados().filter(i => i.prioridade === 'urgente' && i.status !== 'concluida').length
  );

  filtroTabLabel = computed(() => {
    const map: Record<string, string> = { todas: 'Todas as tarefas', pendentes: 'Tarefas pendentes', em_andamento: 'Tarefas em andamento', concluidas: 'Tarefas concluídas' };
    return map[this.filtroTab()] || 'Tarefas';
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.listTarefas().subscribe({
      next: (d) => { this.items.set(d || []); this.loading.set(false); },
      error: () => { this.items.set([]); this.loading.set(false); },
    });
  }

  openForm() {
    this.editingId.set(null);
    this.form = { titulo: '', descricao: '', prioridade: 'media', status: 'pendente', prazo: '' };
    this.showForm.set(true);
  }

  editItem(item: Tarefa) {
    this.editingId.set(item.id);
    this.form = {
      titulo: item.titulo || '', descricao: item.descricao || '',
      prioridade: item.prioridade || 'media', status: item.status || 'pendente',
      prazo: item.prazo || '',
    };
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.editingId.set(null); }

  salvar() {
    if (!this.form.titulo) return;
    const req$ = this.editingId()
      ? this.api.updateTarefa(this.editingId()!, this.form)
      : this.api.createTarefa(this.form);
    req$.subscribe({
      next: () => {
        this.toast.show('success', this.editingId() ? 'Tarefa atualizada' : 'Tarefa criada');
        this.closeForm();
        this.load();
      },
      error: () => this.toast.show('error', 'Falha ao salvar tarefa'),
    });
  }

  deleteItem(item: Tarefa) { this.deleteTarget.set(item); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deleteTarget.set(null); }

  confirmDelete() {
    const item = this.deleteTarget();
    if (!item) return;
    this.api.deleteTarefa(item.id).subscribe({
      next: () => { this.toast.show('success', 'Tarefa excluída'); this.cancelDelete(); this.load(); },
      error: () => this.toast.show('error', 'Falha ao excluir tarefa'),
    });
  }

  sugerirTarefas() {
    this.sugerindo.set(true);
    this.toast.show('info', 'Gerando sugestões com IA...');
    this.api.sugerirTarefas().subscribe({
      next: () => {
        this.toast.show('success', 'Tarefas sugeridas criadas');
        this.sugerindo.set(false);
        this.load();
      },
      error: () => {
        this.toast.show('error', 'Falha ao sugerir tarefas');
        this.sugerindo.set(false);
      },
    });
  }

  isOverdue(item: Tarefa): boolean {
    if (!item.prazo || item.status === 'concluida') return false;
    return new Date(item.prazo) < new Date();
  }

  prioridadeClasse(p: string): string { return PRIORIDADE_CLASS[p] || 'stg--neutral'; }
  prioridadeLabel(p: string): string { return PRIORIDADE_LABEL[p] || p; }
  statusClasse(s: string): string { return STATUS_CLASS[s] || 'stg--neutral'; }
  statusLabel(s: string): string { return STATUS_LABEL[s] || s; }

  exportCsv() {
    let csv = 'Título,Prioridade,Status,Prazo,IA\n';
    for (const t of this.items()) {
      csv += `${t.titulo || ''},${this.prioridadeLabel(t.prioridade)},${this.statusLabel(t.status)},${t.prazo || ''},${t.geradaPorIa ? 'Sim' : 'Não'}\n`;
    }
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tarefas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

function prioridadePeso(p: string): number {
  const w: Record<string, number> = { baixa: 1, media: 2, alta: 3, urgente: 4 };
  return w[p] || 0;
}

function statusPeso(s: string): number {
  const w: Record<string, number> = { pendente: 1, em_andamento: 2, concluida: 3 };
  return w[s] || 0;
}
