import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ServicoService, Servico } from '../../services/servico.service';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { BtnSubmitComponent, BtnSubmitState } from '../../../shared/components/btn-submit.component';

@Component({
  selector: 'app-servicos-list',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, SkeletonComponent, EmptyStateComponent, BtnSubmitComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Serviços</h1>
        <button class="btn-primary" type="button" (click)="openCreate()">+ Novo Serviço</button>
      </header>

      @if (loading()) {
        <div class="cards-grid">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (servicos().length === 0) {
        <app-empty-state
          icon="default"
          message="Nenhum serviço cadastrado ainda."
          actionLabel="Adicionar serviço"
          (action)="openCreate()"
        />
      } @else {
      <div class="cards-grid">
        @for (s of servicos(); track s.id) {
          <div class="servico-card" [style.border-left-color]="s.cor || 'var(--clx-border)'">
            <div class="card-header">
              <span class="color-dot" [style.background]="s.cor || '#94a3b8'"></span>
              <strong>{{ s.nome }}</strong>
            </div>
            <p class="card-desc">{{ s.descricao || 'Sem descrição' }}</p>
            <div class="card-meta">
              <span>{{ s.duracaoMin }} min</span>
              <span class="card-valor">{{ s.valor | currency:'BRL' }}</span>
            </div>
            <div class="card-actions">
              <button type="button" (click)="editServico(s)">✏️</button>
              <button type="button" (click)="deleteServico(s)">🗑️</button>
            </div>
          </div>
        }
      </div>
      }
    </div>

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingServico() ? 'Editar' : 'Novo' }} Serviço</h2>
          <form (ngSubmit)="saveServico()" class="servico-form">
            <div class="field">
              <label>Nome *</label>
              <input [(ngModel)]="formNome" name="nome" required />
            </div>
            <div class="field">
              <label>Descrição</label>
              <textarea [(ngModel)]="formDescricao" name="descricao" rows="2"></textarea>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Duração (min) *</label>
                <input [(ngModel)]="formDuracao" name="duracao" type="number" min="1" required />
              </div>
              <div class="field">
                <label>Valor (R$) *</label>
                <input [(ngModel)]="formValor" name="valor" type="number" step="0.01" min="0" required />
              </div>
            </div>
            <div class="field">
              <label>Cor (calendário)</label>
              <input [(ngModel)]="formCor" name="cor" type="color" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeForm()">Cancelar</button>
              <app-btn-submit label="Salvar" [state]="saveState()" />
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary); letter-spacing: -0.02em; }

    .btn-primary {
      padding: 9px 18px;
      background: var(--clx-accent);
      color: #fff;
      border: none;
      border-radius: var(--clx-radius-md);
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
    }
    .btn-primary:hover { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); transform: translateY(-1px); }

    .btn-secondary {
      padding: 9px 18px;
      background: transparent;
      color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      cursor: pointer;
      font-size: 0.84rem;
      font-weight: 500;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
    }
    .btn-secondary:hover { border-color: var(--clx-text-tertiary); color: var(--clx-text-primary); }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

    .servico-card {
      padding: 20px;
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      transition: all var(--clx-transition-base);
    }
    .servico-card:hover { border-color: var(--clx-border-strong); box-shadow: var(--clx-shadow-md); transform: translateY(-1px); }

    .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .card-header strong { font-size: 0.92rem; color: var(--clx-text-primary); }

    .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 6px currentColor; }

    .card-desc { font-size: 0.82rem; color: var(--clx-text-secondary); margin-bottom: 14px; line-height: 1.45; }

    .card-meta { display: flex; justify-content: space-between; font-size: 0.86rem; margin-bottom: 14px; color: var(--clx-text-secondary); }
    .card-valor { font-weight: 650; color: var(--clx-accent); }

    .card-actions { display: flex; gap: 6px; }
    .card-actions button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 5px 6px;
      border-radius: var(--clx-radius-xs);
      color: var(--clx-text-tertiary);
      transition: all var(--clx-transition-fast);
      line-height: 1;
    }
    .card-actions button:hover { background: var(--clx-surface-3); color: var(--clx-text-primary); }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-xl);
      padding: 28px;
      width: 90%;
      max-width: 500px;
      box-shadow: var(--clx-shadow-xl);
      animation: modalIn 0.2s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; color: var(--clx-text-primary); }

    .servico-form { display: flex; flex-direction: column; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .field label { font-size: 0.8rem; font-weight: 500; color: var(--clx-text-secondary); }
    .field input, .field textarea, .field select {
      padding: 9px 12px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      background: var(--clx-surface-2);
      color: var(--clx-text-primary);
      font-size: 0.88rem;
      font-family: var(--clx-font);
      outline: none;
      transition: all var(--clx-transition-fast);
    }
    .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .field input[type="color"] { height: 38px; padding: 4px; cursor: pointer; }
    .field-row { display: flex; gap: 12px; }
    .field-row .field { flex: 1; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  `],
})
export class ServicosListComponent implements OnInit {
  private servicoService = inject(ServicoService);

  servicos = signal<Servico[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingServico = signal<Servico | null>(null);
  saveState = signal<BtnSubmitState>('idle');
  formNome = '';
  formDescricao = '';
  formDuracao = 30;
  formValor = 0;
  formCor = '#14b8a6';

  ngOnInit() { this.carregarServicos(); }

  private carregarServicos() {
    this.loading.set(true);
    this.servicoService.getAll().subscribe({
      next: (data) => { this.servicos.set(data); this.loading.set(false); },
      error: () => { this.servicos.set([]); this.loading.set(false); },
    });
  }

  openCreate() {
    this.editingServico.set(null);
    this.formNome = '';
    this.formDescricao = '';
    this.formDuracao = 30;
    this.formValor = 0;
    this.formCor = '#14b8a6';
    this.showForm.set(true);
  }

  editServico(s: Servico) {
    this.editingServico.set(s);
    this.formNome = s.nome;
    this.formDescricao = s.descricao;
    this.formDuracao = s.duracaoMin;
    this.formValor = s.valor;
    this.formCor = s.cor;
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  saveServico() {
    if (this.saveState() !== 'idle') return;
    this.saveState.set('loading');
    const request = {
      nome: this.formNome,
      descricao: this.formDescricao,
      duracaoMin: +this.formDuracao,
      valor: +this.formValor,
      cor: this.formCor,
    };

    const obs = this.editingServico()
      ? this.servicoService.update(this.editingServico()!.id, request)
      : this.servicoService.create(request);

    obs.subscribe({
      next: () => {
        this.saveState.set('done');
        this.carregarServicos();
        setTimeout(() => {
          this.saveState.set('idle');
          this.closeForm();
        }, 1000);
      },
      error: () => this.saveState.set('idle'),
    });
  }

  deleteServico(s: Servico) {
    if (!confirm(`Remover ${s.nome}?`)) return;
    this.servicoService.delete(s.id).subscribe({
      next: () => this.carregarServicos(),
    });
  }
}
