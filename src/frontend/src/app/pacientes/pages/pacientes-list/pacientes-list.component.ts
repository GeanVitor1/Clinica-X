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
        <h1>Pacientes</h1>
        <button class="btn-primary" type="button" (click)="openCreate()">+ Novo Paciente</button>
      </header>

      <div class="search-bar">
        <div class="search-wrapper">
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearch($event)"
            placeholder="Buscar por nome, CPF ou telefone..."
          />
          @if (loading()) { <span class="search-spinner"></span> }
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
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th (click)="toggleSort('nome')" class="sortable">Nome {{ sortIcon('nome') }}</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Data Nasc.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (p of pacientesList(); track p.id) {
              <tr>
                <td><app-avatar [name]="p.nome" /></td>
                <td>
                  <strong>{{ p.nome }}</strong>
                  <button class="expand-btn" type="button" (click)="toggleExpand(p.id)">
                    {{ expandedId() === p.id ? '▲' : '▼' }}
                  </button>
                  @if (expandedId() === p.id) {
                    <div class="expand-card">
                      <p><strong>Telefone:</strong> {{ p.telefone }}</p>
                      <p><strong>Obs:</strong> {{ p.observacoes || '—' }}</p>
                      <p><em>Último agendamento: {{ p.ultimoAgendamentoInfo || 'Nenhum' }}</em></p>
                      <div class="expand-actions">
                        <button class="btn-sm" type="button" [routerLink]="'/agenda'">Agendar</button>
                        <button class="btn-sm btn-sm--accent" type="button" [routerLink]="['/prontuario', p.id]">Prontuário</button>
                      </div>
                    </div>
                  }
                </td>
                <td>{{ formatCpf(p.cpf) }}</td>
                <td>{{ p.telefone }}</td>
                <td>{{ p.dataNascimento ? (p.dataNascimento | date:'dd/MM/yyyy') : '—' }}</td>
                <td class="actions-cell">
                  <button class="btn-icon" type="button" (click)="editPaciente(p)" title="Editar">✏️</button>
                  <a class="btn-icon" [routerLink]="['/prontuario', p.id]" title="Prontuário digital">🩺</a>
                  <button class="btn-icon" type="button" (click)="verHistorico(p)" title="Histórico">📋</button>
                  <button class="btn-icon" type="button" (click)="deletePaciente(p)" title="Excluir">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      }

      @if (total() > 0) {
        <div class="pagination">
          <button type="button" (click)="prevPage()" [disabled]="page() === 1">Anterior</button>
          <span>Página {{ page() }} de {{ totalPages() }}</span>
          <button type="button" (click)="nextPage()" [disabled]="page() === totalPages()">Próxima</button>
        </div>
      }
    </div>

    @if (showHistorico()) {
      <div class="modal-overlay" (click)="fecharHistorico()">
        <div class="modal modal--wide" (click)="$event.stopPropagation()">
          <h2>Histórico — {{ historicoPaciente()?.nome }}</h2>
          <div class="timeline-modal">
            @for (ev of historicoEventos(); track ev.descricao + ev.criadoEm) {
              <div class="timeline-item">
                <span class="timeline-icon">{{ getEventIcon(ev.tipo) }}</span>
                <div class="timeline-body">
                  <p class="timeline-desc">{{ ev.descricao }}</p>
                  <span class="timeline-date">{{ timeAgo(ev.criadoEm) }}</span>
                </div>
              </div>
            } @empty {
              <div class="timeline-empty">Nenhum evento encontrado.</div>
            }
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="fecharHistorico()">Fechar</button>
          </div>
        </div>
      </div>
    }

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingPaciente() ? 'Editar' : 'Novo' }} Paciente</h2>
          <form (ngSubmit)="savePaciente()" class="paciente-form">
            <div class="field">
              <label>Nome *</label>
              <input [(ngModel)]="formNome" name="nome" required maxlength="200" />
            </div>
            <div class="field">
              <label>CPF *</label>
              <input [(ngModel)]="formCpf" name="cpf" required maxlength="11" placeholder="Apenas números" />
              @if (cpfError()) { <span class="field-error">{{ cpfError() }}</span> }
            </div>
            <div class="field">
              <label>Telefone *</label>
              <input [(ngModel)]="formTelefone" name="telefone" required maxlength="20" />
            </div>
            <div class="field">
              <label>Data Nascimento</label>
              <input [(ngModel)]="formDataNascimento" name="dataNascimento" type="date" />
            </div>
            <div class="field">
              <label>Observações</label>
              <textarea [(ngModel)]="formObservacoes" name="observacoes" rows="3" maxlength="1000"></textarea>
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
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary:hover { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; }

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

    .expand-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .btn-sm {
      padding: 5px 12px;
      background: var(--clx-accent);
      color: #fff;
      border: none;
      border-radius: var(--clx-radius-xs);
      font-size: 0.76rem;
      cursor: pointer;
      font-family: var(--clx-font);
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .btn-sm--accent {
      background: #0d9488;
    }
    .actions-cell {
      display: flex;
      gap: 4px;
      align-items: center;
      white-space: nowrap;
    }

    .btn-icon {
      background: none;
      border: none;
      text-decoration: none;
      cursor: pointer;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 6px;
      border-radius: var(--clx-radius-xs);
      color: var(--clx-text-tertiary);
      transition: all var(--clx-transition-fast);
      line-height: 1;
    }
    .btn-icon:hover { background: var(--clx-surface-3); color: var(--clx-text-primary); }

    .sortable { cursor: pointer; user-select: none; }

    .search-bar { margin-bottom: 20px; }
    .search-wrapper { position: relative; }
    .search-wrapper input {
      width: 100%;
      padding: 10px 16px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      background: var(--clx-surface-1);
      color: var(--clx-text-primary);
      font-size: 0.88rem;
      font-family: var(--clx-font);
      outline: none;
      transition: all var(--clx-transition-fast);
    }
    .search-wrapper input:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .search-wrapper input::placeholder { color: var(--clx-text-tertiary); }

    .search-spinner {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      border: 2px solid var(--clx-border);
      border-top-color: var(--clx-accent);
      border-radius: 50%;
      animation: spin 0.5s linear infinite;
    }
    @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

    .table-container {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 12px 14px;
      font-size: 0.74rem;
      color: var(--clx-text-tertiary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--clx-border);
      background: var(--clx-surface-2);
    }
    td { padding: 12px 14px; border-bottom: 1px solid var(--clx-border); font-size: 0.86rem; color: var(--clx-text-primary); vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--clx-surface-2); }

    .expand-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.65rem;
      color: var(--clx-text-tertiary);
      margin-left: 8px;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .expand-btn:hover { color: var(--clx-text-primary); }

    .expand-card {
      margin-top: 8px;
      padding: 12px;
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-sm);
      font-size: 0.82rem;
    }
    .expand-card p { margin: 2px 0; }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
    }
    .pagination button {
      padding: 7px 14px;
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      cursor: pointer;
      color: var(--clx-text-secondary);
      font-size: 0.82rem;
      font-family: var(--clx-font);
      font-weight: 500;
      transition: all var(--clx-transition-fast);
    }
    .pagination button:hover:not(:disabled) { border-color: var(--clx-accent); color: var(--clx-accent); }
    .pagination button:disabled { opacity: 0.35; cursor: default; }
    .pagination span { font-size: 0.82rem; color: var(--clx-text-secondary); }

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
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--clx-shadow-xl);
      animation: modalIn 0.2s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal--wide { max-width: 600px; }
    .modal h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; color: var(--clx-text-primary); }

    .timeline-modal { display: flex; flex-direction: column; gap: 0; margin-bottom: 20px; }
    .timeline-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--clx-border); }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-icon { font-size: 1rem; width: 28px; text-align: center; flex-shrink: 0; margin-top: 2px; }
    .timeline-body { flex: 1; }
    .timeline-desc { font-size: 0.84rem; color: var(--clx-text-primary); margin-bottom: 2px; }
    .timeline-date { font-size: 0.72rem; color: var(--clx-text-tertiary); }
    .timeline-empty { text-align: center; padding: 40px; color: var(--clx-text-tertiary); }

    .paciente-form { display: flex; flex-direction: column; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
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
    .field-error { color: var(--clx-error); font-size: 0.78rem; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  `],
})
export class PacientesListComponent implements OnInit {
  private pacienteService = inject(PacienteService);

  pacientes = signal<Paciente[]>([]);
  total = signal(0);
  loading = signal(false);

  searchQuery = signal('');
  page = signal(1);
  pageSize = 10;
  sortKey = signal<'nome' | 'criadoEm'>('nome');
  sortDir = signal<'asc' | 'desc'>('asc');
  expandedId = signal<string | null>(null);
  showForm = signal(false);
  editingPaciente = signal<Paciente | null>(null);
  saveState = signal<BtnSubmitState>('idle');
  showHistorico = signal(false);
  historicoPaciente = signal<Paciente | null>(null);
  historicoEventos = signal<Evento[]>([]);

  formNome = '';
  formCpf = '';
  formTelefone = '';
  formDataNascimento = '';
  formObservacoes = '';
  cpfError = signal('');

  private searchDebounced = debounceSearch$(
    (q) => this.pacienteService.getAll(q, 1, this.pageSize),
    (res) => {
      this.pacientes.set(res.items);
      this.total.set(res.total);
      this.page.set(1);
      this.loading.set(false);
    },
    300
  );

  pacientesList = computed(() => {
    const items = [...this.pacientes()];
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
    const start = (this.page() - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize));

  ngOnInit() {
    this.carregarPacientes();
  }

  private carregarPacientes() {
    this.loading.set(true);
    this.pacienteService.getAll(this.searchQuery(), this.page(), this.pageSize).subscribe({
      next: (res) => {
        this.pacientes.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.pacientes.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
  }

  toggleSort(key: 'nome' | 'criadoEm') {
    if (this.sortKey() === key) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  sortIcon(key: string) {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '↑' : '↓';
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

  editPaciente(p: Paciente) {
    this.editingPaciente.set(p);
    this.formNome = p.nome;
    this.formCpf = p.cpf;
    this.formTelefone = p.telefone;
    this.formDataNascimento = p.dataNascimento ? p.dataNascimento.split('T')[0] : '';
    this.formObservacoes = p.observacoes || '';
    this.cpfError.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.cpfError.set(''); }

  private resetForm() {
    this.formNome = '';
    this.formCpf = '';
    this.formTelefone = '';
    this.formDataNascimento = '';
    this.formObservacoes = '';
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
    const request = {
      nome: this.formNome,
      cpf: this.formCpf,
      telefone: this.formTelefone,
      dataNascimento: this.formDataNascimento || null,
      observacoes: this.formObservacoes || null,
    };

    const obs = this.editingPaciente()
      ? this.pacienteService.update(this.editingPaciente()!.id, request)
      : this.pacienteService.create(request);

    obs.subscribe({
      next: () => {
        this.saveState.set('done');
        this.carregarPacientes();
        setTimeout(() => {
          this.saveState.set('idle');
          this.closeForm();
        }, 1000);
      },
      error: () => {
        this.saveState.set('idle');
        this.cpfError.set('Erro ao salvar. Verifique os dados.');
      },
    });
  }

  deletePaciente(p: Paciente) {
    if (!confirm(`Remover ${p.nome}?`)) return;
    this.pacienteService.delete(p.id).subscribe({
      next: () => this.carregarPacientes(),
    });
  }

  verHistorico(p: Paciente) {
    this.historicoPaciente.set(p);
    this.pacienteService.getEventos(p.id).subscribe({
      next: (eventos) => this.historicoEventos.set(eventos),
      error: () => this.historicoEventos.set([]),
    });
    this.showHistorico.set(true);
  }

  fecharHistorico() {
    this.showHistorico.set(false);
    this.historicoPaciente.set(null);
    this.historicoEventos.set([]);
  }

  getEventIcon(tipo: string): string {
    const icons: Record<string, string> = {
      PacienteCriado: '✅', PacienteEditado: '✏️', AgendamentoCriado: '📅',
      AgendamentoCancelado: '❌', NotificacaoEnviada: '📤',
    };
    return icons[tipo] || '📌';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `há ${days} dia${days > 1 ? 's' : ''}`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  formatCpf(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
}
