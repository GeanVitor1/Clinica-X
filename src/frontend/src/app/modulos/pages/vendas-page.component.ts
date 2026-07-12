import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModulosApiService } from '../services/modulos-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton.component';

interface VendaItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

interface Venda {
  id: string;
  pacienteId?: string;
  data: string;
  subtotal: number;
  desconto: number;
  total: number;
  status: string;
  formaPagamento?: string;
  observacoes?: string;
  itens: VendaItem[];
}

@Component({
  selector: 'app-vendas-page',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Vendas</h1>
          <span class="header-subtitle">Vendas de produtos e serviços com pagamento</span>
        </div>
        <div class="header-actions">
          <button class="btn-primary" type="button" (click)="toggleForm()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ showForm() ? 'Fechar' : 'Nova venda' }}
          </button>
        </div>
      </header>

      @if (loading()) {
        <div class="kpi-grid">
          @for (_ of [1,2,3,4]; track $index) {
            <app-skeleton variant="card" />
          }
        </div>
        <app-skeleton variant="table" />
      } @else {
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--total">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total</span>
              <span class="kpi-value">{{ items().length }}</span>
              <span class="kpi-sub">vendas registradas</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--fat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Faturamento</span>
              <span class="kpi-value kpi-value--sm">{{ faturamentoLabel() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--paga">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Pagas</span>
              <span class="kpi-value">{{ pagasCount() }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--pendente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Pendentes</span>
              <span class="kpi-value">{{ pendentesCount() }}</span>
            </div>
          </div>
        </div>

        @if (showForm()) {
          <div class="panel form-panel">
            <div class="panel-header">
              <span class="panel-dot"></span>
              <h3>Nova venda</h3>
            </div>
            <div class="form-grid">
              <label>Descrição do item *
                <input [(ngModel)]="form.descricao" name="descricao" placeholder="Produto ou serviço" autocomplete="off" />
              </label>
              <label>Valor unitário *
                <input type="number" [(ngModel)]="form.valorUnitario" name="valor" min="0" step="0.01" />
              </label>
              <label>Quantidade *
                <input type="number" [(ngModel)]="form.quantidade" name="qtd" min="1" />
              </label>
            </div>
            <div class="form-actions">
              <button class="btn-primary" type="button" [disabled]="saving()" (click)="salvar()">
                {{ saving() ? 'Salvando…' : 'Registrar venda' }}
              </button>
              <button class="btn-ghost" type="button" (click)="showForm.set(false)">Cancelar</button>
            </div>
          </div>
        }

        <div class="panel">
          @if (items().length === 0) {
            <div class="empty-wrap">
              <h4>Nenhuma venda encontrada</h4>
              <p>Clique em <strong>Nova venda</strong> para registrar a primeira venda.</p>
              <button class="btn-primary" type="button" (click)="toggleForm()">Nova venda</button>
            </div>
          } @else {
            <div class="table-toolbar">
              <div class="search-box">
                <input
                  type="text"
                  class="search-input"
                  placeholder="Buscar por itens, forma pagamento..."
                  [ngModel]="busca()"
                  (ngModelChange)="busca.set($event)"
                />
              </div>
              <div class="filter-group">
                <label class="filter-label">Status:</label>
                <select class="filter-select" [ngModel]="filtroStatus()" (ngModelChange)="filtroStatus.set($event)">
                  <option value="todos">Todos</option>
                  <option value="Aberta">Aberta</option>
                  <option value="Paga">Paga</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Parcial">Parcial</option>
                </select>
              </div>
            </div>

            <div class="table-wrap">
              <table class="vendas-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Pagamento</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of itemsFiltrados(); track item.id) {
                    <tr>
                      <td data-label="Data">{{ formatDate(item.data) }}</td>
                      <td data-label="Itens" class="td-itens">{{ formatItens(item) }}</td>
                      <td data-label="Total" class="td-total">{{ formatMoney(item.total) }}</td>
                      <td data-label="Status">
                        <span class="stg" [class.stg--positive]="isStatus(item.status, 'Paga')"
                          [class.stg--warn]="isStatus(item.status, 'Aberta')"
                          [class.stg--negative]="isStatus(item.status, 'Cancelada')"
                          [class.stg--neutral]="isStatus(item.status, 'Parcial') || !item.status">
                          {{ item.status || '—' }}
                        </span>
                      </td>
                      <td data-label="Pagamento">{{ item.formaPagamento || '—' }}</td>
                      <td class="td-actions">
                        @if (isStatus(item.status, 'Aberta')) {
                          <button class="btn-action" type="button" (click)="pagarVenda(item)" title="Marcar como paga">Pagar</button>
                        }
                        <button class="btn-action btn-action--danger" type="button" (click)="confirmarExclusao(item)" title="Excluir">Excluir</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (itemsFiltrados().length === 0) {
              <p class="no-results">Nenhuma venda encontrada com os filtros atuais.</p>
            }
          }
        </div>
      }

      @if (error()) {
        <div class="error-banner">
          {{ error() }}
          <button type="button" class="btn-ghost" (click)="load()">Tentar de novo</button>
        </div>
      }
    </div>

    @if (showDeleteConfirm()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Excluir venda</h3>
          <p>Tem certeza que deseja excluir esta venda?</p>
          <div class="modal-actions">
            <button class="btn-ghost" type="button" (click)="cancelDelete()">Cancelar</button>
            <button class="btn-danger" type="button" (click)="confirmDelete()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; color: var(--clx-text-primary); }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
    }
    .header-left h1 {
      font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary);
      margin: 0 0 4px; letter-spacing: -0.02em;
    }
    .header-subtitle { font-size: 0.82rem; color: var(--clx-text-secondary); font-weight: 500; }

    .btn-primary, .btn-ghost, .btn-danger, .btn-action {
      font-family: var(--clx-font); cursor: pointer; border-radius: 10px;
      font-size: 0.82rem; font-weight: 600; transition: 0.15s ease;
    }
    .btn-primary {
      padding: 10px 16px; border: none; color: #fff;
      background: linear-gradient(135deg, #d97706, #b45309);
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-ghost {
      padding: 10px 16px; background: var(--clx-surface-1); color: var(--clx-text-primary);
      border: 1px solid var(--clx-border-strong);
    }
    .btn-danger {
      padding: 10px 16px; border: none; background: #dc2626; color: #fff;
    }

    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px;
    }
    .kpi-card {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: 14px;
      padding: 16px 18px;
      display: flex; align-items: center; gap: 12px;
      min-height: 84px;
    }
    .kpi-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: grid; place-items: center; flex-shrink: 0;
    }
    .kpi-icon--total { background: var(--clx-accent-muted); color: var(--clx-accent); }
    .kpi-icon--fat { background: rgba(5,150,105,.12); color: #059669; }
    .kpi-icon--paga { background: var(--clx-teal-muted); color: var(--clx-teal); }
    .kpi-icon--pendente { background: rgba(217,119,6,.12); color: #d97706; }
    .kpi-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .04em; color: var(--clx-text-secondary); font-weight: 650; }
    .kpi-value { font-size: 1.2rem; font-weight: 750; color: var(--clx-text-primary); line-height: 1.25; }
    .kpi-value--sm { font-size: 0.95rem; }
    .kpi-sub { font-size: 0.7rem; color: var(--clx-text-secondary); }

    .panel {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: var(--clx-shadow-card);
    }
    .panel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .panel-header h3 { margin: 0; font-size: 1.05rem; color: var(--clx-text-primary); }
    .panel-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #d97706, #b45309); }

    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px;
    }
    .form-grid label {
      display: flex; flex-direction: column; gap: 6px;
      font-size: 0.75rem; font-weight: 650; color: var(--clx-text-secondary); text-transform: uppercase;
    }
    .form-grid input {
      border: 1px solid var(--clx-border-strong); border-radius: 10px; padding: 10px 12px;
      background: var(--clx-surface-2); color: var(--clx-text-primary); font-size: 0.92rem;
    }
    .form-actions { display: flex; gap: 10px; flex-wrap: wrap; }

    .table-toolbar {
      display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px;
      padding: 12px; background: var(--clx-surface-2); border-radius: 12px; border: 1px solid var(--clx-border);
    }
    .search-box { flex: 1; min-width: 220px; }
    .search-input, .filter-select {
      width: 100%; padding: 10px 12px; border-radius: 10px;
      border: 1px solid var(--clx-border-strong); background: var(--clx-surface-1);
      color: var(--clx-text-primary); font-size: 0.9rem;
    }
    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-label { font-size: 0.82rem; color: var(--clx-text-secondary); font-weight: 600; white-space: nowrap; }
    .filter-select { min-width: 150px; }

    .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .vendas-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .vendas-table th {
      text-align: left; padding: 10px 12px; font-size: 0.72rem; text-transform: uppercase;
      letter-spacing: .05em; color: var(--clx-text-secondary); border-bottom: 2px solid var(--clx-border-strong);
    }
    .vendas-table td {
      padding: 12px; color: var(--clx-text-primary); border-bottom: 1px solid var(--clx-border);
      vertical-align: middle; background: transparent;
    }
    .vendas-table tbody tr:hover td { background: color-mix(in srgb, var(--clx-accent) 6%, transparent); }
    .td-itens { max-width: 360px; color: var(--clx-text-secondary); font-size: 0.84rem; line-height: 1.45; }
    .td-total { font-weight: 750; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .td-actions { white-space: nowrap; text-align: right; }

    .btn-action {
      padding: 6px 10px; margin-left: 4px; border: 1px solid var(--clx-border-strong);
      background: var(--clx-surface-2); color: var(--clx-text-primary);
    }
    .btn-action--danger { color: #dc2626; }

    .stg {
      display: inline-block; padding: 3px 10px; border-radius: 999px;
      font-size: 0.74rem; font-weight: 700; background: rgba(100,116,139,.12); color: var(--clx-text-secondary);
    }
    .stg--positive { background: rgba(5,150,105,.14); color: #059669; }
    .stg--warn { background: rgba(217,119,6,.14); color: #b45309; }
    .stg--negative { background: rgba(220,38,38,.12); color: #dc2626; }
    .stg--neutral { background: rgba(100,116,139,.12); color: var(--clx-text-secondary); }

    .empty-wrap { text-align: center; padding: 48px 16px; color: var(--clx-text-primary); }
    .empty-wrap h4 { margin: 0 0 8px; font-size: 1.1rem; }
    .empty-wrap p { margin: 0 0 16px; color: var(--clx-text-secondary); }
    .no-results { text-align: center; color: var(--clx-text-secondary); padding: 16px; }

    .error-banner {
      margin-top: 12px; padding: 12px 14px; border-radius: 12px;
      background: rgba(220,38,38,.1); color: #b91c1c;
      display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000;
      display: grid; place-items: center; padding: 20px;
    }
    .modal {
      background: var(--clx-surface-1); color: var(--clx-text-primary);
      border: 1px solid var(--clx-border); border-radius: 16px; padding: 24px; max-width: 400px; width: 100%;
    }
    .modal h3 { margin: 0 0 8px; }
    .modal p { margin: 0 0 16px; color: var(--clx-text-secondary); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

    @media (max-width: 900px) {
      .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .vendas-table thead { display: none; }
      .vendas-table, .vendas-table tbody, .vendas-table tr, .vendas-table td { display: block; width: 100%; }
      .vendas-table tr {
        border: 1px solid var(--clx-border); border-radius: 12px; margin-bottom: 10px;
        padding: 10px 12px; background: var(--clx-surface-2);
      }
      .vendas-table td {
        display: flex; justify-content: space-between; gap: 10px;
        border: none; padding: 6px 0;
      }
      .vendas-table td::before {
        content: attr(data-label); font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; color: var(--clx-text-secondary);
      }
      .td-actions { justify-content: flex-end !important; }
    }
  `],
})
export class VendasPageComponent implements OnInit {
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly items = signal<Venda[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly busca = signal('');
  readonly filtroStatus = signal('todos');
  readonly showDeleteConfirm = signal(false);

  form = { descricao: '', valorUnitario: 100, quantidade: 1 };
  private deleteTarget: Venda | null = null;

  readonly faturamentoLabel = computed(() => this.formatMoney(
    this.items().reduce((sum, i) => sum + (Number(i.total) || 0), 0)
  ));
  readonly pagasCount = computed(() => this.items().filter((i) => this.isStatus(i.status, 'Paga')).length);
  readonly pendentesCount = computed(() =>
    this.items().filter((i) => this.isStatus(i.status, 'Aberta') || this.isStatus(i.status, 'Parcial')).length
  );

  readonly itemsFiltrados = computed(() => {
    const q = this.busca().toLowerCase().trim();
    const status = this.filtroStatus();
    let list = this.items();
    if (status !== 'todos') {
      list = list.filter((i) => this.isStatus(i.status, status));
    }
    if (q) {
      list = list.filter(
        (i) =>
          (i.formaPagamento || '').toLowerCase().includes(q) ||
          (i.status || '').toLowerCase().includes(q) ||
          i.itens.some((it) => (it.descricao || '').toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listVendas().subscribe({
      next: (raw) => {
        const list = this.normalizeList(raw);
        this.items.set(list);
        this.loading.set(false);
        // Garante repaint imediato após HTTP (SPA)
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.items.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.message || 'Falha ao carregar vendas.');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeList(raw: unknown): Venda[] {
    const arr = Array.isArray(raw) ? raw : (raw as any)?.items ?? (raw as any)?.value ?? [];
    return (arr as any[]).map((v) => {
      const itensRaw = v.itens ?? v.Itens ?? [];
      const itens: VendaItem[] = (Array.isArray(itensRaw) ? itensRaw : []).map((i: any, idx: number) => ({
        id: String(i.id ?? i.Id ?? `${v.id ?? 'x'}-${idx}`),
        descricao: String(i.descricao ?? i.Descricao ?? 'Item'),
        quantidade: Number(i.quantidade ?? i.Quantidade ?? 0),
        valorUnitario: Number(i.valorUnitario ?? i.ValorUnitario ?? 0),
        total: Number(i.total ?? i.Total ?? 0),
      }));
      return {
        id: String(v.id ?? v.Id ?? crypto.randomUUID()),
        pacienteId: v.pacienteId ?? v.PacienteId,
        data: String(v.data ?? v.Data ?? new Date().toISOString()),
        subtotal: Number(v.subtotal ?? v.Subtotal ?? 0),
        desconto: Number(v.desconto ?? v.Desconto ?? 0),
        total: Number(v.total ?? v.Total ?? 0),
        status: String(v.status ?? v.Status ?? 'Aberta'),
        formaPagamento: v.formaPagamento ?? v.FormaPagamento ?? undefined,
        observacoes: v.observacoes ?? v.Observacoes ?? undefined,
        itens,
      } satisfies Venda;
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (this.showForm()) {
      this.form = { descricao: '', valorUnitario: 100, quantidade: 1 };
    }
  }

  formatMoney(value: number | string | null | undefined): string {
    const n = Number(value) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('pt-BR');
  }

  formatItens(venda: Venda): string {
    if (!venda.itens?.length) return '—';
    return venda.itens
      .map((i) => `${i.descricao} (${i.quantidade}× ${this.formatMoney(i.valorUnitario)})`)
      .join('; ');
  }

  isStatus(status: string | undefined, expected: string): boolean {
    return (status || '').localeCompare(expected, 'pt-BR', { sensitivity: 'accent' }) === 0;
  }

  salvar(): void {
    const f = this.form;
    if (!f.descricao?.trim() || !f.valorUnitario || !f.quantidade) {
      this.toast.show('error', 'Preencha todos os campos');
      return;
    }
    this.saving.set(true);
    this.api
      .createVenda({
        desconto: 0,
        itens: [
          {
            descricao: f.descricao.trim(),
            quantidade: Number(f.quantidade),
            valorUnitario: Number(f.valorUnitario),
          },
        ],
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.show('success', 'Venda registrada com sucesso');
          this.showForm.set(false);
          this.load();
        },
        error: (e) => {
          this.saving.set(false);
          this.toast.show('error', e?.error?.message || e?.error || 'Falha ao registrar venda');
        },
      });
  }

  pagarVenda(venda: Venda): void {
    this.api.pagarVenda(venda.id).subscribe({
      next: () => {
        this.toast.show('success', 'Venda marcada como paga');
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error?.message || 'Falha ao processar pagamento'),
    });
  }

  confirmarExclusao(venda: Venda): void {
    this.deleteTarget = venda;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.api.deleteVenda(id).subscribe({
      next: () => {
        this.toast.show('success', 'Venda excluída com sucesso');
        this.showDeleteConfirm.set(false);
        this.deleteTarget = null;
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error?.message || 'Falha ao excluir venda'),
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteTarget = null;
  }
}
