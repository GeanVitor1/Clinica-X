import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PacienteService } from '../../pacientes/services/paciente.service';

@Component({
  selector: 'app-injetaveis-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
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
    .header-subtitle { font-size: 0.82rem; color: var(--clx-text-tertiary); font-weight: 500; }
    .header-actions { display: flex; gap: 8px; }

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

    /* ── KPI ── */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    .kpi-card {
      background: var(--clx-surface-1); border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg); padding: 18px 20px;
      display: flex; align-items: center; gap: 14px; transition: all var(--clx-transition-fast);
    }
    .kpi-card:hover { border-color: var(--clx-border-strong); box-shadow: var(--clx-shadow-sm); transform: translateY(-2px); }
    .kpi-icon {
      width: 44px; height: 44px; border-radius: var(--clx-radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff;
    }
    .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-label { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550; text-transform: uppercase; letter-spacing: 0.03em; }
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; }

    /* ── Panel ── */
    .panel {
      background: var(--clx-card-bg, var(--clx-surface-1)); border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-2xl, 16px); padding: 24px; margin-bottom: 24px;
      box-shadow: var(--clx-shadow-card, 0 2px 12px rgba(0,0,0,0.03));
    }
    .panel h2 { font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700; }
    .panel-subtitle { font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0; }

    /* ── Controls ── */
    .controls-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; }
    .tab-group {
      display: flex; gap: 4px; background: var(--clx-surface-3);
      padding: 4px; border-radius: var(--clx-radius-md);
    }
    .tab {
      padding: 8px 20px; border: none; background: transparent; border-radius: var(--clx-radius-sm);
      cursor: pointer; font-size: 0.84rem; color: var(--clx-text-secondary); font-weight: 500;
      font-family: var(--clx-font); transition: all var(--clx-transition-fast);
      display: inline-flex; align-items: center; gap: 7px; line-height: 1;
    }
    .tab:hover { color: var(--clx-text-primary); }
    .tab--active { background: var(--clx-surface-1); color: var(--clx-text-primary); font-weight: 650; box-shadow: var(--clx-shadow-xs); }

    /* ── Table Toolbar ── */
    .table-toolbar {
      display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
      padding: 16px 20px; background: var(--clx-surface-2); border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg); flex-wrap: wrap;
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
    .no-results { text-align: center; padding: 20px; color: var(--clx-text-muted); font-size: 0.88rem; }

    /* ── Table ── */
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
    .td-center { text-align: center; }
    .td-right { text-align: right; }

    /* ── Progress bar ── */
    .progress-cell { min-width: 120px; }
    .progress-bar { display: flex; align-items: center; gap: 10px; }
    .progress-track {
      flex: 1; height: 8px; background: var(--clx-surface-3);
      border-radius: 999px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, var(--clx-accent), var(--clx-teal));
      transition: width 0.5s var(--clx-ease-out);
    }
    .progress-text { font-size: 0.76rem; font-weight: 650; color: var(--clx-text-secondary); white-space: nowrap; }

    /* ── Status ── */
    .stg {
      display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
      border-radius: var(--clx-radius-badge, 6px); font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.02em; line-height: 1.4; text-transform: capitalize;
    }
    .stg--positive { background: var(--clx-success-muted, rgba(16, 185, 129, 0.15)); color: var(--clx-success, #10b981); }
    .stg--negative { background: var(--clx-error-muted, rgba(239, 68, 68, 0.15)); color: var(--clx-error, #ef4444); }
    .stg--warn     { background: var(--clx-warning-muted, rgba(245, 158, 11, 0.15)); color: var(--clx-warning, #f59e0b); }
    .stg--neutral  { background: var(--clx-bg-alt, #f1f5f9); color: var(--clx-text-muted, #64748b); }

    /* ── Actions ── */
    .actions-cell { display: flex; gap: 6px; justify-content: flex-end; }
    .act-btn {
      width: 32px; height: 32px; border-radius: var(--clx-radius-sm); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--clx-border); background: var(--clx-surface-1);
      color: var(--clx-text-secondary); transition: all var(--clx-transition-fast);
    }
    .act-btn--edit:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .act-btn--delete:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }

    /* ── Form ── */
    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px; margin-bottom: 18px;
    }
    .form-grid label {
      display: flex; flex-direction: column; gap: 5px;
      font-size: 0.8rem; font-weight: 600; color: var(--clx-text-secondary);
    }
    .form-grid input, .form-grid select {
      border: 1px solid var(--clx-border-strong); border-radius: var(--clx-radius-md);
      padding: 10px 13px; background: var(--clx-surface-2); font-size: 0.9rem;
      color: var(--clx-text); font-family: var(--clx-font); outline: none;
      transition: all var(--clx-transition-fast);
    }
    .form-grid input:focus, .form-grid select:focus {
      border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .form-grid .fw { grid-column: 1 / -1; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
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

    /* ── Empty ── */
    .empty-wrap {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 56px 24px; text-align: center;
    }
    .empty-wrap svg { width: 140px; height: 140px; opacity: 0.25; margin-bottom: 20px; }
    .empty-wrap h4 { margin: 0 0 6px; font-size: 1.05rem; font-weight: 700; color: var(--clx-text-primary); }
    .empty-wrap p { margin: 0; color: var(--clx-text-muted); font-size: 0.85rem; max-width: 360px; line-height: 1.5; }

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
      background: linear-gradient(135deg, var(--clx-teal), #065f46);
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
    .field input, .field select {
      padding: 10px 13px; border: 1px solid var(--clx-border-strong); border-radius: 10px;
      background: var(--clx-surface-2); color: var(--clx-text); font-size: .87rem;
      font-family: var(--clx-font); outline: none; transition: all .2s;
    }
    .field input:focus, .field select:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .modal-footer {
      display: flex; gap: 10px; justify-content: flex-end; padding: 16px 26px; border-top: 1px solid var(--clx-border);
    }

    /* ── Delete Modal ── */
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

    @media (max-width: 700px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .table-wrap { overflow-x: visible; }
      .report-table thead { display: none; }
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
      .form-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 14px; }
    }
    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .report-table tbody td { font-size: 0.72rem; }
    }
  `],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Planejador de Injetáveis</h1>
          <span class="header-subtitle">Protocolos, sessões e próxima aplicação</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="openForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Protocolo
          </button>
        </div>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-teal), #065f46)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Total</span>
            <span class="kpi-value">{{ total() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-success), #064e3b)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Concluídos</span>
            <span class="kpi-value">{{ concluidos() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-amber), #92400e)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Em andamento</span>
            <span class="kpi-value">{{ emAndamento() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-cyan), var(--clx-accent))">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Próximas sessões</span>
            <span class="kpi-value">{{ proximas() }}</span>
          </div>
        </div>
      </div>

      <div class="controls-bar">
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'todos'" (click)="filtroTab.set('todos')">Todos</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'em andamento'" (click)="filtroTab.set('em andamento')">Em andamento</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'concluido'" (click)="filtroTab.set('concluido')">Concluídos</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'pausado'" (click)="filtroTab.set('pausado')">Pausados</button>
        </div>
      </div>

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
            </svg>
            <h4>Nenhum protocolo cadastrado</h4>
            <p>Clique em "Novo Protocolo" para começar.</p>
          </div>
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar por substância, protocolo ou paciente..."
                [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
              @if (searchQuery()) {
                <button class="search-clear" type="button" (click)="searchQuery.set('')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              }
            </div>
          </div>

          <div class="table-wrap">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Substância</th>
                  <th>Protocolo</th>
                  <th>Paciente</th>
                  <th class="th-center">Progresso</th>
                  <th class="th-center">Status</th>
                  <th>Próxima sessão</th>
                  <th class="th-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredItems(); track item.id) {
                  <tr>
                    <td data-label="Substância" style="font-weight: 650;">{{ item.substancia || '—' }}</td>
                    <td data-label="Protocolo">{{ item.protocolo || '—' }}</td>
                    <td data-label="Paciente">{{ item.pacienteNome || '—' }}</td>
                    <td class="td-center" data-label="Progresso">
                      <div class="progress-cell">
                        <div class="progress-bar">
                          <div class="progress-track">
                            <div class="progress-fill" [style.width.%]="progressPercent(item)"></div>
                          </div>
                          <span class="progress-text">{{ item.sessoesRealizadas || 0 }}/{{ item.totalSessoes || 0 }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="td-center" data-label="Status">
                      <span class="stg" [class]="statusStyle(item.status)">{{ item.status || '—' }}</span>
                    </td>
                    <td data-label="Próxima sessão">{{ item.proximaSessao ? (item.proximaSessao | date:'dd/MM/yyyy') : '—' }}</td>
                    <td class="td-right">
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
            </table>
          </div>
          @if (filteredItems().length === 0 && searchQuery()) {
            <p class="no-results">Nenhum protocolo encontrado para "{{ searchQuery() }}".</p>
          }
        }
      </div>
    </div>

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div>
                <h2>{{ editingId() ? 'Editar protocolo' : 'Novo protocolo' }}</h2>
                <p class="modal-sub">Preencha os dados do injetável</p>
              </div>
            </div>
            <button class="modal-x" (click)="closeForm()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form (ngSubmit)="salvar()">
            <div class="modal-body">
              <div class="field">
                <label>Paciente *</label>
                <select [(ngModel)]="form.pacienteId" name="pacienteId" required>
                  <option value="">Selecione o paciente</option>
                  @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                </select>
              </div>
              <div class="field">
                <label>Substância *</label>
                <input [(ngModel)]="form.substancia" name="substancia" required placeholder="Ex: Ácido hialurônico" />
              </div>
              <div class="field">
                <label>Protocolo</label>
                <input [(ngModel)]="form.protocolo" name="protocolo" placeholder="Nome do protocolo" />
              </div>
              <div class="field">
                <label>Área de aplicação</label>
                <input [(ngModel)]="form.areaAplicacao" name="areaAplicacao" placeholder="Ex: Malar, Lábios" />
              </div>
              <div class="form-grid" style="margin-bottom: 0;">
                <div class="field">
                  <label>Total de sessões</label>
                  <input type="number" [(ngModel)]="form.totalSessoes" name="totalSessoes" min="1" />
                </div>
                <div class="field">
                  <label>Intervalo (dias)</label>
                  <input type="number" [(ngModel)]="form.intervaloDias" name="intervaloDias" min="1" />
                </div>
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
          <h3>Excluir protocolo</h3>
          <p>Tem certeza que deseja excluir o protocolo de <strong>{{ deleteTarget()?.substancia }}</strong>?</p>
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
export class InjetaveisPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly pacientesApi = inject(PacienteService);

  items = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  searchQuery = signal('');
  filtroTab = signal<string>('todos');
  showForm = signal(false);
  editingId = signal<string | null>(null);
  showDeleteConfirm = signal(false);
  deleteTarget = signal<any>(null);

  form = { pacienteId: '', substancia: '', protocolo: '', areaAplicacao: '', totalSessoes: 3, intervaloDias: 30 };

  total = computed(() => this.items().length);
  concluidos = computed(() => this.items().filter(i => {
    const s = (i.status || '').toLowerCase();
    return s.includes('conclu') || s.includes('finaliz');
  }).length);
  emAndamento = computed(() => this.items().filter(i => {
    const s = (i.status || '').toLowerCase();
    return s.includes('andamento') || s.includes('ativo');
  }).length);
  proximas = computed(() => this.items().filter(i => i.proximaSessao).length);

  filteredItems = computed(() => {
    const tab = this.filtroTab();
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.items();
    if (tab !== 'todos') list = list.filter(i => (i.status || '').toLowerCase().includes(tab));
    if (q) list = list.filter(i => {
      return (i.substancia || '').toLowerCase().includes(q)
        || (i.protocolo || '').toLowerCase().includes(q)
        || (i.pacienteNome || '').toLowerCase().includes(q);
    });
    return list;
  });

  ngOnInit() {
    this.load();
    this.pacientesApi.getAll('', 1, 100).subscribe({
      next: (r: any) => this.pacientes.set(r.items || r || []),
    });
  }

  load() {
    this.api.listInjetaveis().subscribe({
      next: (d) => this.items.set(d || []),
      error: () => this.items.set([]),
    });
  }

  openForm() {
    this.editingId.set(null);
    this.form = { pacienteId: this.pacientes()[0]?.id || '', substancia: '', protocolo: '', areaAplicacao: '', totalSessoes: 3, intervaloDias: 30 };
    this.showForm.set(true);
  }

  editItem(item: any) {
    this.editingId.set(item.id);
    this.form = {
      pacienteId: item.pacienteId || '', substancia: item.substancia || '',
      protocolo: item.protocolo || '', areaAplicacao: item.areaAplicacao || '',
      totalSessoes: item.totalSessoes || 3, intervaloDias: item.intervaloDias || 30,
    };
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.editingId.set(null); }

  salvar() {
    if (!this.form.pacienteId || !this.form.substancia) return;
    const req$ = this.editingId()
      ? this.api.updateInjetavel(this.editingId()!, this.form)
      : this.api.createInjetavel(this.form);
    req$.subscribe({
      next: () => {
        this.toast.show('success', this.editingId() ? 'Protocolo atualizado' : 'Protocolo criado');
        this.showForm.set(false); this.load();
      },
      error: () => this.toast.show('error', 'Falha ao salvar'),
    });
  }

  deleteItem(item: any) { this.deleteTarget.set(item); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deleteTarget.set(null); }
  confirmDelete() {
    const item = this.deleteTarget();
    if (!item) return;
    this.api.deleteInjetavel(item.id).subscribe({
      next: () => { this.toast.show('success', 'Protocolo excluído'); this.cancelDelete(); this.load(); },
      error: () => this.toast.show('error', 'Falha ao excluir'),
    });
  }

  progressPercent(item: any): number {
    const total = item.totalSessoes || 1;
    const done = item.sessoesRealizadas || 0;
    return Math.min((done / total) * 100, 100);
  }

  statusStyle(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('conclu') || s.includes('finaliz')) return 'stg--positive';
    if (s.includes('cancel')) return 'stg--negative';
    if (s.includes('pausa')) return 'stg--warn';
    return 'stg--neutral';
  }
}
