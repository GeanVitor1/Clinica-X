import { Component, signal, computed, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModulosApiService } from '../services/modulos-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

interface TextoIa {
  id?: string;
  tipo?: string;
  prompt?: string;
  resultado?: string;
  criadoEm?: string;
  [key: string]: any;
}

const TIPOS: { value: string; label: string; icon: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { value: 'email', label: 'E-mail', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
  { value: 'contrato', label: 'Contrato', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M16 2v6h6 M9 15h6 M12 12v6' },
  { value: 'post', label: 'Post', icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
  { value: 'prontuario', label: 'Prontuário', icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-4H7v4 M7 3v4h8V3' },
  { value: 'geral', label: 'Texto geral', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
];

const TIPO_ICONS: Record<string, string> = {
  whatsapp: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  email: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  contrato: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M16 2v6h6 M9 15h6 M12 12v6',
  post: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  prontuario: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-4H7v4 M7 3v4h8V3',
  geral: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
};

const TIPO_COLORS: Record<string, string> = {
  whatsapp: 'var(--clx-teal)',
  email: 'var(--clx-accent)',
  contrato: 'var(--clx-purple)',
  post: 'var(--clx-amber)',
  prontuario: 'var(--clx-cyan)',
  geral: 'var(--clx-rose)',
};

const TIPO_MUTED: Record<string, string> = {
  whatsapp: 'var(--clx-teal-muted)',
  email: 'var(--clx-accent-muted)',
  contrato: 'var(--clx-purple-muted)',
  post: 'var(--clx-amber-muted)',
  prontuario: 'var(--clx-cyan-muted)',
  geral: 'var(--clx-rose-muted)',
};

@Component({
  selector: 'app-ia-textos-page',
  standalone: true,
  imports: [FormsModule, DatePipe, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Agente de IA para textos</h1>
          <span class="header-subtitle">Gere e-mails, WhatsApp, contratos e posts com inteligência artificial</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="exportCsv()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar CSV
          </button>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton variant="table" />
        <app-skeleton variant="chart" />
      }

      <div class="report-content" [class.hidden]="loading()">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--revenue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total de Textos</span>
              <span class="kpi-value">{{ textos().length }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--services">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Palavras Geradas</span>
              <span class="kpi-value">{{ totalPalavras() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--ticket">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Tipos Utilizados</span>
              <span class="kpi-value">{{ tiposUtilizados() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--diversity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Última Geração</span>
              <span class="kpi-value" style="font-size:0.9rem;">{{ ultimaGeracaoLabel() }}</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Gerar texto</h2>
          <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 20px 0;">Escolha o tipo e descreva o que deseja gerar</p>

          <div class="tipo-pills">
            @for (t of TIPOS; track t.value) {
              <button type="button" class="pill" [class.pill--active]="tipoSelecionado() === t.value"
                [style.--pill-color]="TIPO_COLORS[t.value]"
                [style.--pill-muted]="TIPO_MUTED[t.value]"
                (click)="tipoSelecionado.set(t.value)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="t.icon"/>
                </svg>
                {{ t.label }}
              </button>
            }
          </div>

          <div class="form-grid" style="margin-top: 18px;">
            <label class="fw">Descrição / Prompt
              <textarea [(ngModel)]="prompt" placeholder="Descreva o que o texto deve conter... Ex: lembrete de consulta para paciente sobre retorno em 30 dias" rows="4"></textarea>
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-save" type="button" (click)="gerarTexto()" [disabled]="gerando() || !prompt.trim()">
              @if (gerando()) {
                <span class="spinner"></span>
                Gerando...
              } @else {
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Gerar
              }
            </button>
          </div>

          @if (resultado()) {
            <div class="result-area">
              <div class="result-header">
                <div class="result-meta">
                  <span class="result-type-badge" [style.background]="TIPO_MUTED[tipoSelecionado()]" [style.color]="TIPO_COLORS[tipoSelecionado()]">
                    {{ tipoLabel(tipoSelecionado()) }}
                  </span>
                  <span class="result-date">{{ agora() | date:"dd/MM/yyyy HH:mm" }}</span>
                </div>
                <div class="result-actions">
                  <button class="btn-copy" type="button" (click)="copiarResultado()" [title]="copiado() ? 'Copiado!' : 'Copiar texto'">
                    @if (copiado()) {
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      Copiado
                    } @else {
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copiar
                    }
                  </button>
                  @if (tipoSelecionado() === 'whatsapp' || tipoSelecionado() === 'email') {
                    <button class="btn-send" type="button" (click)="enviarTexto()" [disabled]="enviando()">
                      @if (enviando()) {
                        <span class="spinner"></span>
                        Enviando...
                      } @else {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Enviar para o cliente
                      }
                    </button>
                  }
                </div>
              </div>
              @if (tipoSelecionado() === 'whatsapp' && showPhoneInput()) {
                <div class="phone-input-area">
                  <label class="phone-label">Telefone do paciente (com DDD)</label>
                  <input type="tel" class="phone-input" placeholder="(11) 99999-9999" [(ngModel)]="pacienteTelefone" maxlength="15">
                </div>
              }
              <div class="result-text">{{ resultado() }}</div>
            </div>
          }
        </div>

        <div class="panel">
          <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Histórico de textos</h2>
          <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;">Textos gerados anteriormente</p>

          @if (textos().length === 0) {
            <app-empty-state icon="relatorios" message="Nenhum texto gerado ainda. Crie seu primeiro texto acima." />
          }

          @if (textos().length > 0) {
            <div class="table-toolbar">
              <div class="search-box">
                <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" class="search-input" placeholder="Buscar no histórico..." [ngModel]="busca()" (ngModelChange)="busca.set($event)">
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
                <select class="filter-select" [ngModel]="filtroTipo()" (ngModelChange)="filtroTipo.set($event)">
                  <option value="">Todos os tipos</option>
                  @for (t of TIPOS; track t.value) {
                    <option [value]="t.value">{{ t.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="table-wrap">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Prompt</th>
                    <th>Resultado</th>
                    <th class="th-right">Data</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of textosFiltrados(); track item.id || $index) {
                    <tr>
                      <td data-label="Tipo">
                        <span class="tipo-badge" [style.background]="TIPO_MUTED[item.tipo || 'geral']" [style.color]="TIPO_COLORS[item.tipo || 'geral']">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path [attr.d]="TIPO_ICONS[item.tipo || 'geral']"/>
                          </svg>
                          {{ tipoLabel(item.tipo) }}
                        </span>
                      </td>
                      <td class="td-texto" data-label="Prompt">{{ truncate(item.prompt, 60) }}</td>
                      <td class="td-texto" data-label="Resultado">{{ truncate(item.resultado, 80) }}</td>
                      <td class="td-right td-date" data-label="Data">{{ item.criadoEm | date:"dd/MM/yyyy HH:mm" }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            @if (textosFiltrados().length === 0 && (busca() || filtroTipo())) {
              <p class="no-results">Nenhum texto encontrado para esta busca.</p>
            }
          }
        </div>

        @if (textos().length > 0 && !busca() && !filtroTipo()) {
          <div class="panel">
            <h2 style="font-size: 1.08rem; margin: 0 0 4px 0; color: var(--clx-text-primary); font-weight: 700;">Resumo por tipo</h2>
            <p class="card-subtitle" style="font-size: 0.8rem; color: var(--clx-text-tertiary); margin: 0 0 24px 0;">Distribuição dos textos gerados</p>
            <div class="resumo-tipos">
              @for (t of TIPOS; track t.value) {
                @let qtd = tipoCount(t.value);
                @if (qtd > 0) {
                  <div class="resumo-item">
                    <div class="resumo-item-header">
                      <span class="tipo-badge" [style.background]="TIPO_MUTED[t.value]" [style.color]="TIPO_COLORS[t.value]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path [attr.d]="t.icon"/>
                        </svg>
                        {{ t.label }}
                      </span>
                      <span class="resumo-qtd">{{ qtd }}x</span>
                    </div>
                    <div class="resumo-track">
                      <div class="resumo-fill" [style.width.%]="(qtd / textos().length) * 100" [style.background]="TIPO_COLORS[t.value]"></div>
                    </div>
                    <span class="resumo-pct">{{ ((qtd / textos().length) * 100).toFixed(0) }}%</span>
                  </div>
                }
              }
            </div>
          </div>
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
    .kpi-icon--diversity { background: var(--clx-amber-muted); color: var(--clx-amber); }

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

    .tipo-pills {
      display: flex; flex-wrap: wrap; gap: 6px;
    }
    .pill {
      padding: 7px 16px;
      border: 1.5px solid var(--clx-border-strong);
      background: var(--clx-surface-1);
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 550;
      font-family: var(--clx-font);
      color: var(--clx-text-secondary);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      line-height: 1;
    }
    .pill:hover {
      border-color: var(--pill-color, var(--clx-accent));
      color: var(--pill-color, var(--clx-accent));
    }
    .pill--active {
      background: var(--pill-muted, var(--clx-accent-muted));
      border-color: var(--pill-color, var(--clx-accent));
      color: var(--pill-color, var(--clx-accent));
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .form-grid label {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--clx-text-secondary);
    }
    .form-grid textarea {
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      padding: 12px 14px;
      background: var(--clx-surface-2);
      font-size: 0.9rem;
      color: var(--clx-text);
      font-family: var(--clx-font);
      outline: none;
      transition: all var(--clx-transition-fast);
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }
    .form-grid textarea:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding-top: 8px;
    }
    .btn-save {
      padding: 10px 24px; background: var(--clx-accent); color: #fff;
      border: none; border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 600; font-family: var(--clx-font);
      transition: all .2s; display: inline-flex; align-items: center; gap: 7px;
    }
    .btn-save:hover:not(:disabled) { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .result-area {
      margin-top: 20px;
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      overflow: hidden;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--clx-border);
      background: var(--clx-surface-1);
    }
    .result-meta { display: flex; align-items: center; gap: 10px; }
    .result-type-badge {
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .result-date { font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 500; }
    .btn-copy {
      padding: 5px 12px;
      background: transparent;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--clx-font);
      color: var(--clx-text-secondary);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      line-height: 1;
    }
    .btn-copy:hover { border-color: var(--clx-accent); color: var(--clx-accent); background: var(--clx-accent-muted); }

    .result-actions {
      display: flex;
      gap: 8px;
    }

    .btn-send {
      padding: 9px 16px;
      background: var(--clx-teal);
      color: white;
      border: none;
      border-radius: var(--clx-radius-sm);
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      line-height: 1;
    }
    .btn-send:hover { background: var(--clx-teal-dark, #0d9488); transform: translateY(-1px); box-shadow: var(--clx-shadow-sm); }
    .btn-send:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .phone-input-area {
      padding: 14px 20px;
      border-bottom: 1px solid var(--clx-border);
    }
    .phone-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--clx-text-secondary);
      margin-bottom: 6px;
    }
    .phone-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      font-size: 0.88rem;
      font-family: var(--clx-font);
      color: var(--clx-text-primary);
      background: var(--clx-surface-1);
      transition: border-color var(--clx-transition-fast), box-shadow var(--clx-transition-fast);
    }
    .phone-input:focus {
      outline: none;
      border-color: var(--clx-teal);
      box-shadow: 0 0 0 3px var(--clx-teal-muted);
    }

    .result-text {
      padding: 18px 20px;
      white-space: pre-wrap;
      font-size: 0.9rem;
      line-height: 1.65;
      color: var(--clx-text-primary);
      font-family: var(--clx-font);
      max-height: 320px;
      overflow-y: auto;
    }

    .tipo-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
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
    .td-right { text-align: right; }
    .td-date { font-size: 0.8rem; color: var(--clx-text-tertiary); white-space: nowrap; }
    .td-texto {
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--clx-text-secondary);
      font-size: 0.84rem;
    }

    .resumo-tipos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    .resumo-item {
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-md);
      padding: 16px;
    }
    .resumo-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .resumo-qtd {
      font-size: 1rem;
      font-weight: 700;
      color: var(--clx-text-primary);
    }
    .resumo-track {
      height: 10px;
      background: var(--clx-surface-3);
      border-radius: 100px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .resumo-fill {
      height: 100%;
      border-radius: 100px;
      transition: width 0.7s var(--clx-ease-out);
    }
    .resumo-pct {
      font-size: 0.72rem;
      color: var(--clx-text-tertiary);
      font-weight: 550;
    }

    .hidden { display: none; }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; gap: 14px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .table-toolbar { flex-direction: column; align-items: stretch; padding: 14px 16px; }
      .search-box { min-width: 0; }
      .filter-group { flex-wrap: wrap; }
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
      .report-table tbody td.td-right,
      .report-table tbody td[class*="action"] {
        justify-content: flex-end;
        padding-top: 8px;
      }
      .panel { padding: 14px; }
      .resumo-tipos { grid-template-columns: 1fr; }
    }
    @media (max-width: 450px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .report-table tbody td { font-size: 0.72rem; }
    }
  `],
})
export class IaTextosPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);

  readonly TIPOS = TIPOS;
  readonly TIPO_COLORS = TIPO_COLORS;
  readonly TIPO_MUTED = TIPO_MUTED;
  readonly TIPO_ICONS = TIPO_ICONS;

  textos = signal<TextoIa[]>([]);
  loading = signal(false);
  gerando = signal(false);
  enviando = signal(false);
  tipoSelecionado = signal('whatsapp');
  prompt = '';
  resultado = signal('');
  copiado = signal(false);
  busca = signal('');
  filtroTipo = signal('');
  agora = signal(new Date());
  pacienteTelefone = '';
  showPhoneInput = signal(false);

  totalPalavras = computed(() => {
    const total = this.textos().reduce((sum, t) => sum + (t.resultado || '').split(/\s+/).filter(Boolean).length, 0);
    return total.toLocaleString('pt-BR');
  });

  tiposUtilizados = computed(() => {
    const tipos = new Set(this.textos().map(t => t.tipo || 'geral'));
    return tipos.size;
  });

  ultimaGeracaoLabel = computed(() => {
    const items = this.textos();
    if (items.length === 0) return '—';
    const ultimo = items[0];
    if (!ultimo.criadoEm) return '—';
    try {
      const d = new Date(ultimo.criadoEm);
      const agora = new Date();
      const diff = agora.getTime() - d.getTime();
      const horas = Math.floor(diff / 3600000);
      if (horas < 1) return 'Agora mesmo';
      if (horas < 24) return `${horas}h atrás`;
      const dias = Math.floor(horas / 24);
      if (dias < 30) return `${dias}d atrás`;
      return d.toLocaleDateString('pt-BR');
    } catch { return '—'; }
  });

  textosFiltrados = computed(() => {
    const q = this.busca().toLowerCase().trim();
    const tipo = this.filtroTipo();
    let items = this.textos();

    if (tipo) {
      items = items.filter(t => t.tipo === tipo);
    }
    if (q) {
      items = items.filter(t =>
        (t.prompt && t.prompt.toLowerCase().includes(q)) ||
        (t.resultado && t.resultado.toLowerCase().includes(q)) ||
        (t.tipo && t.tipo.toLowerCase().includes(q))
      );
    }
    return items;
  });

  tipoCount = (tipo: string) => this.textos().filter(t => t.tipo === tipo).length;

  ngOnInit() {
    this.carregarTextos();
  }

  carregarTextos() {
    this.loading.set(true);
    this.api.listTextos().subscribe({
      next: (data) => { this.textos.set(data || []); this.loading.set(false); },
      error: () => { this.textos.set([]); this.loading.set(false); },
    });
  }

  tipoLabel(tipo?: string): string {
    return TIPOS.find(t => t.value === (tipo || 'geral'))?.label || 'Texto geral';
  }

  gerarTexto() {
    if (!this.prompt.trim()) return;
    this.gerando.set(true);
    this.copiado.set(false);
    this.api.gerarTexto(this.tipoSelecionado(), this.prompt).subscribe({
      next: (r) => {
        this.resultado.set(r.resultado);
        this.agora.set(new Date());
        this.toast.show('success', 'Texto gerado com sucesso');
        this.gerando.set(false);
        this.carregarTextos();
      },
      error: () => {
        this.toast.show('error', 'Falha ao gerar texto');
        this.gerando.set(false);
      },
    });
  }

  async copiarResultado() {
    try {
      await navigator.clipboard.writeText(this.resultado());
      this.copiado.set(true);
      this.toast.show('success', 'Texto copiado para a área de transferência');
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.toast.show('error', 'Falha ao copiar texto');
    }
  }

  enviarTexto() {
    if (!this.resultado()) return;

    if (this.tipoSelecionado() === 'whatsapp' && !this.pacienteTelefone.trim()) {
      this.showPhoneInput.set(true);
      this.toast.show('warning', 'Informe o telefone do paciente para enviar via WhatsApp');
      return;
    }

    this.enviando.set(true);
    this.api.enviarTexto(this.tipoSelecionado(), this.resultado(), this.pacienteTelefone || undefined).subscribe({
      next: () => {
        this.toast.show('success', 'Mensagem enviada com sucesso!');
        this.enviando.set(false);
        this.showPhoneInput.set(false);
      },
      error: (err) => {
        this.toast.show('error', err.error?.message || 'Falha ao enviar mensagem');
        this.enviando.set(false);
      },
    });
  }

  truncate(val: any, max: number): string {
    const s = String(val || '');
    return s.length > max ? s.slice(0, max - 3) + '...' : s;
  }

  exportCsv() {
    let csv = 'Tipo,Prompt,Resultado,Data\n';
    for (const t of this.textos()) {
      const prompt = (t.prompt || '').replace(/"/g, '""');
      const resultado = (t.resultado || '').replace(/"/g, '""');
      csv += `${t.tipo || ''},"${prompt}","${resultado}",${t.criadoEm || ''}\n`;
    }
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ia-textos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
