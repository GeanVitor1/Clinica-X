import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PacienteService } from '../../pacientes/services/paciente.service';

@Component({
  selector: 'app-telemedicina-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 0 12px; }

    /* ── Header ── */
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

    .btn-export {
      padding: 9px 16px;
      background: var(--clx-surface-1);
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
    .btn-export:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
      background: var(--clx-accent-muted);
      box-shadow: var(--clx-shadow-sm);
      transform: translateY(-1px);
    }

    /* ── KPI Grid ── */
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
      flex-shrink: 0; color: #fff;
    }
    .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-label { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550; text-transform: uppercase; letter-spacing: 0.03em; }
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ── Panel ── */
    .panel {
      background: var(--clx-card-bg, var(--clx-surface-1));
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-2xl, 16px);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--clx-shadow-card, 0 2px 12px rgba(0,0,0,0.03));
    }
    .panel h2 {
      font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;
    }
    .panel-subtitle {
      font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;
    }

    /* ── Controls Bar ── */
    .controls-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 14px;
    }
    .tab-group {
      display: flex; gap: 4px;
      background: var(--clx-surface-3);
      padding: 4px; border-radius: var(--clx-radius-md);
    }
    .tab {
      padding: 8px 20px;
      border: none;
      background: transparent;
      border-radius: var(--clx-radius-sm);
      cursor: pointer;
      font-size: 0.84rem;
      color: var(--clx-text-secondary);
      font-weight: 500;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex; align-items: center; gap: 7px;
      line-height: 1;
    }
    .tab:hover { color: var(--clx-text-primary); }
    .tab--active {
      background: var(--clx-surface-1);
      color: var(--clx-text-primary);
      font-weight: 650;
      box-shadow: var(--clx-shadow-xs);
    }

    /* ── Table Toolbar ── */
    .table-toolbar {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 18px; padding: 16px 20px;
      background: var(--clx-surface-2); border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg); flex-wrap: wrap;
    }
    .search-box { position: relative; flex: 1; min-width: 260px; }
    .search-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--clx-text-muted); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 12px 42px 12px 42px;
      border: 1px solid var(--clx-border-strong); border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1); color: var(--clx-text-primary);
      font-size: 0.92rem; font-family: var(--clx-font); font-weight: 500;
      outline: none; transition: border-color var(--clx-transition-fast), box-shadow var(--clx-transition-fast);
    }
    .search-input::placeholder { color: var(--clx-text-muted); font-weight: 400; }
    .search-input:focus {
      border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .search-clear {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; color: var(--clx-text-muted);
      cursor: pointer; border-radius: var(--clx-radius-sm);
      transition: all var(--clx-transition-fast);
    }
    .search-clear:hover { background: var(--clx-surface-3); color: var(--clx-text-primary); }
    .no-results {
      text-align: center; padding: 20px; color: var(--clx-text-muted); font-size: 0.88rem;
    }

    /* ── Table ── */
    .table-wrap { overflow-x: auto; }
    .report-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .report-table thead th {
      text-align: left; padding: 10px 16px;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--clx-text-muted);
      border-bottom: 2px solid var(--clx-border-strong); white-space: nowrap;
    }
    .report-table thead th.th-center { text-align: center; }
    .report-table thead th.th-right { text-align: right; }
    .report-table tbody tr {
      border-bottom: 1px solid var(--clx-border); transition: background .15s;
    }
    .report-table tbody tr:hover { background: var(--clx-surface-2); }
    .report-table tbody td {
      padding: 14px 16px; color: var(--clx-text-primary); vertical-align: middle;
    }
    .td-center { text-align: center; }
    .td-right { text-align: right; }

    /* ── Status tags ── */
    .stg {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: var(--clx-radius-badge, 6px);
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.02em;
      line-height: 1.4; text-transform: capitalize;
    }
    .stg--positive { background: var(--clx-success-muted, rgba(16, 185, 129, 0.15)); color: var(--clx-success, #10b981); }
    .stg--negative { background: var(--clx-error-muted, rgba(239, 68, 68, 0.15)); color: var(--clx-error, #ef4444); }
    .stg--warn     { background: var(--clx-warning-muted, rgba(245, 158, 11, 0.15)); color: var(--clx-warning, #f59e0b); }
    .stg--neutral  { background: var(--clx-bg-alt, #f1f5f9); color: var(--clx-text-muted, #64748b); }

    /* ── Actions ── */
    .actions-cell { display: flex; gap: 6px; justify-content: flex-end; }
    .act-btn {
      width: 32px; height: 32px; border-radius: var(--clx-radius-sm);
      cursor: pointer; font-family: var(--clx-font);
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--clx-border); background: var(--clx-surface-1);
      color: var(--clx-text-secondary); transition: all var(--clx-transition-fast);
    }
    .act-btn--join:hover { border-color: var(--clx-accent); color: var(--clx-accent); background: var(--clx-accent-muted); }
    .act-btn--status:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

    /* ── Form ── */
    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px; margin-bottom: 18px;
    }
    .form-grid label {
      display: flex; flex-direction: column; gap: 5px;
      font-size: 0.8rem; font-weight: 600; color: var(--clx-text-secondary);
    }
    .form-grid input, .form-grid select, .form-grid textarea {
      border: 1px solid var(--clx-border-strong); border-radius: var(--clx-radius-md);
      padding: 10px 13px; background: var(--clx-surface-2); font-size: 0.9rem;
      color: var(--clx-text); font-family: var(--clx-font); outline: none;
      transition: all var(--clx-transition-fast);
    }
    .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus {
      border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .form-grid .fw { grid-column: 1 / -1; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
    .btn-cancel {
      padding: 10px 20px; background: transparent; color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong); border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 500; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-cancel:hover { border-color: var(--clx-text-tertiary); color: var(--clx-text-primary); }
    .btn-save {
      padding: 10px 20px; background: var(--clx-accent); color: #fff;
      border: none; border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 600; font-family: var(--clx-font);
      transition: all .2s; display: inline-flex; align-items: center; gap: 7px;
    }
    .btn-save:hover { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); }

    /* ── Empty state ── */
    .empty-wrap {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 56px 24px; text-align: center;
    }
    .empty-wrap svg { width: 140px; height: 140px; opacity: 0.25; margin-bottom: 20px; }
    .empty-wrap h4 { margin: 0 0 6px; font-size: 1.05rem; font-weight: 700; color: var(--clx-text-primary); }
    .empty-wrap p { margin: 0; color: var(--clx-text-muted); font-size: 0.85rem; max-width: 360px; line-height: 1.5; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      backdrop-filter: blur(6px); display: flex; align-items: center;
      justify-content: center; z-index: 2000; animation: fadeIn .15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      background: var(--clx-surface-1); border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-lg); width: 92%; max-width: 480px;
      box-shadow: 0 4px 16px rgba(0,0,0,.08);
      animation: modalIn .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .modal-top {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 24px 26px 0;
    }
    .modal-top-left { display: flex; align-items: flex-start; gap: 13px; }
    .modal-deco {
      width: 40px; height: 40px; border-radius: 11px;
      background: linear-gradient(135deg, var(--clx-cyan), var(--clx-accent));
      color: #fff; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .modal-top-left h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--clx-text); }
    .modal-sub { margin: 3px 0 0; font-size: .78rem; color: var(--clx-text-muted); }
    .modal-x {
      width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--clx-border);
      background: var(--clx-bg); color: var(--clx-text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s; flex-shrink: 0;
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
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 16px 26px; border-top: 1px solid var(--clx-border);
    }

    /* ── Status Modal ── */
    .status-options { display: flex; flex-direction: column; gap: 8px; }
    .status-opt {
      padding: 12px 16px; border: 1px solid var(--clx-border); border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1); cursor: pointer;
      transition: all var(--clx-transition-fast); display: flex; align-items: center; gap: 10px;
    }
    .status-opt:hover { border-color: var(--clx-accent); background: var(--clx-accent-muted); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
      .filter-select { min-width: 0; flex: 1; }
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
      .report-table tbody td.actions-cell,
      .report-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .panel { padding: 14px; }
      .form-grid { grid-template-columns: 1fr; }
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
          <h1>Telemedicina</h1>
          <span class="header-subtitle">Salas virtuais e teleconsultas</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="openForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova Teleconsulta
          </button>
        </div>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-cyan), var(--clx-accent))">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
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
            <span class="kpi-label">Confirmadas</span>
            <span class="kpi-value">{{ confirmadas() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-amber), #92400e)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Aguardando</span>
            <span class="kpi-value">{{ aguardando() }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-error), #991b1b)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Canceladas</span>
            <span class="kpi-value">{{ canceladas() }}</span>
          </div>
        </div>
      </div>

      <div class="controls-bar">
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'todos'" (click)="filtroTab.set('todos')">Todos</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'agendada'" (click)="filtroTab.set('agendada')">Agendadas</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'confirmada'" (click)="filtroTab.set('confirmada')">Confirmadas</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'em andamento'" (click)="filtroTab.set('em andamento')">Em andamento</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'concluida'" (click)="filtroTab.set('concluida')">Concluídas</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'cancelada'" (click)="filtroTab.set('cancelada')">Canceladas</button>
        </div>
      </div>

      <div class="panel">
        @if (teleconsultas().length === 0) {
          <div class="empty-wrap">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="30" width="120" height="140" rx="16" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <rect x="54" y="58" width="92" height="8" rx="4" fill="currentColor" opacity="0.15"/>
              <rect x="54" y="76" width="64" height="6" rx="3" fill="currentColor" opacity="0.1"/>
              <rect x="54" y="90" width="76" height="6" rx="3" fill="currentColor" opacity="0.1"/>
              <circle cx="100" cy="40" r="22" fill="currentColor" opacity="0.06"/>
              <path d="M92 40h16M100 32v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.2"/>
            </svg>
            <h4>Nenhuma teleconsulta</h4>
            <p>Clique em "Nova Teleconsulta" para agendar.</p>
          </div>
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar por paciente, status ou observação..."
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
                  <th>Data/Hora</th>
                  <th>Paciente</th>
                  <th class="th-center">Status</th>
                  <th>Observações</th>
                  <th class="th-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (t of filteredItems(); track t.id) {
                  <tr>
                    <td data-label="Data/Hora">{{ t.dataHoraInicio | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td data-label="Paciente">{{ t.pacienteNome || '—' }}</td>
                    <td class="td-center" data-label="Status">
                      <span class="stg" [class]="statusStyle(t.status)">{{ t.status || '—' }}</span>
                    </td>
                    <td data-label="Observações">{{ t.observacoes || '—' }}</td>
                    <td class="td-right" data-label="Ações">
                      <div class="actions-cell">
                        @if (t.linkSala) {
                          <a class="act-btn act-btn--join" [href]="t.linkSala" target="_blank" title="Entrar na sala">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                          </a>
                        }
                        <button class="act-btn act-btn--status" type="button" (click)="openStatusModal(t)" title="Alterar status">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (filteredItems().length === 0 && searchQuery()) {
            <p class="no-results">Nenhuma teleconsulta encontrada para "{{ searchQuery() }}".</p>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div>
                <h2>Nova Teleconsulta</h2>
                <p class="modal-sub">Agende uma nova teleconsulta</p>
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
                <label>Data e hora *</label>
                <input type="datetime-local" [(ngModel)]="form.dataHoraInicio" name="dataHoraInicio" required />
              </div>
              <div class="field">
                <label>Observações</label>
                <input [(ngModel)]="form.observacoes" name="observacoes" placeholder="Notas da teleconsulta..." />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn-save">Agendar</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showStatusModal()) {
      <div class="modal-overlay" (click)="closeStatusModal()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width: 360px;">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h2>Alterar Status</h2>
                <p class="modal-sub">{{ statusTarget()?.pacienteNome || 'Teleconsulta' }}</p>
              </div>
            </div>
            <button class="modal-x" (click)="closeStatusModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="status-options">
              @for (s of statusOptions; track s) {
                <div class="status-opt" (click)="changeStatus(s)">
                  <span class="status-dot" [style.background]="statusColor(s)"></span>
                  <span style="font-size: 0.88rem; font-weight: 500; color: var(--clx-text-primary);">{{ s }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class TelemedicinaPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly pacientesApi = inject(PacienteService);

  teleconsultas = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  searchQuery = signal('');
  filtroTab = signal<string>('todos');
  showForm = signal(false);
  showStatusModal = signal(false);
  statusTarget = signal<any>(null);

  form = { pacienteId: '', dataHoraInicio: '', observacoes: '' };
  statusOptions = ['agendada', 'confirmada', 'em andamento', 'concluida', 'cancelada'];

  total = computed(() => this.teleconsultas().length);
  confirmadas = computed(() => this.teleconsultas().filter(t => t.status === 'confirmada').length);
  aguardando = computed(() => this.teleconsultas().filter(t => t.status === 'agendada').length);
  canceladas = computed(() => this.teleconsultas().filter(t => t.status === 'cancelada').length);

  filteredItems = computed(() => {
    const tab = this.filtroTab();
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.teleconsultas();
    if (tab !== 'todos') list = list.filter(t => t.status === tab);
    if (q) list = list.filter(t => {
      return (t.pacienteNome || '').toLowerCase().includes(q)
        || (t.status || '').toLowerCase().includes(q)
        || (t.observacoes || '').toLowerCase().includes(q);
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
    this.api.listTeleconsultas().subscribe({
      next: (d) => this.teleconsultas.set(d || []),
      error: () => this.teleconsultas.set([]),
    });
  }

  openForm() { this.form = { pacienteId: '', dataHoraInicio: '', observacoes: '' }; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }

  salvar() {
    if (!this.form.pacienteId || !this.form.dataHoraInicio) return;
    this.api.createTeleconsulta({
      pacienteId: this.form.pacienteId,
      dataHoraInicio: new Date(this.form.dataHoraInicio).toISOString(),
      observacoes: this.form.observacoes,
    }).subscribe({
      next: () => { this.toast.show('success', 'Teleconsulta agendada'); this.showForm.set(false); this.load(); },
      error: () => this.toast.show('error', 'Falha ao agendar'),
    });
  }

  openStatusModal(t: any) { this.statusTarget.set(t); this.showStatusModal.set(true); }
  closeStatusModal() { this.showStatusModal.set(false); this.statusTarget.set(null); }

  changeStatus(status: string) {
    const t = this.statusTarget();
    if (!t) return;
    this.api.updateTeleStatus(t.id, status).subscribe({
      next: () => {
        this.toast.show('success', 'Status atualizado');
        this.closeStatusModal();
        this.load();
      },
      error: () => this.toast.show('error', 'Falha ao atualizar status'),
    });
  }

  statusStyle(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'confirmada' || s === 'concluida') return 'stg--positive';
    if (s === 'cancelada') return 'stg--negative';
    if (s === 'agendada') return 'stg--warn';
    if (s === 'em andamento') return 'stg--neutral';
    return 'stg--neutral';
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      agendada: '#f59e0b', confirmada: '#10b981',
      'em andamento': '#3b82f6', concluida: '#10b981', cancelada: '#ef4444',
    };
    return map[status] || '#64748b';
  }
}
