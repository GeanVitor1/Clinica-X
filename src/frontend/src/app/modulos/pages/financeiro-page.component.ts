import { Component, OnInit, inject, signal, computed, ElementRef, viewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-financeiro-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
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
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; font-variant-numeric: tabular-nums; }

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
    .tab-group { display: flex; gap: 4px; background: var(--clx-surface-3); padding: 4px; border-radius: var(--clx-radius-md); }
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
    .td-right { text-align: right; font-variant-numeric: tabular-nums; }
    .td-valor { font-weight: 750; font-size: 0.92rem; }

    .report-table tfoot tr { border-top: 2px solid var(--clx-border-strong); background: linear-gradient(135deg, var(--clx-accent-muted), var(--clx-purple-muted)); }
    .report-table tfoot td { padding: 14px 16px; }
    .tf-label { font-weight: 650; color: var(--clx-text-primary); }
    .tf-value { font-size: 1.05rem; font-weight: 750; color: var(--clx-accent); text-align: right; }

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
    .stg--tipo-receita { background: var(--clx-success-muted); color: var(--clx-success); }
    .stg--tipo-despesa { background: var(--clx-error-muted); color: var(--clx-error); }
    .stg--pago { background: var(--clx-success-muted); color: var(--clx-success); }
    .stg--pendente { background: var(--clx-warning-muted); color: var(--clx-warning); }

    /* ── Chart ── */
    .chart-wrap { min-height: 300px; }

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
      background: linear-gradient(135deg, var(--clx-success), #064e3b);
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
    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;
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

    .kpi-card.receita .kpi-icon { background: linear-gradient(135deg, var(--clx-success), #064e3b); }
    .kpi-card.receita .kpi-value { color: var(--clx-success); }
    .kpi-card.despesa .kpi-icon { background: linear-gradient(135deg, var(--clx-error), #991b1b); }
    .kpi-card.despesa .kpi-value { color: var(--clx-error); }
    .kpi-card.saldo .kpi-icon { background: linear-gradient(135deg, var(--clx-accent), #004d40); }
    .kpi-card.saldo .kpi-value { color: var(--clx-accent); }
    .kpi-card.saldo .kpi-value.neg { color: var(--clx-error); }
    .kpi-card.pendente .kpi-icon { background: linear-gradient(135deg, var(--clx-amber), #92400e); }
    .kpi-card.pendente .kpi-value { color: var(--clx-amber); }

    /* ── Table valor colors ── */
    .td-receita { color: var(--clx-success) !important; font-weight: 750 !important; }
    .td-despesa { color: var(--clx-error) !important; font-weight: 750 !important; }
    .tf-receita { color: var(--clx-success) !important; }
    .tf-despesa { color: var(--clx-error) !important; }

    @media (max-width: 700px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
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
          <h1>Financeiro</h1>
          <span class="header-subtitle">Receitas, despesas e saldo da clínica</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="showForm.set(true)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Lançamento
          </button>
        </div>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card receita">
          <div class="kpi-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Receitas</span>
            <span class="kpi-value">{{ resumo()?.totalReceitas || 0 | currency:'BRL' }}</span>
          </div>
        </div>
        <div class="kpi-card despesa">
          <div class="kpi-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Despesas</span>
            <span class="kpi-value">{{ resumo()?.totalDespesas || 0 | currency:'BRL' }}</span>
          </div>
        </div>
        <div class="kpi-card saldo">
          <div class="kpi-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Saldo</span>
            <span class="kpi-value" [class.neg]="(resumo()?.saldo || 0) < 0">{{ resumo()?.saldo || 0 | currency:'BRL' }}</span>
          </div>
        </div>
        <div class="kpi-card pendente">
          <div class="kpi-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">A receber</span>
            <span class="kpi-value">{{ resumo()?.receitasPendentes || 0 | currency:'BRL' }}</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>Receitas vs Despesas</h2>
        <p class="panel-subtitle">Últimos 6 meses</p>
        <div #chartRef class="chart-wrap"></div>
      </div>

      <div class="controls-bar">
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'todos'" (click)="filtroTab.set('todos')">Todos</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'Receita'" (click)="filtroTab.set('Receita')">Receitas</button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'Despesa'" (click)="filtroTab.set('Despesa')">Despesas</button>
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
            <h4>Nenhum lançamento</h4>
            <p>Clique em "Novo Lançamento" para começar.</p>
          </div>
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar por descrição, categoria ou forma de pagamento..."
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
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th class="th-center">Tipo</th>
                  <th class="th-center">Status</th>
                  <th>Pagamento</th>
                  <th class="th-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                @for (l of filteredItems(); track l.id) {
                  <tr>
                    <td data-label="Data">{{ l.data | date:'dd/MM/yyyy' }}</td>
                    <td data-label="Descrição" style="font-weight: 650;">{{ l.descricao || 'Sem descrição' }}</td>
                    <td data-label="Categoria">{{ l.categoria || '—' }}</td>
                    <td class="td-center" data-label="Tipo">
                      <span class="stg stg--tipo-receita" [class.stg--tipo-despesa]="l.tipo === 'Despesa'">{{ l.tipo }}</span>
                    </td>
                    <td class="td-center" data-label="Status">
                      <span class="stg stg--pago" [class.stg--pendente]="l.status === 'Pendente'">{{ l.status }}</span>
                    </td>
                    <td data-label="Pagamento">{{ l.formaPagamento || '—' }}</td>
                    <td class="td-right td-valor" data-label="Valor" [class.td-receita]="l.tipo === 'Receita'" [class.td-despesa]="l.tipo === 'Despesa'">
                      {{ l.valor | currency:'BRL' }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="tf-label">Total ({{ filteredItems().length }} registro{{ filteredItems().length !== 1 ? 's' : '' }})</td>
                  <td class="tf-value" [class.tf-receita]="totalIsPositive()" [class.tf-despesa]="!totalIsPositive()">{{ totalFiltrado() | currency:'BRL' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          @if (filteredItems().length === 0 && searchQuery()) {
            <p class="no-results">Nenhum lançamento encontrado para "{{ searchQuery() }}".</p>
          }
        }
      </div>
    </div>

    @if (showForm()) {
      <div class="modal-overlay" (click)="showForm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <h2>Novo lançamento</h2>
                <p class="modal-sub">Registre uma receita ou despesa</p>
              </div>
            </div>
            <button class="modal-x" (click)="showForm.set(false)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form (ngSubmit)="salvar()">
            <div class="modal-body">
              <div class="form-grid">
                <label>Tipo
                  <select [(ngModel)]="form.tipo" name="tipo"><option>Receita</option><option>Despesa</option></select>
                </label>
                <label>Status
                  <select [(ngModel)]="form.status" name="status"><option>Pago</option><option>Pendente</option></select>
                </label>
                <label>Descrição <input [(ngModel)]="form.descricao" name="descricao" placeholder="Ex: Consulta retorno" /></label>
                <label>Categoria <input [(ngModel)]="form.categoria" name="categoria" placeholder="Ex: Procedimentos" /></label>
                <label>Valor (R$) <input type="number" [(ngModel)]="form.valor" name="valor" placeholder="0,00" /></label>
                <label>Forma de pagamento <input [(ngModel)]="form.formaPagamento" name="formaPagamento" placeholder="PIX / Dinheiro / Cartão" /></label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showForm.set(false)">Cancelar</button>
              <button type="submit" class="btn-save">Salvar lançamento</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class FinanceiroPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);

  readonly chartRef = viewChild<ElementRef>('chartRef');

  items = signal<any[]>([]);
  resumo = signal<any>(null);
  showForm = signal(false);
  searchQuery = signal('');
  filtroTab = signal<string>('todos');
  form = { tipo: 'Receita', categoria: '', descricao: '', valor: 0, status: 'Pago', formaPagamento: 'PIX' };
  private chartInstance: any = null;

  filteredItems = computed(() => {
    const tab = this.filtroTab();
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.items();
    if (tab !== 'todos') list = list.filter(l => l.tipo === tab);
    if (q) list = list.filter(l => {
      return (l.descricao || '').toLowerCase().includes(q)
        || (l.categoria || '').toLowerCase().includes(q)
        || (l.formaPagamento || '').toLowerCase().includes(q);
    });
    return list;
  });

  totalFiltrado = computed(() => this.filteredItems().reduce((sum, l) => sum + (l.valor || 0), 0));
  totalIsPositive = computed(() => this.totalFiltrado() >= 0);

  ngOnInit() { this.carregar(); }

  carregar() {
    this.api.listLancamentos().subscribe({
      next: (d) => { this.items.set(d); setTimeout(() => this.renderChart(), 300); },
    });
    this.api.resumoFinanceiro().subscribe({ next: (d) => this.resumo.set(d) });
  }

  private async renderChart() {
    const el = this.chartRef()?.nativeElement;
    if (!el) return;
    const items = this.items();
    if (!items.length) return;

    const now = new Date();
    const meses: { label: string; receitas: number; despesas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      meses.push({ label: d.toLocaleDateString('pt-BR', { month: 'short' }), receitas: 0, despesas: 0 });
    }

    for (const l of items) {
      if (!l.data) continue;
      const d = new Date(l.data);
      for (let i = 0; i < meses.length; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        if (d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()) {
          if (l.tipo === 'Receita') meses[i].receitas += l.valor || 0;
          else meses[i].despesas += l.valor || 0;
          break;
        }
      }
    }

    const ApexCharts = (await import('apexcharts')).default;
    const options = {
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
      series: [
        { name: 'Receitas', data: meses.map(m => m.receitas) },
        { name: 'Despesas', data: meses.map(m => m.despesas) },
      ],
      xaxis: { categories: meses.map(m => m.label), labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
      yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '12px' }, formatter: (v: number) => 'R$ ' + v.toLocaleString('pt-BR') } },
      colors: ['var(--clx-success, #059669)', 'var(--clx-error, #dc2626)'],
      legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#64748b', useSeriesColors: false } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', borderRadiusApplication: 'end' } },
      dataLabels: { enabled: false },
      tooltip: { theme: 'light' },
    };

    if (this.chartInstance) this.chartInstance.destroy();
    this.chartInstance = new ApexCharts(el, options);
    await this.chartInstance.render();
  }

  salvar() {
    this.api.createLancamento(this.form).subscribe({
      next: () => { this.toast.show('success', 'Lançamento salvo'); this.showForm.set(false); this.carregar(); },
      error: () => this.toast.show('error', 'Falha ao salvar'),
    });
  }
}
