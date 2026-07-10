import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProntuarioService, Prontuario, UpdateProntuarioRequest } from '../../services/prontuario.service';
import { PacienteService } from '../../../pacientes/services/paciente.service';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { BtnSubmitComponent, BtnSubmitState } from '../../../shared/components/btn-submit.component';

@Component({
  selector: 'app-prontuario-paciente',
  standalone: true,
  imports: [FormsModule, DatePipe, SkeletonComponent, EmptyStateComponent, BtnSubmitComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Prontuário</h1>
          <p class="paciente-nome">Paciente: <strong>{{ pacienteNome() }}</strong></p>
        </div>
        <button class="btn-primary" type="button" (click)="abrirNovoRegistro()">+ Novo Registro</button>
      </header>

      @if (loading()) {
        <app-skeleton variant="text" />
        <app-skeleton variant="card" />
      }

      <div class="timeline">
        @for (item of registros(); track item.id) {
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="card-header">
                <span class="card-date">{{ item.data | date:'dd/MM/yyyy' }}</span>
                <div class="card-actions">
                  <button class="btn-icon" (click)="editarRegistro(item)" title="Editar">✏️</button>
                  <button class="btn-icon" (click)="excluirRegistro(item)" title="Excluir">🗑️</button>
                </div>
              </div>
              <div class="card-body">
                @if (item.descricao) {
                  <div class="field-group">
                    <label>Descrição</label>
                    <p>{{ item.descricao }}</p>
                  </div>
                }
                @if (item.diagnostico) {
                  <div class="field-group">
                    <label>Diagnóstico</label>
                    <p>{{ item.diagnostico }}</p>
                  </div>
                }
                @if (item.prescricao) {
                  <div class="field-group">
                    <label>Prescrição</label>
                    <p>{{ item.prescricao }}</p>
                  </div>
                }
              </div>
              @if (item.anexos.length) {
                <div class="card-anexos">
                  <label>Anexos</label>
                  <div class="anexos-list">
                    @for (anexo of item.anexos; track anexo.id) {
                      <div class="anexo-item">
                        <span>📎 {{ anexo.nome }}</span>
                        <span class="anexo-size">{{ (anexo.tamanho / 1024).toFixed(1) }} KB</span>
                        <button class="btn-icon btn-icon--small" (click)="excluirAnexo(anexo.id)" title="Remover anexo">✕</button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        } @empty {
          @if (!loading()) {
            <app-empty-state
              icon="prontuario"
              message="Nenhum registro de prontuário ainda."
              actionLabel="Novo registro"
              (action)="abrirNovoRegistro()"
            />
          }
        }
      </div>
    </div>

    @if (showForm) {
      <div class="modal-overlay" (click)="fecharForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editandoId() ? 'Editar Registro' : 'Novo Registro' }}</h2>
          <form (ngSubmit)="salvarRegistro()" class="prontuario-form">
            <div class="field">
              <label>Data *</label>
              <input [(ngModel)]="formData" name="data" type="date" required [disabled]="!!editandoId()" />
            </div>
            <div class="field">
              <label>Descrição</label>
              <textarea [(ngModel)]="formDescricao" name="descricao" rows="3"></textarea>
            </div>
            <div class="field">
              <label>Diagnóstico</label>
              <textarea [(ngModel)]="formDiagnostico" name="diagnostico" rows="2"></textarea>
            </div>
            <div class="field">
              <label>Prescrição</label>
              <textarea [(ngModel)]="formPrescricao" name="prescricao" rows="2"></textarea>
            </div>
            @if (!editandoId()) {
              <div class="field">
                <label>Anexos (PDF, JPG, PNG — máx 10 MB)</label>
                <input type="file" (change)="onFileSelected($event)" accept=".pdf,.jpg,.jpeg,.png" multiple />
                @if (uploadError()) { <span class="field-error">{{ uploadError() }}</span> }
              </div>
            }
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="fecharForm()">Cancelar</button>
              <app-btn-submit label="Salvar" [state]="saveState()" />
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary); letter-spacing: -0.02em; }
    .paciente-nome { color: var(--clx-text-secondary); margin-top: 4px; font-size: 0.88rem; }

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

    .timeline { position: relative; padding-left: 36px; }
    .timeline::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 0;
      bottom: 0;
      width: 1.5px;
      background: var(--clx-border);
    }

    .timeline-item { position: relative; margin-bottom: 28px; }

    .timeline-dot {
      position: absolute;
      left: -26px;
      top: 14px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--clx-accent);
      border: 3px solid var(--clx-surface-2);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .timeline-card {
      padding: 20px;
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      transition: border-color var(--clx-transition-base);
    }
    .timeline-card:hover { border-color: var(--clx-border-strong); }

    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .card-date { font-size: 0.8rem; font-weight: 650; color: var(--clx-accent); }
    .card-body { display: flex; flex-direction: column; gap: 14px; }

    .field-group label {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--clx-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 4px;
    }
    .field-group p { font-size: 0.88rem; color: var(--clx-text-primary); line-height: 1.55; white-space: pre-wrap; }

    .card-anexos { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--clx-border); }
    .card-anexos label { font-size: 0.68rem; font-weight: 600; color: var(--clx-text-tertiary); text-transform: uppercase; display: block; margin-bottom: 8px; letter-spacing: 0.05em; }

    .anexos-list { display: flex; flex-direction: column; gap: 6px; }
    .anexo-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--clx-text-primary); padding: 8px 10px; background: var(--clx-surface-2); border-radius: var(--clx-radius-sm); }
    .anexo-size { color: var(--clx-text-tertiary); font-size: 0.75rem; }

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
      max-width: 550px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--clx-shadow-xl);
      animation: modalIn 0.2s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; color: var(--clx-text-primary); }

    .prontuario-form { display: flex; flex-direction: column; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 0.8rem; font-weight: 500; color: var(--clx-text-secondary); }
    .field input, .field textarea {
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
    .field input:focus, .field textarea:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }
    .field input[type="file"] { padding: 7px; }
    .field input:disabled { opacity: 0.4; }
    .field-error { color: var(--clx-error); font-size: 0.78rem; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

    .card-actions { display: flex; gap: 2px; }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.82rem;
      padding: 5px 6px;
      border-radius: var(--clx-radius-xs);
      color: var(--clx-text-tertiary);
      transition: all var(--clx-transition-fast);
      line-height: 1;
    }
    .btn-icon:hover { background: var(--clx-surface-3); color: var(--clx-text-primary); }
    .btn-icon--small { font-size: 0.68rem; padding: 3px; }
  `],
})
export class ProntuarioPacienteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private prontuarioService = inject(ProntuarioService);
  private pacienteService = inject(PacienteService);

  pacienteId = signal('');
  pacienteNome = signal('Carregando...');
  registros = signal<Prontuario[]>([]);
  loading = signal(false);
  saveState = signal<BtnSubmitState>('idle');

  showForm = false;
  editandoId = signal('');
  formData = '';
  formDescricao = '';
  formDiagnostico = '';
  formPrescricao = '';
  selectedFiles: File[] = [];
  uploadError = signal('');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['pacienteId'];
      if (id) {
        this.pacienteId.set(id);
        this.carregarProntuario();
        this.carregarPacienteNome(id);
      }
    });
  }

  private carregarPacienteNome(id: string) {
    this.pacienteService.getById(id).subscribe({
      next: (p) => this.pacienteNome.set(p.nome),
      error: () => this.pacienteNome.set('Paciente'),
    });
  }

  private carregarProntuario() {
    this.loading.set(true);
    this.prontuarioService.getByPaciente(this.pacienteId()).subscribe({
      next: (data) => { this.registros.set(data); this.loading.set(false); },
      error: () => { this.registros.set([]); this.loading.set(false); },
    });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    this.uploadError.set('');
    if (!input.files) return;
    const tiposValidos = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;
    const files = Array.from(input.files);
    for (const f of files) {
      if (!tiposValidos.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        this.uploadError.set(`Tipo inválido: ${f.name}. Apenas PDF, JPG e PNG.`);
        return;
      }
      if (f.size > maxSize) {
        this.uploadError.set(`Arquivo muito grande: ${f.name}. Máximo 10 MB.`);
        return;
      }
    }
    this.selectedFiles = files;
  }

  private limparForm() {
    this.editandoId.set('');
    this.formData = new Date().toISOString().split('T')[0];
    this.formDescricao = '';
    this.formDiagnostico = '';
    this.formPrescricao = '';
    this.selectedFiles = [];
    this.uploadError.set('');
  }

  abrirNovoRegistro() {
    this.limparForm();
    this.showForm = true;
  }

  editarRegistro(item: Prontuario) {
    this.editandoId.set(item.id);
    this.formData = item.data ? item.data.split('T')[0] : '';
    this.formDescricao = item.descricao || '';
    this.formDiagnostico = item.diagnostico || '';
    this.formPrescricao = item.prescricao || '';
    this.selectedFiles = [];
    this.uploadError.set('');
    this.showForm = true;
  }

  excluirRegistro(item: Prontuario) {
    if (!confirm(`Excluir registro de ${item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '?'}?`)) return;
    this.prontuarioService.delete(item.id).subscribe({
      next: () => this.registros.update(list => list.filter(r => r.id !== item.id)),
    });
  }

  excluirAnexo(anexoId: string) {
    this.prontuarioService.deleteAnexo(anexoId).subscribe({
      next: () => this.carregarProntuario(),
    });
  }

  fecharForm() {
    this.showForm = false;
    this.editandoId.set('');
  }

  salvarRegistro() {
    if (!this.pacienteId() || this.saveState() !== 'idle') return;
    this.saveState.set('loading');

    const request = {
      data: this.formData || new Date().toISOString(),
      descricao: this.formDescricao,
      diagnostico: this.formDiagnostico,
      prescricao: this.formPrescricao,
    };

    if (this.editandoId()) {
      const updateReq: UpdateProntuarioRequest = {
        descricao: this.formDescricao,
        diagnostico: this.formDiagnostico,
        prescricao: this.formPrescricao,
      };
      this.prontuarioService.update(this.editandoId(), updateReq).subscribe({
        next: (atualizado) => {
          this.saveState.set('done');
          this.registros.update(list => list.map(r => r.id === atualizado.id ? atualizado : r));
          setTimeout(() => {
            this.saveState.set('idle');
            this.showForm = false;
            this.editandoId.set('');
          }, 1000);
        },
        error: () => { this.saveState.set('idle'); this.uploadError.set('Erro ao atualizar registro.'); },
      });
    } else {
      this.prontuarioService.create(this.pacienteId(), request).subscribe({
        next: (novo) => {
          this.saveState.set('done');
          this.registros.update(list => [novo, ...list]);
          this.selectedFiles.forEach(file => {
            this.prontuarioService.uploadAnexo(novo.id, file).subscribe();
          });
          this.selectedFiles = [];
          setTimeout(() => {
            this.saveState.set('idle');
            this.showForm = false;
          }, 1000);
        },
        error: () => { this.saveState.set('idle'); this.uploadError.set('Erro ao salvar registro.'); },
      });
    }
  }
}
