import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/components/avatar-iniciais.component';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { BtnSubmitComponent, BtnSubmitState } from '../../../shared/components/btn-submit.component';
import { debounceSearch$ } from '../../../shared/utils/debounce';
import { PacienteService, Paciente, Evento } from '../../services/paciente.service';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [FormsModule, AvatarComponent, DatePipe, RouterLink, SkeletonComponent, EmptyStateComponent, BtnSubmitComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Pacientes</h1>
          <span class="header-subtitle">{{ filteredTotal() }} paciente(s) encontrado(s)</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="openCreate()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Paciente
          </button>
        </div>
      </header>

      <div class="controls-bar">
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'todos'" (click)="setFiltro('todos')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Todos
          </button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'ativos'" (click)="setFiltro('ativos')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Ativos
          </button>
          <button type="button" class="tab" [class.tab--active]="filtroTab() === 'inativos'" (click)="setFiltro('inativos')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            Inativos
          </button>
        </div>
        <div class="filter-group">
          <label class="filter-label">Ordenar por:</label>
          <select class="filter-select" [(ngModel)]="sortKeyVal" (ngModelChange)="onSortKeyChange($event)">
            <option value="nome">Nome</option>
            <option value="criadoEm">Data de cadastro</option>
          </select>
          <button class="sort-dir-btn" type="button" (click)="toggleSortDir()" [title]="sortDir() === 'asc' ? 'Ordem decrescente' : 'Ordem crescente'">
            @if (sortDir() === 'asc') {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            }
          </button>
        </div>
      </div>

      @if (loading() && pacientes().length === 0) {
        <app-skeleton variant="table" />
      } @else if (!loading() && total() === 0) {
        <app-empty-state
          icon="pacientes"
          message="Nenhum paciente cadastrado ainda."
          actionLabel="Adicionar paciente"
          (action)="openCreate()"
        />
      } @else {
        <div class="panel">
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                class="search-input"
                placeholder="Buscar por nome, CPF ou telefone..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearch($event)"
              />
              @if (searchQuery()) {
                <button class="search-clear" type="button" (click)="onSearch('')">
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
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Nascimento</th>
                  <th class="th-center">Status</th>
                  <th class="th-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (p of pacientesList(); track p.id) {
                  <tr [class.row-expanded]="expandedId() === p.id">
                    <td class="td-paciente" data-label="Paciente">
                      <div class="paciente-cell">
                        <app-avatar [name]="p.nome" />
                        <div class="paciente-info">
                          <span class="paciente-nome">{{ p.nome }}</span>
                          <span class="paciente-meta" (click)="toggleExpand(p.id)" style="cursor: pointer;">
                            @if (expandedId() === p.id) {
                              Ocultar detalhes
                            } @else {
                              Ver detalhes
                            }
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="CPF">{{ formatCpf(p.cpf) }}</td>
                    <td data-label="Telefone">{{ p.telefone }}</td>
                    <td data-label="Nascimento">{{ p.dataNascimento ? (p.dataNascimento | date:'dd/MM/yyyy') : '—' }}</td>
                    <td class="td-center" data-label="Status">
                      <span class="stg" [class.stg--positive]="p.ativo" [class.stg--neutral]="!p.ativo">
                        {{ p.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="td-right" data-label="Ações">
                      <div class="actions-cell">
                        <button class="act-btn act-btn--edit" type="button" (click)="editPaciente(p)" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <a class="act-btn act-btn--record" [routerLink]="['/prontuario', p.id]" title="Prontuário">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </a>
                        <a class="act-btn act-btn--schedule" [routerLink]="'/agenda'" title="Agendar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </a>
                        <button class="act-btn act-btn--history" type="button" (click)="verHistorico(p)" title="Histórico">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </button>
                        <button class="act-btn act-btn--delete" type="button" (click)="deletePaciente(p)" title="Excluir">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  @if (expandedId() === p.id) {
                    <tr class="expanded-row">
                      <td colspan="6">
                        <div class="detail-grid">
                          <div class="detail-item">
                            <span class="detail-label">Observações</span>
                            <span class="detail-value">{{ p.observacoes || 'Nenhuma observação' }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">Último agendamento</span>
                            <span class="detail-value">{{ p.ultimoAgendamentoInfo || 'Nenhum' }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">Cadastrado em</span>
                            <span class="detail-value">{{ p.criadoEm | date:'dd/MM/yyyy' }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
          @if (pacientesList().length === 0 && !loading()) {
            <p class="no-results">Nenhum paciente encontrado para "{{ searchQuery() }}".</p>
          }
        </div>
      }

      @if (total() > 0) {
        <div class="pagination">
          <button type="button" (click)="prevPage()" [disabled]="page() === 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Anterior
          </button>
          <span>Página {{ page() }} de {{ totalPages() }}</span>
          <button type="button" (click)="nextPage()" [disabled]="page() === totalPages()">
            Próxima
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      }
    </div>

    @if (showHistorico()) {
      <div class="modal-overlay" (click)="fecharHistorico()">
        <div class="modal modal--timeline" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h2>{{ historicoPaciente()?.nome }}</h2>
                <p class="modal-sub">Histórico de eventos</p>
              </div>
            </div>
            <button class="modal-x" (click)="fecharHistorico()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="timeline-list">
            @for (ev of historicoEventos(); track ev.descricao + ev.criadoEm) {
              <div class="tl-item">
                <div class="tl-dot" [style.background]="getEventColor(ev.tipo)"></div>
                <div class="tl-line"></div>
                <div class="tl-content">
                  <p>{{ ev.descricao }}</p>
                  <span>{{ timeAgo(ev.criadoEm) }}</span>
                </div>
              </div>
            } @empty {
              <div class="tl-empty">Nenhum evento registrado.</div>
            }
          </div>
        </div>
      </div>
    }

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal modal--form" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                @if (editingPaciente()) {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                }
              </div>
              <div>
                <h2>{{ editingPaciente() ? 'Editar paciente' : 'Novo paciente' }}</h2>
                <p class="modal-sub">{{ editingPaciente() ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar' }}</p>
              </div>
            </div>
            <button class="modal-x" (click)="closeForm()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form (ngSubmit)="savePaciente()" class="form-body">
            <div class="form-row">
              <div class="field field--wide">
                <label>Nome completo *</label>
                <input [(ngModel)]="formNome" name="nome" required maxlength="200" placeholder="Nome do paciente" />
              </div>
            </div>
            <div class="form-row double">
              <div class="field">
                <label>CPF *</label>
                <input [(ngModel)]="formCpf" name="cpf" required maxlength="11" placeholder="Apenas números" />
                @if (cpfError()) { <span class="field-err">{{ cpfError() }}</span> }
              </div>
              <div class="field">
                <label>Telefone *</label>
                <input [(ngModel)]="formTelefone" name="telefone" required maxlength="20" placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div class="form-row double">
              <div class="field">
                <label>Data de nascimento</label>
                <input [(ngModel)]="formDataNascimento" name="dataNascimento" type="date" />
              </div>
              <div class="field">
                <label>E-mail</label>
                <input [(ngModel)]="formEmail" name="email" type="email" maxlength="200" placeholder="paciente@email.com" />
              </div>
            </div>
            <div class="form-row double">
              <div class="field">
                <label>Convênio</label>
                <input [(ngModel)]="formConvenio" name="convenio" maxlength="120" placeholder="Particular / Unimed..." />
              </div>
              <div class="field">
                <label>Carteirinha</label>
                <input [(ngModel)]="formCarteirinha" name="carteirinha" maxlength="60" placeholder="Nº carteirinha" />
              </div>
            </div>
            <div class="form-row">
              <div class="field field--wide">
                <label>Observações</label>
                <textarea [(ngModel)]="formObservacoes" name="observacoes" rows="3" maxlength="1000" placeholder="Alergias, condições médicas, preferências..."></textarea>
              </div>
            </div>
            <div class="form-footer">
              <button type="button" class="btn-cancel" (click)="closeForm()">Cancelar</button>
              <app-btn-submit label="Salvar paciente" [state]="saveState()" />
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
          <h3>Excluir paciente</h3>
          <p>Tem certeza que deseja excluir <strong>{{ deleteTarget()?.nome }}</strong>?</p>
          <p class="confirm-hint">Essa ação não pode ser desfeita.</p>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
            <button type="button" class="btn-danger" (click)="confirmDelete()">
              Excluir
            </button>
          </div>
        </div>
      </div>
    }
  `,
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
    .td-center { text-align: center; }
    .td-right { text-align: right; }

    .td-paciente { min-width: 200px; }

    .paciente-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .paciente-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .paciente-nome {
      font-weight: 650;
      font-size: 0.9rem;
      color: var(--clx-text-primary);
    }
    .paciente-meta {
      font-size: 0.72rem;
      color: var(--clx-accent);
      font-weight: 500;
      cursor: pointer;
      transition: color var(--clx-transition-fast);
    }
    .paciente-meta:hover {
      color: var(--clx-accent-hover);
      text-decoration: underline;
    }

    .row-expanded {
      background: color-mix(in srgb, var(--clx-accent) 3%, transparent) !important;
    }

    .expanded-row td {
      padding: 0 16px 16px !important;
      border-bottom: 2px solid var(--clx-accent) !important;
    }

    .detail-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px; padding: 16px 20px;
      background: var(--clx-surface-2);
      border-radius: var(--clx-radius-md);
      margin-top: 4px;
    }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-label { font-size: .68rem; color: var(--clx-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
    .detail-value { font-size: .82rem; color: var(--clx-text); }

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
    .stg--neutral  { background: var(--clx-bg-alt, #f1f5f9); color: var(--clx-text-muted, #64748b); }

    /* ── Actions ── */
    .actions-cell {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }
    .act-btn {
      width: 32px; height: 32px;
      border-radius: var(--clx-radius-sm);
      font-size: .76rem; font-weight: 600;
      cursor: pointer; font-family: var(--clx-font); text-decoration: none;
      display: inline-flex; align-items: center; justify-content: center; gap: 5px;
      border: 1px solid var(--clx-border);
      background: var(--clx-surface-1);
      color: var(--clx-text-secondary);
      transition: all var(--clx-transition-fast);
    }
    .act-btn--edit:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .act-btn--record:hover { border-color: #059669; color: #059669; background: #f0fdf4; }
    .act-btn--schedule:hover { border-color: var(--clx-accent); color: var(--clx-accent); background: var(--clx-accent-muted); }
    .act-btn--history:hover { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; }
    .act-btn--delete:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }

    /* ── Pagination ── */
    .pagination {
      display: flex; justify-content: center; align-items: center;
      gap: 16px; margin-top: 24px;
    }
    .pagination button {
      padding: 8px 16px; border: 1px solid var(--clx-border-strong);
      border-radius: 9px; background: var(--clx-surface-1);
      color: var(--clx-text-secondary); font-size: .82rem; font-weight: 500;
      cursor: pointer; font-family: var(--clx-font); transition: all .2s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .pagination button:hover:not(:disabled) { border-color: var(--clx-accent); color: var(--clx-accent); }
    .pagination button:disabled { opacity: .3; cursor: default; }
    .pagination span { font-size: .82rem; color: var(--clx-text-secondary); font-weight: 500; }

    /* ── Modals ── */
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

    .modal--form { max-width: 540px; }
    .modal--timeline { max-width: 560px; }

    .modal-top {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 24px 26px 0; position: sticky; top: 0; z-index: 1;
    }
    .modal-top-left { display: flex; align-items: flex-start; gap: 13px; }
    .modal-deco {
      width: 40px; height: 40px; border-radius: 11px;
      background: linear-gradient(135deg, var(--clx-accent), color-mix(in srgb, var(--clx-accent) 70%, #000));
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

    /* ── Form ── */
    .form-body { display: flex; flex-direction: column; gap: 16px; padding: 20px 26px 24px; }
    .form-row { display: flex; gap: 14px; }
    .form-row.double .field { flex: 1; min-width: 0; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field--wide { flex: 1; }
    .field label { font-size: .8rem; font-weight: 600; color: var(--clx-text-secondary); }
    .field input, .field textarea {
      padding: 10px 13px; border: 1px solid var(--clx-border-strong); border-radius: 10px;
      background: var(--clx-surface-2); color: var(--clx-text); font-size: .87rem;
      font-family: var(--clx-font); outline: none; transition: all .2s;
    }
    .field input:focus, .field textarea:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .field textarea { resize: vertical; min-height: 80px; }
    .field-err { color: var(--clx-error); font-size: .76rem; margin-top: 2px; }

    .form-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 6px; }
    .btn-cancel {
      padding: 10px 20px; background: transparent; color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong); border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 500; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-cancel:hover { border-color: var(--clx-text-tertiary); color: var(--clx-text-primary); }

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
    .btn-danger {
      flex: 1;
      padding: 10px 20px; background: #ef4444; color: #fff;
      border: none; border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 600; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-danger:hover { background: #dc2626; }

    /* ── Timeline ── */
    .timeline-list { padding: 8px 26px 24px; display: flex; flex-direction: column; }
    .tl-item { display: flex; gap: 0; position: relative; }
    .tl-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; z-index: 1; position: relative; }
    .tl-line {
      width: 2px; background: var(--clx-border); position: absolute; left: 4px; top: 20px; bottom: 0;
    }
    .tl-item:last-child .tl-line { display: none; }
    .tl-content { flex: 1; padding: 0 0 16px 18px; }
    .tl-content p { margin: 0; font-size: .84rem; color: var(--clx-text); line-height: 1.4; }
    .tl-content span { font-size: .72rem; color: var(--clx-text-tertiary); display: block; margin-top: 3px; }
    .tl-empty { text-align: center; padding: 36px 20px; color: var(--clx-text-tertiary); font-size: .84rem; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { justify-content: space-between; }
      .filter-select { min-width: 0; flex: 1; }
      .report-table { font-size: 0.78rem; }
      .report-table thead th,
      .report-table tbody td { padding: 8px 6px; }
      .panel { padding: 14px; }
      .form-row.double { flex-direction: column; }
      .actions-cell { flex-wrap: wrap; }
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
      .tab-group { flex-wrap: wrap; }
      .report-table { font-size: 0.72rem; }
      .report-table thead th,
      .report-table tbody td { padding: 6px 4px; }
      .report-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class PacientesListComponent implements OnInit {
  private pacienteService = inject(PacienteService);

  pacientes = signal<Paciente[]>([]);
  total = signal(0);
  loading = signal(false);

  searchQuery = signal('');
  page = signal(1);
  pageSize = 12;
  sortKey = signal<'nome' | 'criadoEm'>('nome');
  sortDir = signal<'asc' | 'desc'>('asc');
  sortKeyVal: 'nome' | 'criadoEm' = 'nome';
  filtroTab = signal<'todos' | 'ativos' | 'inativos'>('todos');
  expandedId = signal<string | null>(null);
  showForm = signal(false);
  editingPaciente = signal<Paciente | null>(null);
  saveState = signal<BtnSubmitState>('idle');
  showHistorico = signal(false);
  historicoPaciente = signal<Paciente | null>(null);
  showDeleteConfirm = signal(false);
  deleteTarget = signal<Paciente | null>(null);
  historicoEventos = signal<Evento[]>([]);

  formNome = '';
  formCpf = '';
  formTelefone = '';
  formEmail = '';
  formConvenio = '';
  formCarteirinha = '';
  formDataNascimento = '';
  formObservacoes = '';
  cpfError = signal('');

  private searchDebounced = debounceSearch$(
    (q) => this.pacienteService.getAll(q, 1, this.pageSize, this.ativoFilter()),
    (res) => {
      this.pacientes.set(res.items);
      this.total.set(res.total);
      this.page.set(1);
      this.loading.set(false);
    },
    300
  );

  private ativoFilter(): boolean | null {
    const tab = this.filtroTab();
    if (tab === 'ativos') return true;
    if (tab === 'inativos') return false;
    return null;
  }

  filteredPacientes = computed(() => this.pacientes());

  // API já pagina — não fatiar de novo (causava lista vazia até recarregar/mudar aba)
  filteredTotal = computed(() => this.total());

  pacientesList = computed(() => {
    const items = [...this.filteredPacientes()];
    const key = this.sortKey();
    items.sort((a, b) => {
      let cmp: number;
      if (key === 'criadoEm') {
        cmp = new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
      } else {
        cmp = a.nome.localeCompare(b.nome);
      }
      return this.sortDir() === 'asc' ? cmp : -cmp;
    });
    return items;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredTotal() / this.pageSize)));

  ngOnInit() {
    this.carregarPacientes();
  }

  private carregarPacientes() {
    this.loading.set(true);
    this.pacienteService.getAll(this.searchQuery(), this.page(), this.pageSize, this.ativoFilter()).subscribe({
      next: (res) => { this.pacientes.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.pacientes.set([]); this.total.set(0); this.loading.set(false); },
    });
  }

  onSortKeyChange(value: string) {
    this.sortKey.set(value as 'nome' | 'criadoEm');
  }

  toggleSortDir() {
    this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
  }

  toggleExpand(id: string) {
    this.expandedId.update(v => v === id ? null : id);
  }

  prevPage() { this.page.update(p => Math.max(1, p - 1)); this.carregarPacientes(); }
  nextPage() { this.page.update(p => Math.min(this.totalPages(), p + 1)); this.carregarPacientes(); }

  onSearch(value: string) {
    this.searchQuery.set(value);
    this.loading.set(true);
    this.searchDebounced.setQuery(value);
  }

  openCreate() {
    this.editingPaciente.set(null);
    this.resetForm();
    this.saveState.set('idle');
    this.showForm.set(true);
  }

  setFiltro(tab: 'todos' | 'ativos' | 'inativos') {
    this.filtroTab.set(tab);
    this.page.set(1);
    this.carregarPacientes();
  }

  editPaciente(p: Paciente) {
    this.editingPaciente.set(p);
    this.formNome = p.nome;
    this.formCpf = p.cpf;
    this.formTelefone = p.telefone;
    this.formEmail = p.email || '';
    this.formConvenio = p.convenio || '';
    this.formCarteirinha = p.numeroCarteirinha || '';
    this.formDataNascimento = p.dataNascimento ? p.dataNascimento.split('T')[0] : '';
    this.formObservacoes = p.observacoes || '';
    this.cpfError.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.cpfError.set(''); }

  private resetForm() {
    this.formNome = ''; this.formCpf = ''; this.formTelefone = '';
    this.formEmail = ''; this.formConvenio = ''; this.formCarteirinha = '';
    this.formDataNascimento = ''; this.formObservacoes = '';
    this.cpfError.set('');
  }

  validateCpf(cpf: string): boolean {
    if (!/^\d{11}$/.test(cpf)) { this.cpfError.set('CPF deve ter 11 dígitos.'); return false; }
    if (cpf.split('').every(c => c === cpf[0])) { this.cpfError.set('CPF inválido.'); return false; }
    const calc = (pesos: number[]) => {
      const soma = pesos.reduce((acc, p, i) => acc + (cpf.charCodeAt(i) - 48) * p, 0);
      const r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    };
    if ((cpf.charCodeAt(9) - 48) !== calc([10, 9, 8, 7, 6, 5, 4, 3, 2])) { this.cpfError.set('CPF inválido.'); return false; }
    if ((cpf.charCodeAt(10) - 48) !== calc([11, 10, 9, 8, 7, 6, 5, 4, 3, 2])) { this.cpfError.set('CPF inválido.'); return false; }
    return true;
  }

  savePaciente() {
    if (!this.validateCpf(this.formCpf)) return;
    if (this.saveState() !== 'idle') return;
    this.saveState.set('loading');
    const base = {
      nome: this.formNome,
      cpf: this.formCpf,
      telefone: this.formTelefone,
      email: this.formEmail || null,
      dataNascimento: this.formDataNascimento || null,
      observacoes: this.formObservacoes || null,
      convenio: this.formConvenio || null,
      numeroCarteirinha: this.formCarteirinha || null,
    };

    const obs = this.editingPaciente()
      ? this.pacienteService.update(this.editingPaciente()!.id, {
          ...base,
          ativo: this.editingPaciente()!.ativo,
        })
      : this.pacienteService.create(base);

    obs.subscribe({
      next: () => {
        this.saveState.set('done');
        this.carregarPacientes();
        setTimeout(() => { this.saveState.set('idle'); this.closeForm(); }, 1000);
      },
      error: () => { this.saveState.set('idle'); this.cpfError.set('Erro ao salvar. Verifique os dados.'); },
    });
  }

  deletePaciente(p: Paciente) {
    this.deleteTarget.set(p);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const p = this.deleteTarget();
    if (!p) return;
    this.pacienteService.delete(p.id).subscribe({
      next: () => {
        this.carregarPacientes();
        this.cancelDelete();
      },
    });
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deleteTarget.set(null);
  }

  verHistorico(p: Paciente) {
    this.historicoPaciente.set(p);
    this.pacienteService.getEventos(p.id).subscribe({
      next: (eventos) => this.historicoEventos.set(eventos),
      error: () => this.historicoEventos.set([]),
    });
    this.showHistorico.set(true);
  }

  fecharHistorico() { this.showHistorico.set(false); this.historicoPaciente.set(null); this.historicoEventos.set([]); }

  getEventColor(tipo: string): string {
    const c: Record<string, string> = {
      PacienteCriado: '#10b981', PacienteEditado: '#3b82f6', AgendamentoCriado: '#14b8a6',
      AgendamentoCancelado: '#ef4444', NotificacaoEnviada: '#f59e0b',
    };
    return c[tipo] || '#64748b';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `há ${days}d`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  formatCpf(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
}
