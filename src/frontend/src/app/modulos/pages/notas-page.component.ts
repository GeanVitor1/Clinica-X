import { Component, signal, computed, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

interface NotaFiscal {
  id?: string;
  numero?: string;
  valor?: number;
  status?: string;
  dataEmissao?: string;
  descricaoServico?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-notas-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Notas Fiscais</h1>
          <span class="header-subtitle">{{ periodoLabel() }} — {{ notasFiltradas().length }} nota{{ notasFiltradas().length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="showForm = !showForm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ showForm ? 'Fechar' : 'Nova Nota' }}
          </button>
          <button class="btn-export" type="button" (click)="exportPdf()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Exportar PDF
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
        <div class="period-picker">
          <button class="period-arrow" type="button" (click)="mesAnterior()" title="Mês anterior">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="period-select-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="period-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <select [(ngModel)]="mesSelecionado" (change)="filtrarPorMes()">
              @for (m of meses; track m.value) {
                <option [value]="m.value">{{ m.label }}</option>
              }
            </select>
          </div>
          <button class="period-arrow" type="button" (click)="proximoMes()" title="Próximo mês">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-skeleton variant="table" />
        <app-skeleton variant="chart" />
      }

      <div class="report-content" #reportContent [class.hidden]="loading()">

        @if (showForm) {
          <div class="panel">
            <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Emitir Nova Nota</h2>
            <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;">Preencha os dados para emissão de NFS-e</p>
            <div class="form-grid">
              <label>Valor
                <input type="number" [(ngModel)]="form.valor" min="0" step="0.01" placeholder="0,00" />
              </label>
              <label class="fw">Descrição do serviço
                <input [(ngModel)]="form.descricaoServico" placeholder="Descreva o serviço para a NFS-e..." />
              </label>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" type="button" (click)="showForm = false">Cancelar</button>
              <button class="btn-save" type="button" (click)="emitirNota()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Emitir
              </button>
            </div>
          </div>
        }

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--revenue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total de Notas</span>
              <span class="kpi-value">{{ notasFiltradas().length }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--services">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Valor Total</span>
              <span class="kpi-value">{{ valorTotal() | currency:'BRL' }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--ticket">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Pendentes</span>
              <span class="kpi-value">{{ pendentes() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--diversity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Concluídas</span>
              <span class="kpi-value">{{ concluidas() }}</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Notas Emitidas</h2>
          <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;">{{ periodoLabel() }}</p>

          @if (notasFiltradas().length === 0) {
            <app-empty-state icon="relatorios" message="Nenhuma nota encontrada neste período." />
          }

          @if (notasFiltradas().length > 0) {
            <div class="table-toolbar">
              <div class="search-box">
                <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" class="search-input" placeholder="Buscar nota..." [ngModel]="busca()" (ngModelChange)="busca.set($event)">
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
                  <option value="numero">Número</option>
                  <option value="valor">Valor</option>
                  <option value="status">Status</option>
                  <option value="dataEmissao">Emissão</option>
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
                    <th>Nº</th>
                    <th>Status</th>
                    <th>Emissão</th>
                    <th>Serviço</th>
                    <th class="th-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of notasOrdenadas(); track item.id || $index) {
                    <tr>
                      <td class="td-service" data-label="Nº">
                        <span class="service-dot" [style.background]="dotColors[$index % dotColors.length]"></span>
                        {{ item.numero || '—' }}
                      </td>
                      <td data-label="Status"><span class="stg" [class]="tagClass(item.status)">{{ item.status || '—' }}</span></td>
                      <td data-label="Emissão">{{ formatDate(item.dataEmissao) }}</td>
                      <td data-label="Serviço">{{ item.descricaoServico || '—' }}</td>
                      <td class="td-right td-total" data-label="Valor">{{ (item.valor || 0) | currency:'BRL' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="4" class="tf-label">Total ({{ notasOrdenadas().length }} nota{{ notasOrdenadas().length !== 1 ? 's' : '' }})</td>
                    <td class="td-right tf-value">{{ valorFiltrado() | currency:'BRL' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            @if (notasOrdenadas().length === 0 && busca()) {
              <p class="no-results">Nenhuma nota encontrada para "{{ busca() }}".</p>
            }
          }
        </div>
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

    .controls-bar {
      display: flex; justify-content: flex-end; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 14px;
    }

    .period-picker { display: flex; align-items: center; gap: 4px; }
    .period-arrow {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      background: var(--clx-surface-1);
      color: var(--clx-text-secondary);
      cursor: pointer;
      transition: all var(--clx-transition-fast);
    }
    .period-arrow:hover {
      border-color: var(--clx-accent); color: var(--clx-accent);
      background: var(--clx-accent-muted);
    }
    .period-select-wrapper {
      position: relative; display: flex; align-items: center;
    }
    .period-icon {
      position: absolute; left: 12px; pointer-events: none;
      color: var(--clx-text-tertiary);
    }
    .period-select-wrapper select {
      padding: 7px 14px 7px 34px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      background: var(--clx-surface-1);
      color: var(--clx-text-primary);
      font-size: 0.84rem;
      font-family: var(--clx-font);
      font-weight: 500;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      min-width: 180px;
      transition: border-color var(--clx-transition-fast);
    }
    .period-select-wrapper select:focus { border-color: var(--clx-accent); }

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
    .kpi-icon--revenue { background: var(--clx-accent-muted); color: var(--clx-accent); }
    .kpi-icon--services { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--ticket { background: var(--clx-amber-muted); color: var(--clx-amber); }
    .kpi-icon--diversity { background: var(--clx-cyan-muted); color: var(--clx-cyan); }

    .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-label { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550; text-transform: uppercase; letter-spacing: 0.03em; }
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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

    .table-wrap { overflow-x: auto; }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .report-table thead th {
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
    .report-table thead th.th-center { text-align: center; }
    .report-table thead th.th-right { text-align: right; }

    .report-table tbody tr {
      border-bottom: 1px solid var(--clx-border);
      transition: background .15s;
    }
    .report-table tbody tr:hover { background: var(--clx-surface-2); }
    .report-table tbody td {
      padding: 14px 16px;
      color: var(--clx-text-primary);
      vertical-align: middle;
    }
    .td-service {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .td-center { text-align: center; }
    .td-right { text-align: right; font-variant-numeric: tabular-nums; }
    .td-total { font-weight: 700; color: var(--clx-accent); }

    .service-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.4);
    }

    .report-table tfoot tr {
      border-top: 2px solid var(--clx-border-strong);
      background: linear-gradient(135deg, var(--clx-accent-muted), var(--clx-purple-muted));
    }
    .report-table tfoot td {
      padding: 14px 16px;
    }
    .tf-label {
      font-weight: 650;
      color: var(--clx-text-primary);
    }
    .tf-value {
      font-size: 1.05rem;
      font-weight: 750;
      color: var(--clx-accent);
    }

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
    .stg--neutral  { background: var(--clx-bg-alt, #f1f5f9); color: var(--clx-text-muted, #64748b); }

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
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--clx-text-secondary);
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
      justify-content: flex-end;
      padding-top: 4px;
    }
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

    .hidden { display: none; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; gap: 14px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
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
      .form-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .period-picker { flex-wrap: wrap; }
      .report-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class NotasPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  @ViewChild('reportContent', { read: ElementRef }) reportContentRef?: ElementRef;

  allNotas = signal<NotaFiscal[]>([]);
  loading = signal(false);
  showForm = false;
  mesSelecionado = '';
  busca = signal('');
  ordenarPor = signal<'numero' | 'valor' | 'status' | 'dataEmissao'>('dataEmissao');
  ordemCrescente = signal(false);
  form: any = { valor: 0, descricaoServico: '' };

  meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1);
    return {
      value: `${d.getFullYear()}-${String(i + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  dotColors = [
    'var(--clx-accent)',
    'var(--clx-purple)',
    'var(--clx-teal)',
    'var(--clx-amber)',
    'var(--clx-cyan)',
    'var(--clx-rose)',
  ];

  periodoLabel = computed(() => {
    if (!this.mesSelecionado) return 'Todas as notas';
    const [ano, mes] = this.mesSelecionado.split('-');
    const d = new Date(+ano, +mes - 1, 1);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  notasFiltradas = computed(() => {
    const q = this.busca().toLowerCase().trim();
    let items = this.allNotas();

    if (this.mesSelecionado) {
      const [ano, mes] = this.mesSelecionado.split('-');
      items = items.filter(n => {
        if (!n.dataEmissao) return true;
        const d = new Date(n.dataEmissao);
        return d.getFullYear() === +ano && d.getMonth() === +mes - 1;
      });
    }

    if (!q) return items;
    return items.filter(n =>
      (n.numero && String(n.numero).toLowerCase().includes(q)) ||
      (n.status && n.status.toLowerCase().includes(q)) ||
      (n.descricaoServico && n.descricaoServico.toLowerCase().includes(q))
    );
  });

  notasOrdenadas = computed(() => {
    const por = this.ordenarPor();
    const crescente = this.ordemCrescente();
    return [...this.notasFiltradas()].sort((a, b) => {
      let cmp = 0;
      if (por === 'numero') cmp = String(a.numero || '').localeCompare(String(b.numero || ''));
      else if (por === 'valor') cmp = (a.valor || 0) - (b.valor || 0);
      else if (por === 'status') cmp = String(a.status || '').localeCompare(String(b.status || ''));
      else cmp = new Date(a.dataEmissao || 0).getTime() - new Date(b.dataEmissao || 0).getTime();
      return crescente ? cmp : -cmp;
    });
  });

  valorTotal = computed(() =>
    this.notasFiltradas().reduce((sum, n) => sum + (n.valor || 0), 0)
  );

  valorFiltrado = computed(() =>
    this.notasOrdenadas().reduce((sum, n) => sum + (n.valor || 0), 0)
  );

  pendentes = computed(() =>
    this.notasFiltradas().filter(n => {
      const s = String(n.status || '').toLowerCase();
      return s.includes('pendente') || s.includes('aguardando') || s.includes('processando');
    }).length
  );

  concluidas = computed(() =>
    this.notasFiltradas().filter(n => {
      const s = String(n.status || '').toLowerCase();
      return s.includes('conclu') || s.includes('emit') || s.includes('ok') || s === 'pago' || s === 'finalizado';
    }).length
  );

  ngOnInit() {
    const d = new Date();
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarNotas();
  }

  carregarNotas() {
    this.loading.set(true);
    this.api.listNotas().subscribe({
      next: (data) => { this.allNotas.set(data || []); this.loading.set(false); },
      error: () => { this.allNotas.set([]); this.loading.set(false); },
    });
  }

  emitirNota() {
    if (!this.form.descricaoServico) {
      this.toast.show('error', 'Informe a descrição do serviço');
      return;
    }
    this.api.emitirNota(this.form).subscribe({
      next: () => {
        this.toast.show('success', 'Nota emitida com sucesso');
        this.showForm = false;
        this.form = { valor: 0, descricaoServico: '' };
        this.carregarNotas();
      },
      error: (e) => this.toast.show('error', e?.error || 'Falha ao emitir nota'),
    });
  }

  tagClass(status: any): string {
    if (status == null || status === '') return 'stg--neutral';
    const s = String(status).trim().toLowerCase();
    if (/^(ok|sim|conclu[ií]da|finalizado|emitida|entregue|pago|liberado|autorizada)$/i.test(s)) return 'stg--positive';
    if (/^(pendente|erro|falha|cancelado|recusado|atrasado|expirado)$/i.test(s)) return 'stg--negative';
    if (/^(aguardando|processando|enviado|em andamento|parcial)$/i.test(s)) return 'stg--warn';
    return 'stg--neutral';
  }

  formatDate(date: any): string {
    if (!date) return '—';
    try { return new Date(date).toLocaleDateString('pt-BR'); } catch { return String(date); }
  }

  filtrarPorMes() {
    this.carregarNotas();
  }

  mesAnterior() {
    const [ano, mes] = this.mesSelecionado.split('-').map(Number);
    const d = new Date(ano, mes - 2, 1);
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarNotas();
  }

  proximoMes() {
    const [ano, mes] = this.mesSelecionado.split('-').map(Number);
    const d = new Date(ano, mes, 1);
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarNotas();
  }

  async exportPdf() {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const el = this.reportContentRef?.nativeElement;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgW = 190;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH);
    pdf.save(`notas-${this.mesSelecionado}.pdf`);
  }

  exportCsv() {
    let csv = 'Nº,Valor,Status,Emissão,Serviço\n';
    for (const n of this.notasFiltradas()) {
      const valor = (n.valor || 0).toLocaleString('pt-BR');
      const data = this.formatDate(n.dataEmissao);
      csv += `${n.numero || ''},${valor},${n.status || ''},${data},${n.descricaoServico || ''}\n`;
    }
    csv += `Total,,${this.valorTotal().toLocaleString('pt-BR')},,\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notas-${this.mesSelecionado}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
