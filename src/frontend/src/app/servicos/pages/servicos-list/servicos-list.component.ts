import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ServicoService, Servico } from '../../services/servico.service';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-servicos-list',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Serviços</h1>
          <span class="header-subtitle">Procedimentos e serviços oferecidos pela clínica</span>
        </div>
        <div class="header-actions">
          <button class="btn-primary" type="button" (click)="toggleForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ showForm() ? 'Fechar' : 'Novo serviço' }}
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
            <span class="kpi-value">{{ servicos().length }}</span>
            <span class="kpi-sub">serviços cadastrados</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--duration">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Duração média</span>
            <span class="kpi-value">{{ duracaoMedia() }} min</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--price">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Valor médio</span>
            <span class="kpi-value">{{ valorMedio() | currency:'BRL' }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--min">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Menor duração</span>
            <span class="kpi-value">{{ duracaoMinima() }} min</span>
          </div>
        </div>
      </div>

      @if (showForm()) {
        <div class="panel">
          <div class="panel-header">
            <span class="panel-dot" [style.background]="formCor()"></span>
            <h3>{{ editingServico() ? 'Editar' : 'Novo' }} serviço</h3>
          </div>
          <div class="form-grid">
            <label>Nome *
              <input [(ngModel)]="formNome" placeholder="Nome do serviço" />
            </label>
            <label>Duração (min) *
              <input type="number" [(ngModel)]="formDuracao" min="1" placeholder="30" />
            </label>
            <label>Valor (R$) *
              <input type="number" [(ngModel)]="formValor" step="0.01" min="0" placeholder="0,00" />
            </label>
            <label>Cor (calendário)
              <div class="color-picker-wrap">
                <input type="color" [(ngModel)]="formCor" class="color-input" />
                <span class="color-hex">{{ formCor() }}</span>
              </div>
            </label>
            <label class="fw">Descrição
              <textarea [(ngModel)]="formDescricao" placeholder="Descrição do serviço..."></textarea>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="button" (click)="saveServico()">Salvar</button>
            <button class="btn-ghost" type="button" (click)="closeForm()">Cancelar</button>
          </div>
        </div>
      }

      <div class="panel">
        @if (loading()) {
          <app-skeleton variant="table" />
        } @else if (servicos().length === 0) {
          <app-empty-state
            icon="default"
            message="Nenhum serviço cadastrado ainda."
            actionLabel="Adicionar serviço"
            (action)="openCreate()"
          />
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input" placeholder="Buscar serviço..." [ngModel]="busca()" (ngModelChange)="busca.set($event)">
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
                <option value="nome">Nome</option>
                <option value="duracao">Duração</option>
                <option value="valor">Valor</option>
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
            <table class="servico-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th class="th-right">Duração</th>
                  <th class="th-right">Valor</th>
                  <th>Descrição</th>
                  <th>Cor</th>
                  <th class="th-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of itemsFiltrados(); track item.id) {
                  <tr>
                    <td class="td-name" data-label="Nome">
                      <span class="service-dot" [style.background]="item.cor || 'var(--clx-accent)'"></span>
                      {{ item.nome }}
                    </td>
                    <td class="td-right td-duration" data-label="Duração">{{ item.duracaoMin }} min</td>
                    <td class="td-right td-price" data-label="Valor">{{ item.valor | currency:'BRL' }}</td>
                    <td class="td-desc" data-label="Descrição">{{ item.descricao || '—' }}</td>
                    <td class="td-color" data-label="Cor">
                      <span class="color-swatch" [style.background]="item.cor || 'var(--clx-border)'"></span>
                    </td>
                    <td class="td-right" data-label="Ações">
                      <div class="td-actions">
                        <button class="btn-icon" type="button" title="Editar" (click)="editServico(item)">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button class="btn-icon btn-icon--danger" type="button" title="Excluir" (click)="deleteServico(item)">
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
            <p class="no-results">Nenhum serviço encontrado para "{{ busca() }}".</p>
          }
        }
      </div>
    </div>

    @if (showDeleteConfirm()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal modal--confirm" (click)="$event.stopPropagation()">
          <div class="confirm-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>Excluir serviço</h3>
          <p>Tem certeza que deseja excluir <strong>{{ deleteTarget()?.nome }}</strong>?</p>
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
    .kpi-icon--duration { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--price { background: var(--clx-purple-muted); color: var(--clx-purple); }
    .kpi-icon--min { background: var(--clx-amber-muted); color: var(--clx-amber); }

    .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-label { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 550; text-transform: uppercase; letter-spacing: 0.03em; }
    .kpi-value { font-size: 1.2rem; font-weight: 700; color: var(--clx-text-primary); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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

    .color-picker-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .color-input {
      width: 40px !important;
      height: 40px !important;
      padding: 3px !important;
      cursor: pointer;
      border-radius: var(--clx-radius-sm) !important;
    }
    .color-hex {
      font-size: 0.82rem;
      color: var(--clx-text-secondary);
      font-weight: 500;
      text-transform: uppercase;
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
    .servico-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .servico-table thead th {
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
    .servico-table thead th.th-right { text-align: right; }

    .servico-table tbody tr {
      border-bottom: 1px solid var(--clx-border);
      transition: background .15s;
    }
    .servico-table tbody tr:hover {
      background: var(--clx-surface-2);
    }
    .servico-table tbody td {
      padding: 14px 16px;
      color: var(--clx-text-primary);
      vertical-align: middle;
    }
    .td-name {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .service-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.4);
    }
    .td-right { text-align: right; font-variant-numeric: tabular-nums; }
    .td-duration { color: var(--clx-text-secondary); font-weight: 500; }
    .td-price { font-weight: 700; color: var(--clx-accent); }
    .td-desc { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--clx-text-secondary); }
    .td-color { vertical-align: middle; }
    .color-swatch {
      display: inline-block;
      width: 28px; height: 28px;
      border-radius: var(--clx-radius-sm);
      border: 2px solid var(--clx-border);
      vertical-align: middle;
    }

    .td-actions {
      display: inline-flex;
      gap: 4px;
    }
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
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
      border-color: transparent;
    }
    .btn-icon--danger:hover {
      background: var(--clx-error-muted);
      color: var(--clx-error);
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
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
      .filter-select { min-width: 0; flex: 1; }
      .servico-table { font-size: 0.78rem; }
      .servico-table thead th,
      .servico-table tbody td { padding: 8px 6px; }
      .panel { padding: 14px; }
      .table-wrap { overflow-x: visible; }
      .servico-table thead { display: none; }
      .servico-table { display: block; width: 100%; }
      .servico-table tbody { display: block; }
      .servico-table tbody tr {
        display: block;
        border: 1px solid var(--clx-border);
        border-radius: 8px;
        margin-bottom: 8px;
        padding: 10px 12px;
        background: var(--clx-bg);
      }
      .servico-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--clx-border);
        text-align: left;
        font-size: 0.78rem;
        white-space: normal;
      }
      .servico-table tbody td:last-child { border-bottom: none; }
      .servico-table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--clx-text-muted);
        margin-right: 10px;
        flex-shrink: 0;
      }
      .servico-table tbody td.actions-cell,
      .servico-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .servico-table tbody td.td-desc {
        max-width: none; overflow: visible; text-overflow: unset; white-space: normal;
      }
    }

    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .servico-table { font-size: 0.72rem; }
      .servico-table thead th,
      .servico-table tbody td { padding: 6px 4px; }
      .servico-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class ServicosListComponent implements OnInit {
  private servicoService = inject(ServicoService);

  servicos = signal<Servico[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingServico = signal<Servico | null>(null);
  busca = signal('');
  ordenarPor = signal<'nome' | 'duracao' | 'valor'>('nome');
  ordemCrescente = signal(true);

  formNome = '';
  formDescricao = '';
  formDuracao = 30;
  formValor = 0;
  formCor = signal('#14b8a6');
  showDeleteConfirm = signal(false);
  deleteTarget = signal<Servico | null>(null);

  duracaoMedia = computed(() => {
    const items = this.servicos();
    if (items.length === 0) return 0;
    return Math.round(items.reduce((s, i) => s + i.duracaoMin, 0) / items.length);
  });

  valorMedio = computed(() => {
    const items = this.servicos();
    if (items.length === 0) return 0;
    return items.reduce((s, i) => s + i.valor, 0) / items.length;
  });

  duracaoMinima = computed(() => {
    const items = this.servicos();
    if (items.length === 0) return 0;
    return Math.min(...items.map(i => i.duracaoMin));
  });

  itemsFiltrados = computed(() => {
    const busca = this.busca().toLowerCase().trim();
    const por = this.ordenarPor();
    const crescente = this.ordemCrescente();

    let result = this.servicos();
    if (busca) {
      result = result.filter(i =>
        i.nome.toLowerCase().includes(busca) ||
        (i.descricao && i.descricao.toLowerCase().includes(busca))
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (por === 'nome') cmp = a.nome.localeCompare(b.nome);
      else if (por === 'duracao') cmp = a.duracaoMin - b.duracaoMin;
      else if (por === 'valor') cmp = a.valor - b.valor;
      return crescente ? cmp : -cmp;
    });
  });

  ngOnInit() { this.carregarServicos(); }

  private carregarServicos() {
    this.loading.set(true);
    this.servicoService.getAll().subscribe({
      next: (data) => { this.servicos.set(data); this.loading.set(false); },
      error: () => { this.servicos.set([]); this.loading.set(false); },
    });
  }

  toggleForm() {
    if (this.showForm()) {
      this.closeForm();
    } else {
      this.openCreate();
    }
  }

  openCreate() {
    this.editingServico.set(null);
    this.formNome = '';
    this.formDescricao = '';
    this.formDuracao = 30;
    this.formValor = 0;
    this.formCor.set('#14b8a6');
    this.showForm.set(true);
  }

  editServico(s: Servico) {
    this.editingServico.set(s);
    this.formNome = s.nome;
    this.formDescricao = s.descricao;
    this.formDuracao = s.duracaoMin;
    this.formValor = s.valor;
    this.formCor.set(s.cor || '#14b8a6');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  saveServico() {
    const request = {
      nome: this.formNome,
      descricao: this.formDescricao,
      duracaoMin: +this.formDuracao,
      valor: +this.formValor,
      cor: this.formCor(),
    };

    const obs = this.editingServico()
      ? this.servicoService.update(this.editingServico()!.id, request)
      : this.servicoService.create(request);

    obs.subscribe({
      next: () => {
        this.carregarServicos();
        this.closeForm();
      },
      error: () => {},
    });
  }

  deleteServico(s: Servico) {
    this.deleteTarget.set(s);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const s = this.deleteTarget();
    if (!s) return;
    this.servicoService.delete(s.id).subscribe({
      next: () => {
        this.cancelDelete();
        this.carregarServicos();
      },
    });
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deleteTarget.set(null);
  }
}
