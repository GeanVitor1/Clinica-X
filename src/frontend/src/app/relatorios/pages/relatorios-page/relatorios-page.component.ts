import { Component, signal, computed, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RelatorioService, RelatorioFinanceiro, RelatorioOcupacao } from '../../services/relatorio.service';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Relatórios</h1>
          <span class="header-subtitle">{{ periodoLabel() }}</span>
        </div>
        <div class="header-actions">
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
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="tab() === 'financeiro'" (click)="tab.set('financeiro'); carregarDados()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Financeiro
          </button>
          <button type="button" class="tab" [class.tab--active]="tab() === 'ocupacao'" (click)="tab.set('ocupacao'); carregarDados()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Ocupação
          </button>
        </div>
        <div class="period-picker">
          <button class="period-arrow" type="button" (click)="mesAnterior()" title="Mês anterior">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="period-select-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="period-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <select [(ngModel)]="mesSelecionado" (change)="carregarDados()">
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
        <div class="kpi-grid">
          @if (tab() === 'financeiro') {
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--revenue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Receita Total</span>
                <span class="kpi-value">{{ financeiro().totalPeriodo | currency:'BRL' }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--services">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Qtd. Serviços</span>
                <span class="kpi-value">{{ totalQuantidade() }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--ticket">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 12h20"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Ticket Médio</span>
                <span class="kpi-value">{{ ticketMedio() | currency:'BRL' }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--diversity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Tipos de Serviço</span>
                <span class="kpi-value">{{ financeiro().porServico.length }}</span>
              </div>
            </div>
          }
          @if (tab() === 'ocupacao') {
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--appointments">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total Agendamentos</span>
                <span class="kpi-value">{{ ocupacao().totalAgendamentos }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--peak">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Horário de Pico</span>
                <span class="kpi-value">{{ horarioPicoLabel() }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--diversity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Serviços Diferentes</span>
                <span class="kpi-value">{{ ocupacao().servicosMaisAgendados.length }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--avg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Média por Serviço</span>
                <span class="kpi-value">{{ mediaPorServico() | number:'1.0-0' }}</span>
              </div>
            </div>
          }
        </div>

        @if (tab() === 'financeiro') {
          <div class="panel">
            <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Faturamento por Serviço</h2>
            <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;">{{ periodoLabel() }}</p>
            @if (financeiro().porServico.length === 0) {
              <app-empty-state icon="relatorios" message="Sem faturamento neste período." />
            }
            @if (financeiro().porServico.length > 0) {
              <div class="table-toolbar">
                <div class="search-box">
                  <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" class="search-input" placeholder="Buscar serviço..." [ngModel]="buscaServico()" (ngModelChange)="buscaServico.set($event)">
                  @if (buscaServico()) {
                    <button class="search-clear" type="button" (click)="buscaServico.set('')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  }
                </div>
                <div class="filter-group">
                  <label class="filter-label">Ordenar por:</label>
                  <select class="filter-select" [ngModel]="ordenarPor()" (ngModelChange)="ordenarPor.set($event)">
                    <option value="nome">Nome</option>
                    <option value="quantidade">Quantidade</option>
                    <option value="unitario">Valor Unitário</option>
                    <option value="total">Total</option>
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
                      <th>Serviço</th>
                      <th class="th-center">Qtd</th>
                      <th class="th-right">Unitário</th>
                      <th class="th-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of servicosFiltrados(); track item.servicoNome) {
                      <tr>
                        <td class="td-service" data-label="Serviço">
                          <span class="service-dot" [style.background]="dotColors[$index % dotColors.length]"></span>
                          {{ item.servicoNome }}
                        </td>
                        <td class="td-center" data-label="Qtd">{{ item.quantidade }}</td>
                        <td class="td-right" data-label="Unitário">{{ item.valorUnitario | currency:'BRL' }}</td>
                        <td class="td-right td-total" data-label="Total">{{ item.total | currency:'BRL' }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="total-row">
                      <td colspan="3" class="tf-label">Total ({{ servicosFiltrados().length }} registro{{ servicosFiltrados().length !== 1 ? 's' : '' }})</td>
                      <td class="td-right tf-value">{{ totalFiltrado() | currency:'BRL' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              @if (servicosFiltrados().length === 0) {
                <p class="no-results">Nenhum serviço encontrado para "{{ buscaServico() }}".</p>
              }
            }
          </div>
        }

        @if (tab() === 'ocupacao') {
          <div class="report-card">
            <h2>Ocupação</h2>
            <p class="card-subtitle">{{ periodoLabel() }} — {{ ocupacao().totalAgendamentos }} consultas no total</p>

            <div class="ocupacao-layout">
              <div class="ocupacao-panel">
                <h3><span class="panel-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span> Horários de Pico</h3>
                <div class="bar-chart">
                  @for (item of ocupacao().horariosPico; track item.hora) {
                    <div class="bar-row">
                      <span class="bar-label">{{ item.hora }}h</span>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="(item.quantidade / maxOcupacao()) * 100" [style.background]="barGradient($index)">
                          <span class="bar-val">{{ item.quantidade }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="ocupacao-panel">
                <h3><span class="panel-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span> Serviços Mais Agendados</h3>
                <div class="servicos-list">
                  @for (item of ocupacao().servicosMaisAgendados; track item.servicoNome) {
                    <div class="servico-card">
                      <div class="servico-card-top">
                        <div class="servico-card-name">
                          <span class="servico-rank">{{ $index + 1 }}º</span>
                          <span class="servico-title">{{ item.servicoNome }}</span>
                        </div>
                        <span class="servico-card-qty">{{ item.quantidade }}x</span>
                      </div>
                      <div class="servico-card-track">
                        <div class="servico-card-fill" [style.width.%]="item.percentual"></div>
                      </div>
                      <span class="servico-card-pct">{{ item.percentual }}%</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
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
    .kpi-icon--ticket { background: var(--clx-purple-muted); color: var(--clx-purple); }
    .kpi-icon--appointments { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--peak { background: var(--clx-amber-muted); color: var(--clx-amber); }
    .kpi-icon--diversity { background: var(--clx-cyan-muted); color: var(--clx-cyan); }
    .kpi-icon--avg { background: var(--clx-purple-muted); color: var(--clx-purple); }

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

    /* ── Table Toolbar ── */
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

    /* ── Table ── */
    .table-wrap {
      overflow-x: auto;
    }
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
    .report-table tbody tr:hover {
      background: var(--clx-surface-2);
    }
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

    .ocupacao-layout {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    }
    .ocupacao-panel {
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      padding: 22px;
    }
    .ocupacao-panel h3 {
      font-size: 0.88rem; margin: 0 0 18px 0;
      color: var(--clx-text-primary); font-weight: 650;
      display: flex; align-items: center; gap: 8px;
    }
    .panel-icon { color: var(--clx-accent); display: flex; align-items: center; }

    .bar-chart { display: flex; flex-direction: column; gap: 10px; }
    .bar-row { display: flex; align-items: center; gap: 10px; }
    .bar-label {
      width: 34px; font-size: 0.76rem; color: var(--clx-text-tertiary);
      text-align: right; flex-shrink: 0; font-weight: 550;
    }
    .bar-track {
      flex: 1; height: 24px;
      background: var(--clx-surface-3);
      border-radius: var(--clx-radius-xs);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: var(--clx-radius-xs);
      display: flex; align-items: center; padding-left: 8px;
      transition: width 0.7s var(--clx-ease-out);
      min-width: 0;
    }
    .bar-val {
      font-size: 0.7rem; font-weight: 650; color: #fff;
      text-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }

    .servicos-list { display: flex; flex-direction: column; gap: 14px; }
    .servico-card {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border-light);
      border-radius: var(--clx-radius-md);
      padding: 14px 16px;
      transition: all var(--clx-transition-fast);
    }
    .servico-card:hover {
      border-color: var(--clx-border-strong);
      box-shadow: var(--clx-shadow-xs);
    }
    .servico-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .servico-card-name { display: flex; align-items: center; gap: 8px; }
    .servico-rank {
      width: 24px; height: 24px;
      border-radius: var(--clx-radius-xs);
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
      font-size: 0.7rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .servico-title { font-size: 0.84rem; color: var(--clx-text-primary); font-weight: 550; }
    .servico-card-qty {
      font-size: 0.8rem; font-weight: 650; color: var(--clx-text-secondary);
    }
    .servico-card-track {
      height: 18px;
      background: var(--clx-surface-3);
      border-radius: var(--clx-radius-xs);
      overflow: hidden;
      margin-bottom: 6px;
    }
    .servico-card-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--clx-accent), var(--clx-purple));
      border-radius: var(--clx-radius-xs);
      transition: width 0.7s var(--clx-ease-out);
    }
    .servico-card-pct {
      font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550;
    }

    .hidden { display: none; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .ocupacao-layout { grid-template-columns: 1fr; }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
      .filter-select { min-width: 0; flex: 1; }
      .report-table { font-size: 0.78rem; }
      .report-table thead th,
      .report-table tbody td,
      .report-table tfoot td { padding: 8px 6px; }
      .panel { padding: 14px; }
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
    }

    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .period-picker { flex-wrap: wrap; }
      .report-table { font-size: 0.72rem; }
      .report-table thead th,
      .report-table tbody td,
      .report-table tfoot td { padding: 6px 4px; }
      .report-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class RelatoriosPageComponent implements OnInit {
  private relatorioService = inject(RelatorioService);

  @ViewChild('reportContent', { read: ElementRef }) reportContentRef?: ElementRef;

  tab = signal<'financeiro' | 'ocupacao'>('financeiro');
  mesSelecionado = '';
  loading = signal(false);
  buscaServico = signal('');
  ordenarPor = signal<'nome' | 'quantidade' | 'unitario' | 'total'>('nome');
  ordemCrescente = signal(true);

  financeiro = signal<RelatorioFinanceiro>({
    dataInicio: '', dataFim: '', totalPeriodo: 0, porServico: [],
  });
  ocupacao = signal<RelatorioOcupacao>({
    dataInicio: '', dataFim: '', totalAgendamentos: 0, horariosPico: [], servicosMaisAgendados: [],
  });

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
    if (!this.mesSelecionado) return '';
    const [ano, mes] = this.mesSelecionado.split('-');
    const d = new Date(+ano, +mes - 1, 1);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  maxOcupacao = computed(() => Math.max(...this.ocupacao().horariosPico.map(h => h.quantidade), 1));

  totalQuantidade = computed(() =>
    this.financeiro().porServico.reduce((sum, item) => sum + item.quantidade, 0)
  );

  ticketMedio = computed(() => {
    const q = this.totalQuantidade();
    return q > 0 ? this.financeiro().totalPeriodo / q : 0;
  });

  horarioPicoLabel = computed(() => {
    const horarios = this.ocupacao().horariosPico;
    if (horarios.length === 0) return '—';
    const max = Math.max(...horarios.map(h => h.quantidade));
    const pico = horarios.find(h => h.quantidade === max);
    return pico ? `${pico.hora}h (${pico.quantidade})` : '—';
  });

  mediaPorServico = computed(() => {
    const servicos = this.ocupacao().servicosMaisAgendados;
    if (servicos.length === 0) return 0;
    const total = servicos.reduce((sum, s) => sum + s.quantidade, 0);
    return total / servicos.length;
  });

  servicosFiltrados = computed(() => {
    const busca = this.buscaServico().toLowerCase().trim();
    const por = this.ordenarPor();
    const crescente = this.ordemCrescente();
    let items = this.financeiro().porServico;

    if (busca) {
      items = items.filter(i => i.servicoNome.toLowerCase().includes(busca));
    }

    return [...items].sort((a, b) => {
      let cmp = 0;
      if (por === 'nome') cmp = a.servicoNome.localeCompare(b.servicoNome);
      else if (por === 'quantidade') cmp = a.quantidade - b.quantidade;
      else if (por === 'unitario') cmp = a.valorUnitario - b.valorUnitario;
      else cmp = a.total - b.total;
      return crescente ? cmp : -cmp;
    });
  });

  totalFiltrado = computed(() =>
    this.servicosFiltrados().reduce((sum, item) => sum + item.total, 0)
  );

  ngOnInit() {
    const d = new Date();
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarDados();
  }

  carregarDados() {
    this.loading.set(true);
    const [ano, mes] = this.mesSelecionado.split('-');
    const dataInicio = `${ano}-${mes}-01`;
    const ultimoDia = new Date(+ano, +mes, 0).getDate();
    const dataFim = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;

    if (this.tab() === 'financeiro') {
      this.relatorioService.getFinanceiro(dataInicio, dataFim).subscribe({
        next: (data) => { this.financeiro.set(data); this.loading.set(false); },
        error: () => {
          this.financeiro.set({ dataInicio, dataFim, totalPeriodo: 0, porServico: [] });
          this.loading.set(false);
        },
      });
    } else {
      this.relatorioService.getOcupacao(dataInicio, dataFim).subscribe({
        next: (data) => { this.ocupacao.set(data); this.loading.set(false); },
        error: () => {
          this.ocupacao.set({ dataInicio, dataFim, totalAgendamentos: 0, horariosPico: [], servicosMaisAgendados: [] });
          this.loading.set(false);
        },
      });
    }
  }

  barGradient(index: number): string {
    const stops = [
      'linear-gradient(90deg, var(--clx-accent), var(--clx-accent-light))',
      'linear-gradient(90deg, var(--clx-purple), var(--clx-accent))',
      'linear-gradient(90deg, var(--clx-teal), var(--clx-cyan))',
      'linear-gradient(90deg, var(--clx-amber), var(--clx-warm))',
    ];
    return stops[index % stops.length];
  }

  mesAnterior() {
    const [ano, mes] = this.mesSelecionado.split('-').map(Number);
    const d = new Date(ano, mes - 2, 1);
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarDados();
  }

  proximoMes() {
    const [ano, mes] = this.mesSelecionado.split('-').map(Number);
    const d = new Date(ano, mes, 1);
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarDados();
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
    pdf.save(`relatorio-${this.tab()}-${this.mesSelecionado}.pdf`);
  }

  exportCsv() {
    let csv = '';
    if (this.tab() === 'financeiro') {
      csv = 'Serviço,Quantidade,Valor Unitário,Total\n';
      for (const item of this.financeiro().porServico) {
        csv += `${item.servicoNome},${item.quantidade},${item.valorUnitario},${item.total}\n`;
      }
      csv += `Total,,,${this.financeiro().totalPeriodo}\n`;
    } else {
      csv = 'Serviço,Quantidade,Percentual\n';
      for (const item of this.ocupacao().servicosMaisAgendados) {
        csv += `${item.servicoNome},${item.quantidade},${item.percentual}%\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${this.tab()}-${this.mesSelecionado}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
