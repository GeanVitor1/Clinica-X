import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PacienteService } from '../../pacientes/services/paciente.service';

type ModuloKey =
  | 'anamneses' | 'contratos' | 'injetaveis' | 'telemedicina'
  | 'vendas' | 'estoque' | 'notas' | 'transcricoes'
  | 'portal' | 'avaliacao-facial' | 'tarefas' | 'ia-textos';

interface ModuloMeta {
  title: string;
  desc: string;
  gradA: string;
  gradB: string;
  iconSvg: string;
}

const META: Record<ModuloKey, ModuloMeta> = {
  anamneses: {
    title: 'Fichas de anamnese',
    desc: 'Histórico clínico estruturado por paciente.',
    gradA: 'var(--clx-accent)',
    gradB: 'var(--clx-primary)',
    iconSvg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
  },
  contratos: {
    title: 'Termos e contratos',
    desc: 'Consentimentos e documentos com status de assinatura.',
    gradA: 'var(--clx-purple)',
    gradB: 'var(--clx-primary)',
    iconSvg: `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="12" y1="11" x2="12" y2="17"/><polyline points="9 14 12 17 15 14"/>`,
  },
  injetaveis: {
    title: 'Planejador de injetáveis',
    desc: 'Protocolos, sessões e próxima aplicação.',
    gradA: 'var(--clx-teal)',
    gradB: '#065f46',
    iconSvg: `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
  },
  telemedicina: {
    title: 'Telemedicina',
    desc: 'Salas virtuais e status das teleconsultas.',
    gradA: 'var(--clx-cyan)',
    gradB: 'var(--clx-primary)',
    iconSvg: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
  },
  vendas: {
    title: 'Vendas',
    desc: 'Vendas de produtos e serviços com pagamento.',
    gradA: 'var(--clx-amber)',
    gradB: 'var(--clx-warm)',
    iconSvg: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  },
  estoque: {
    title: 'Estoque',
    desc: 'Produtos, mínimos e movimentações.',
    gradA: 'var(--clx-warm)',
    gradB: '#92400e',
    iconSvg: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
  },
  notas: {
    title: 'Emissão de notas',
    desc: 'NFS-e / notas vinculadas a vendas e serviços.',
    gradA: 'var(--clx-success)',
    gradB: '#064e3b',
    iconSvg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
  },
  transcricoes: {
    title: 'Transcrição de consultas',
    desc: 'Texto e resumo das consultas.',
    gradA: 'var(--clx-rose)',
    gradB: 'var(--clx-primary)',
    iconSvg: `<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`,
  },
  portal: {
    title: 'Painel do paciente',
    desc: 'Acessos liberados para o portal do paciente.',
    gradA: 'var(--clx-info)',
    gradB: 'var(--clx-primary-light)',
    iconSvg: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><circle cx="12" cy="10" r="3"/>`,
  },
  'avaliacao-facial': {
    title: 'Avaliação facial com IA',
    desc: 'Scores e recomendações gerados por IA.',
    gradA: 'var(--clx-purple)',
    gradB: 'var(--clx-rose)',
    iconSvg: `<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/><polyline points="8 14 12 10 16 16"/>`,
  },
  tarefas: {
    title: 'Assistente de tarefas com IA',
    desc: 'Lista de tarefas e sugestões inteligentes.',
    gradA: 'var(--clx-amber)',
    gradB: 'var(--clx-rose)',
    iconSvg: `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  },
  'ia-textos': {
    title: 'Agente de IA para textos',
    desc: 'Gere e-mails, WhatsApp, contratos e posts.',
    gradA: 'var(--clx-accent)',
    gradB: 'var(--clx-purple)',
    iconSvg: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  },
};

const STATUS_POSITIVE = /^(ok|sim|ativo|habilitado|assinado|confirmado|pago|conclu[ií]da?|em dia|finalizado|entregue|autorizada?|liberado)$/i;
const STATUS_NEGATIVE = /^(pendente|erro|falha|cancelado|vencido|inativo|desabilitado|bloqueado|recusado|atrasado|não|nao|expirado)$/i;
const STATUS_WARN = /^(aguardando|processando|enviado|em andamento|agendado?|parcial|baixo|m[eé]dia|urgente)$/i;

function tagClass(val: any): string {
  if (val == null || val === '') return 'stg--neutral';
  const s = String(val).trim();
  if (s === '—') return 'stg--neutral';
  if (STATUS_POSITIVE.test(s)) return 'stg--positive';
  if (STATUS_NEGATIVE.test(s)) return 'stg--negative';
  if (STATUS_WARN.test(s)) return 'stg--warn';
  if (s === 'Alta') return 'stg--negative';
  if (s === 'Urgente') return 'stg--urgent';
  return 'stg--neutral';
}

const TAG_COLUMNS = new Set([
  'status', 'habilitado', 'assinaturaNome', 'prioridade', 'abaixoMinimo',
  'tipo', 'formaPagamento', 'geradaPorIa',
]);

const STAT_SUB_LABELS: Record<ModuloKey, string> = {
  anamneses: 'fichas cadastradas',
  contratos: 'documentos',
  injetaveis: 'protocolos ativos',
  telemedicina: 'consultas',
  vendas: 'vendas registradas',
  estoque: 'itens em estoque',
  notas: 'notas emitidas',
  transcricoes: 'transcrições',
  portal: 'acessos',
  'avaliacao-facial': 'avaliações',
  tarefas: 'tarefas',
  'ia-textos': 'textos gerados',
};

@Component({
  selector: 'app-modulo-generico',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }

    /* ── Header ── */
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

    /* ── KPI Grid ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    .td-center { text-align: center; }
    .td-right { text-align: right; }

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

    /* ── Form ── */
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

    /* ── AI result box ── */
    .result-box {
      white-space: pre-wrap;
      background: var(--clx-surface-2);
      border-radius: var(--clx-radius-lg);
      padding: 18px;
      border: 1px solid var(--clx-border);
      font-size: 0.9rem;
      line-height: 1.6;
      margin-top: 14px;
      font-family: var(--clx-font);
      max-height: 320px;
      overflow-y: auto;
    }

    /* ── Empty state ── */
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

    /* ── Section header ── */
    .section-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .section-hdr span {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--clx-text-muted);
    }

    @media (max-width: 700px) {
      .page-header { flex-direction: column; gap: 14px; }
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
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
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
          <h1>{{ meta.title }}</h1>
          <span class="header-subtitle">{{ meta.desc }}</span>
        </div>
        <div class="header-actions">
          @if (key === 'tarefas') {
            <button class="btn-export" type="button" (click)="sugerirTarefas()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Sugerir com IA
            </button>
          }
          @if (key !== 'ia-textos') {
            <button class="btn-export" type="button" (click)="toggleForm()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ showForm ? 'Fechar' : 'Novo' }}
            </button>
          }
        </div>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" [style.background]="'linear-gradient(135deg, ' + meta.gradA + ', ' + meta.gradB + ')'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Total</span>
            <span class="kpi-value">{{ items().length }}</span>
          </div>
        </div>
        @if (key === 'tarefas') {
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-success), #064e3b)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Concluídas</span>
              <span class="kpi-value">{{ concluidas() }}</span>
            </div>
          </div>
        }
        @if (key === 'estoque') {
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-rose), var(--clx-amber))">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Abaixo do mínimo</span>
              <span class="kpi-value">{{ abaixoMinimo() }}</span>
            </div>
          </div>
        }
        @if (key === 'vendas') {
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, var(--clx-success), var(--clx-teal))">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Faturamento</span>
              <span class="kpi-value">{{ faturamento() }}</span>
            </div>
          </div>
        }
      </div>

      @if (showForm) {
        <div class="panel">
          <h2>{{ editingId ? 'Editar registro' : 'Novo registro' }}</h2>
          <p class="panel-subtitle">{{ meta.title }}</p>
          <div class="form-grid">
            @switch (key) {
              @case ('anamneses') {
                <label>Paciente
                  <select [(ngModel)]="form.pacienteId">
                    <option value="">Selecione</option>
                    @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                  </select>
                </label>
                <label>Título <input [(ngModel)]="form.titulo" placeholder="Título da ficha" /></label>
                <label>Queixa principal <input [(ngModel)]="form.queixaPrincipal" placeholder="Queixa principal" /></label>
                <label>Alergias <input [(ngModel)]="form.alergias" placeholder="Ex: dipirona, látex" /></label>
                <label class="fw">Histórico médico <textarea [(ngModel)]="form.historicoMedico" placeholder="Histórico clínico completo..."></textarea></label>
              }
              @case ('contratos') {
                <label>Título <input [(ngModel)]="form.titulo" placeholder="Ex: Termo de consentimento" /></label>
                <label class="fw">Conteúdo <textarea [(ngModel)]="form.conteudo" placeholder="Corpo do contrato..."></textarea></label>
              }
              @case ('injetaveis') {
                <label>Paciente
                  <select [(ngModel)]="form.pacienteId">
                    <option value="">Selecione</option>
                    @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                  </select>
                </label>
                <label>Substância <input [(ngModel)]="form.substancia" placeholder="Ex: Ácido hialurônico" /></label>
                <label>Protocolo <input [(ngModel)]="form.protocolo" placeholder="Nome do protocolo" /></label>
                <label>Área de aplicação <input [(ngModel)]="form.areaAplicacao" placeholder="Ex: Malar" /></label>
                <label>Total de sessões <input type="number" [(ngModel)]="form.totalSessoes" min="1" /></label>
                <label>Intervalo (dias) <input type="number" [(ngModel)]="form.intervaloDias" min="1" /></label>
              }
              @case ('telemedicina') {
                <label>Paciente
                  <select [(ngModel)]="form.pacienteId">
                    <option value="">Selecione</option>
                    @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                  </select>
                </label>
                <label>Data/hora <input type="datetime-local" [(ngModel)]="form.dataHoraInicio" /></label>
                <label class="fw">Observações <input [(ngModel)]="form.observacoes" placeholder="Notas da teleconsulta..." /></label>
              }
              @case ('vendas') {
                <label>Descrição do item <input [(ngModel)]="form.descricao" placeholder="Produto ou serviço" /></label>
                <label>Valor unitário <input type="number" [(ngModel)]="form.valorUnitario" min="0" step="0.01" /></label>
                <label>Quantidade <input type="number" [(ngModel)]="form.quantidade" min="1" /></label>
              }
              @case ('estoque') {
                <label>Nome do produto <input [(ngModel)]="form.nome" placeholder="Nome do produto" /></label>
                <label>SKU <input [(ngModel)]="form.sku" placeholder="Código SKU" /></label>
                <label>Quantidade <input type="number" [(ngModel)]="form.quantidade" min="0" /></label>
                <label>Estoque mínimo <input type="number" [(ngModel)]="form.quantidadeMinima" min="0" /></label>
                <label>Custo unitário <input type="number" [(ngModel)]="form.custoUnitario" min="0" step="0.01" /></label>
                <label>Preço de venda <input type="number" [(ngModel)]="form.precoVenda" min="0" step="0.01" /></label>
              }
              @case ('notas') {
                <label>Valor <input type="number" [(ngModel)]="form.valor" min="0" step="0.01" /></label>
                <label class="fw">Descrição do serviço <input [(ngModel)]="form.descricaoServico" placeholder="Descrição para a NFS-e..." /></label>
              }
              @case ('transcricoes') {
                <label>Paciente
                  <select [(ngModel)]="form.pacienteId">
                    <option value="">Selecione</option>
                    @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                  </select>
                </label>
                <label class="fw">Texto da consulta <textarea [(ngModel)]="form.texto" placeholder="Transcrição da consulta..."></textarea></label>
              }
              @case ('portal') {
                <label>Paciente
                  <select [(ngModel)]="form.pacienteId">
                    <option value="">Selecione</option>
                    @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                  </select>
                </label>
                <label>E-mail <input type="email" [(ngModel)]="form.email" placeholder="paciente@email.com" /></label>
              }
              @case ('avaliacao-facial') {
                <label>Paciente
                  <select [(ngModel)]="form.pacienteId">
                    <option value="">Selecione</option>
                    @for (p of pacientes(); track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
                  </select>
                </label>
                <label class="fw">Observações <input [(ngModel)]="form.observacoes" placeholder="Observações da avaliação..." /></label>
              }
              @case ('tarefas') {
                <label>Título <input [(ngModel)]="form.titulo" placeholder="Título da tarefa" /></label>
                <label>Prioridade
                  <select [(ngModel)]="form.prioridade">
                    <option>Baixa</option>
                    <option>Media</option>
                    <option>Alta</option>
                    <option>Urgente</option>
                  </select>
                </label>
                <label class="fw">Descrição <textarea [(ngModel)]="form.descricao" placeholder="Detalhes da tarefa..."></textarea></label>
              }
            }
          </div>
          <div class="form-actions">
            <button class="btn-cancel" type="button" (click)="showForm = false">Cancelar</button>
            <button class="btn-save" type="button" (click)="salvar()">Salvar</button>
          </div>
        </div>
      }

      @if (key === 'ia-textos') {
        <div class="panel">
          <h2>Gerar texto com IA</h2>
          <p class="panel-subtitle">Gere textos automaticamente com inteligência artificial</p>
          <div class="form-grid">
            <label>Tipo
              <select [(ngModel)]="form.tipo">
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="contrato">Contrato</option>
                <option value="post">Post para redes</option>
                <option value="prontuario">Prontuário</option>
                <option value="geral">Texto geral</option>
              </select>
            </label>
            <label class="fw">Prompt <textarea [(ngModel)]="form.prompt" placeholder="Descreva o que o texto deve conter..."></textarea></label>
          </div>
          <div class="form-actions">
            <button class="btn-save" type="button" (click)="gerarTexto()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Gerar
            </button>
          </div>
          @if (ultimoTexto()) {
            <div class="result-box">{{ ultimoTexto() }}</div>
          }
        </div>
      }

      <div class="panel">
        @if (!items().length) {
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
            <h4>Nenhum registro encontrado</h4>
            <p>
              @if (auth.isDemo()) {
                Os dados mock estão sendo carregados. Se ainda estiver vazio, o módulo pode não ter exemplos pré-definidos.
              } @else {
                Sua conta ainda não possui registros neste módulo. Clique em <strong>Novo</strong> para começar.
              }
            </p>
          </div>
        } @else {
          <div class="table-toolbar">
            <div class="search-box">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                class="search-input"
                placeholder="Buscar..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
              />
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
                  @for (col of columns; track col) {
                    <th>{{ colLabel(col) }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of filteredItems(); track row.id) {
                  <tr>
                    @for (col of columns; track col) {
                      <td [class.td-center]="col === 'status' || col === 'prioridade' || col === 'habilitado'" [attr.data-label]="colLabel(col)">
                        @if (col === 'status' || col === 'prioridade' || col === 'habilitado' || col === 'abaixoMinimo' || col === 'geradaPorIa') {
                          <span class="stg" [class]="tagStyle(row, col)">{{ display(row, col) }}</span>
                        } @else {
                          {{ display(row, col) }}
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (filteredItems().length === 0 && searchQuery()) {
            <p class="no-results">Nenhum registro encontrado para "{{ searchQuery() }}".</p>
          }
        }
      </div>
    </div>
  `,
})
export class ModuloGenericoComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly route = inject(ActivatedRoute);

  key: ModuloKey = 'anamneses';
  meta = META.anamneses;
  items = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  showForm = false;
  editingId: string | null = null;
  form: any = {};
  ultimoTexto = signal('');
  columns: string[] = [];
  searchQuery = signal('');

  statSub = computed(() => STAT_SUB_LABELS[this.key] || 'registros');
  concluidas = computed(() => this.items().filter((i: any) => {
    const s = String(i.status || '').toLowerCase();
    return s.includes('conclu') || s.includes('finaliz') || s === 'ok';
  }).length);
  abaixoMinimo = computed(() => this.items().filter((i: any) => i.abaixoMinimo === true).length);
  faturamento = computed(() => {
    const total = this.items().reduce((sum: number, i: any) => sum + (Number(i.total) || 0), 0);
    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  });

  filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.items();
    if (!q) return list;
    return list.filter(row => {
      return this.columns.some(col => {
        const v = row[col];
        if (v == null) return false;
        return String(v).toLowerCase().includes(q);
      });
    });
  });

  ngOnInit() {
    this.route.data.subscribe((d) => {
      this.key = (d['modulo'] as ModuloKey) || 'anamneses';
      this.meta = META[this.key];
      this.columns = this.colsFor(this.key);
      this.resetForm();
      this.load();
    });
    this.pacientesApi.getAll('', 1, 100).subscribe({
      next: (r: any) => this.pacientes.set(r.items || r || []),
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) this.resetForm();
  }

  colLabel(col: string): string {
    const labels: Record<string, string> = {
      titulo: 'Título', status: 'Status', assinaturaNome: 'Assinado por',
      criadoEm: 'Criado em', substancia: 'Substância', protocolo: 'Protocolo',
      sessoesRealizadas: 'Sessões', totalSessoes: 'Total', proximaSessao: 'Próxima',
      dataHoraInicio: 'Data/Hora', linkSala: 'Sala', observacoes: 'Obs.',
      data: 'Data', total: 'Total', formaPagamento: 'Pagamento',
      nome: 'Produto', sku: 'SKU', quantidade: 'Qtd', quantidadeMinima: 'Mínimo',
      abaixoMinimo: 'Estoque', numero: 'Nº', valor: 'Valor', dataEmissao: 'Emissão',
      descricaoServico: 'Serviço', resumo: 'Resumo', duracaoSegundos: 'Duração',
      email: 'E-mail', tokenAcesso: 'Token', habilitado: 'Habilitado',
      ultimoAcesso: 'Último acesso', scoreGeral: 'Score', recomendacoes: 'Recomendações',
      prioridade: 'Prioridade', geradaPorIa: 'IA', prazo: 'Prazo',
      tipo: 'Tipo', prompt: 'Prompt', resultado: 'Resultado',
      descricao: 'Descrição', queixaPrincipal: 'Queixa', alergias: 'Alergias',
    };
    return labels[col] || col;
  }

  cardTitleColumn(): string {
    const first = this.columns[0];
    if (first === 'data' || first === 'criadoEm' || first === 'dataEmissao') return first;
    return first || this.columns[0];
  }

  cardTitle(row: any): string {
    const col = this.cardTitleColumn();
    if (!col) return '—';
    const v = row[col];
    if (v == null) return 'Sem título';
    if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
    if (col === 'total' || col === 'valor') {
      return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    if (col === 'data' || col === 'criadoEm' || col === 'dataEmissao' || col === 'prazo' || col === 'proximaSessao' || col === 'dataHoraInicio') {
      try { return new Date(v).toLocaleDateString('pt-BR'); } catch { return String(v); }
    }
    return String(v);
  }

  tagStyle(row: any, col: string): string {
    const v = row[col];
    if (col === 'abaixoMinimo') return v ? 'stg--negative' : 'stg--positive';
    if (col === 'habilitado') return v ? 'stg--positive' : 'stg--neutral';
    if (col === 'geradaPorIa') return v ? 'stg--info' : 'stg--neutral';
    return tagClass(v);
  }

  private resetForm() {
    const firstPac = this.pacientes()[0]?.id || '';
    this.form = {
      pacienteId: firstPac, titulo: '', queixaPrincipal: '', alergias: '',
      historicoMedico: '', conteudo: '', substancia: '', protocolo: '',
      areaAplicacao: '', totalSessoes: 3, intervaloDias: 30,
      dataHoraInicio: '', observacoes: '', descricao: '',
      valorUnitario: 100, quantidade: 1, nome: '', sku: '',
      quantidadeMinima: 5, custoUnitario: 0, precoVenda: 0,
      valor: 0, descricaoServico: '', texto: '', email: '',
      prioridade: 'Media', tipo: 'whatsapp', prompt: '',
    };
  }

  private colsFor(key: ModuloKey): string[] {
    switch (key) {
      case 'anamneses': return ['titulo', 'data', 'queixaPrincipal', 'alergias'];
      case 'contratos': return ['titulo', 'status', 'assinaturaNome', 'criadoEm'];
      case 'injetaveis': return ['substancia', 'protocolo', 'sessoesRealizadas', 'totalSessoes', 'status', 'proximaSessao'];
      case 'telemedicina': return ['dataHoraInicio', 'status', 'linkSala', 'observacoes'];
      case 'vendas': return ['data', 'total', 'status', 'formaPagamento'];
      case 'estoque': return ['nome', 'sku', 'quantidade', 'quantidadeMinima', 'abaixoMinimo'];
      case 'notas': return ['numero', 'valor', 'status', 'dataEmissao', 'descricaoServico'];
      case 'transcricoes': return ['data', 'resumo', 'status', 'duracaoSegundos'];
      case 'portal': return ['email', 'tokenAcesso', 'habilitado', 'ultimoAcesso'];
      case 'avaliacao-facial': return ['data', 'scoreGeral', 'recomendacoes'];
      case 'tarefas': return ['titulo', 'prioridade', 'status', 'geradaPorIa', 'prazo'];
      case 'ia-textos': return ['tipo', 'prompt', 'resultado', 'criadoEm'];
    }
  }

  display(row: any, col: string): string {
    const v = row[col];
    if (v == null) return '—';
    if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
    if (col.toLowerCase().includes('data') || col === 'prazo' || col === 'criadoEm' || col === 'proximaSessao' || col === 'ultimoAcesso' || col === 'dataHoraInicio' || col === 'dataEmissao') {
      try { return new Date(v).toLocaleString('pt-BR'); } catch { return String(v); }
    }
    if (col === 'total' || col === 'valor') {
      return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    if (col === 'resultado' || col === 'prompt') {
      const s = String(v);
      return s.length > 80 ? s.slice(0, 77) + '…' : s;
    }
    if (col === 'sessoesRealizadas') return `${row.sessoesRealizadas}/${row.totalSessoes}`;
    if (col === 'abaixoMinimo') return v ? '⚠️ Baixo' : 'OK';
    if (col === 'scoreGeral') return String(v);
    return String(v);
  }

  load() {
    const map: Record<ModuloKey, () => any> = {
      anamneses: () => this.api.listAnamneses(),
      contratos: () => this.api.listContratos(),
      injetaveis: () => this.api.listInjetaveis(),
      telemedicina: () => this.api.listTeleconsultas(),
      vendas: () => this.api.listVendas(),
      estoque: () => this.api.listProdutos(),
      notas: () => this.api.listNotas(),
      transcricoes: () => this.api.listTranscricoes(),
      portal: () => this.api.listPortal(),
      'avaliacao-facial': () => this.api.listAvaliacoes(),
      tarefas: () => this.api.listTarefas(),
      'ia-textos': () => this.api.listTextos(),
    };
    map[this.key]().subscribe({
      next: (d: any) => this.items.set(d || []),
      error: () => this.items.set([]),
    });
  }

  salvar() {
    const f = this.form;
    let req$;
    switch (this.key) {
      case 'anamneses': req$ = this.api.createAnamnese(f); break;
      case 'contratos': req$ = this.api.createContrato({ titulo: f.titulo, conteudo: f.conteudo }); break;
      case 'injetaveis': req$ = this.api.createInjetavel(f); break;
      case 'telemedicina':
        req$ = this.api.createTeleconsulta({
          pacienteId: f.pacienteId,
          dataHoraInicio: f.dataHoraInicio ? new Date(f.dataHoraInicio).toISOString() : new Date().toISOString(),
          observacoes: f.observacoes,
        }); break;
      case 'vendas':
        req$ = this.api.createVenda({
          desconto: 0,
          itens: [{ descricao: f.descricao, quantidade: f.quantidade, valorUnitario: f.valorUnitario }],
        }); break;
      case 'estoque': req$ = this.api.createProduto(f); break;
      case 'notas': req$ = this.api.emitirNota(f); break;
      case 'transcricoes': req$ = this.api.createTranscricao(f); break;
      case 'portal': req$ = this.api.createPortal(f); break;
      case 'avaliacao-facial': req$ = this.api.createAvaliacao(f); break;
      case 'tarefas': req$ = this.api.createTarefa(f); break;
      default: return;
    }
    req$.subscribe({
      next: () => { this.toast.show('success', 'Salvo com sucesso'); this.showForm = false; this.load(); },
      error: (e) => this.toast.show('error', e?.error || 'Falha ao salvar'),
    });
  }

  gerarTexto() {
    this.api.gerarTexto(this.form.tipo, this.form.prompt).subscribe({
      next: (r) => { this.ultimoTexto.set(r.resultado); this.toast.show('success', 'Texto gerado'); this.load(); },
      error: () => this.toast.show('error', 'Falha ao gerar texto'),
    });
  }

  sugerirTarefas() {
    this.api.sugerirTarefas().subscribe({
      next: () => { this.toast.show('success', 'Tarefas sugeridas pela IA'); this.load(); },
      error: () => this.toast.show('error', 'Falha ao sugerir tarefas'),
    });
  }
}
