import { Component, signal, inject, OnInit, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { ToastService } from '../../../shared/services/toast.service';
import { BtnSubmitComponent, BtnSubmitState } from '../../../shared/components/btn-submit.component';

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [FormsModule, BtnSubmitComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>Configurações</h1>
          <span class="header-subtitle">Dados da clínica, horários e segurança</span>
        </div>
      </header>

      <div class="config-grid">
        <!-- Dados da Clínica -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-icon panel-icon--accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h2>Dados da Clínica</h2>
              <p class="panel-desc">Informações básicas da clínica</p>
            </div>
          </div>
          <form class="config-form" (ngSubmit)="salvarClinica()">
            <div class="form-grid">
              <div class="field">
                <label>Nome da Clínica</label>
                <input [(ngModel)]="formNome" name="nome" placeholder="Nome da clínica" />
              </div>
              <div class="field">
                <label>Email</label>
                <input [(ngModel)]="formEmail" name="email" type="email" placeholder="email@clinica.com" />
              </div>
              <div class="field">
                <label>Telefone</label>
                <input [(ngModel)]="formTelefone" name="telefone" placeholder="(00) 00000-0000" />
              </div>
              <div class="field">
                <label>Endereço</label>
                <input [(ngModel)]="formEndereco" name="endereco" placeholder="Endereço completo" />
              </div>
            </div>
            <div class="form-actions">
              <app-btn-submit label="Salvar Dados" [state]="saveClinicaState()" />
            </div>
          </form>
        </div>

        <!-- Horário Comercial -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-icon panel-icon--teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h2>Horário Comercial</h2>
              <p class="panel-desc">Horários e dias de funcionamento</p>
            </div>
          </div>
          <form class="config-form" (ngSubmit)="salvarHorario()">
            <div class="form-grid form-grid--2">
              <div class="field">
                <label>Abertura</label>
                <input [(ngModel)]="formAbertura" name="abertura" type="time" />
              </div>
              <div class="field">
                <label>Fechamento</label>
                <input [(ngModel)]="formFechamento" name="fechamento" type="time" />
              </div>
            </div>
            <div class="field">
              <label>Dias de funcionamento</label>
              <div class="dias-grid">
                @for (d of diasSemana; track d.value) {
                  <label class="dia-chip" [class.dia-chip--active]="diasSelecionados.has(d.value)">
                    <input type="checkbox" [checked]="diasSelecionados.has(d.value)" (change)="toggleDia(d.value, $event)" />
                    {{ d.label }}
                  </label>
                }
              </div>
            </div>
            <div class="field">
              <label>Plano</label>
              <select [(ngModel)]="formPlano" name="plano">
                <option value="Mensal">Mensal</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div class="form-actions">
              <app-btn-submit label="Salvar Horário" [state]="saveHorarioState()" />
            </div>
          </form>
        </div>

        <!-- Alterar Senha -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-icon panel-icon--purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h2>Alterar Senha</h2>
              <p class="panel-desc">Mantenha sua conta segura</p>
            </div>
          </div>
          <form class="config-form" (ngSubmit)="alterarSenha()">
            <div class="form-grid form-grid--2">
              <div class="field">
                <label>Senha Atual</label>
                <input [(ngModel)]="formSenhaAtual" name="senhaAtual" type="password" placeholder="Sua senha atual" />
              </div>
              <div class="field">
                <label>Nova Senha</label>
                <input [(ngModel)]="formNovaSenha" name="novaSenha" type="password" placeholder="Mínimo 4 caracteres" />
              </div>
            </div>
            @if (senhaErro()) { <span class="field-error">{{ senhaErro() }}</span> }
            <div class="form-actions">
              <app-btn-submit label="Alterar Senha" [state]="saveSenhaState()" />
            </div>
          </form>
        </div>

        <!-- Resetar Demo -->
        <div class="panel panel--danger">
          <div class="panel-header">
            <div class="panel-icon panel-icon--danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <div>
              <h2>Resetar Dados Demo</h2>
              <p class="panel-desc">Limpa todos os dados e recria os dados fictícios iniciais</p>
            </div>
          </div>
          <p class="danger-desc">Todos os dados cadastrados (pacientes, agendamentos, notificações) serão removidos permanentemente e recriados com dados de exemplo.</p>
          <button type="button" class="btn-danger" (click)="resetarDemo()" [disabled]="resetting()">
            @if (resetting()) {
              <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Resetando...
            } @else {
              Resetar Dados Demo
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
    }
    .header-left h1 {
      font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary);
      letter-spacing: -0.02em; margin: 0 0 4px 0; line-height: 1.2;
    }
    .header-subtitle { font-size: 0.82rem; color: var(--clx-text-tertiary); font-weight: 500; }

    .config-grid { display: flex; flex-direction: column; gap: 20px; }

    /* ── Panel ── */
    .panel {
      background: var(--clx-card-bg, var(--clx-surface-1));
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-2xl, 16px);
      padding: 28px;
      box-shadow: var(--clx-shadow-card, 0 2px 12px rgba(0,0,0,0.03));
      transition: all var(--clx-transition-fast);
    }
    .panel:hover {
      border-color: var(--clx-border-strong);
      box-shadow: var(--clx-shadow-sm);
    }

    .panel-header {
      display: flex; align-items: flex-start; gap: 14px;
      margin-bottom: 24px;
    }
    .panel-icon {
      width: 42px; height: 42px; border-radius: var(--clx-radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #fff;
    }
    .panel-icon--accent { background: linear-gradient(135deg, var(--clx-accent), #004d40); }
    .panel-icon--teal { background: linear-gradient(135deg, var(--clx-teal), #065f46); }
    .panel-icon--purple { background: linear-gradient(135deg, var(--clx-purple), #4338ca); }
    .panel-icon--danger { background: linear-gradient(135deg, var(--clx-error), #991b1b); }

    .panel-header h2 {
      margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--clx-text-primary);
    }
    .panel-desc {
      margin: 3px 0 0; font-size: 0.8rem; color: var(--clx-text-tertiary);
    }

    /* ── Form ── */
    .config-form { display: flex; flex-direction: column; gap: 16px; }
    .form-grid {
      display: grid; grid-template-columns: 1fr; gap: 14px;
    }
    .form-grid--2 { grid-template-columns: 1fr 1fr; }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 0.8rem; font-weight: 600; color: var(--clx-text-secondary);
    }
    .field input, .field select {
      padding: 10px 14px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      background: var(--clx-surface-2);
      color: var(--clx-text-primary);
      font-size: 0.88rem;
      font-family: var(--clx-font);
      outline: none;
      transition: all var(--clx-transition-fast);
    }
    .field input::placeholder { color: var(--clx-text-muted); }
    .field input:focus, .field select:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }

    .dias-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .dia-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-md);
      font-size: 0.8rem;
      color: var(--clx-text-secondary);
      cursor: pointer;
      font-weight: 500;
      transition: all var(--clx-transition-fast);
    }
    .dia-chip:hover { border-color: var(--clx-accent); color: var(--clx-text-primary); }
    .dia-chip--active {
      background: var(--clx-accent-muted);
      border-color: var(--clx-accent);
      color: var(--clx-accent);
      font-weight: 600;
    }
    .dia-chip input { display: none; }

    .form-actions { padding-top: 4px; }

    .field-error { color: var(--clx-error); font-size: 0.78rem; }

    /* ── Danger ── */
    .panel--danger {
      border-color: rgba(239, 68, 68, 0.2);
    }
    .panel--danger:hover {
      border-color: rgba(239, 68, 68, 0.35);
    }
    .danger-desc {
      font-size: 0.84rem; color: var(--clx-text-secondary); line-height: 1.6;
      margin: 0 0 18px; padding: 14px 16px;
      background: rgba(239, 68, 68, 0.04);
      border-radius: var(--clx-radius-md);
      border: 1px solid rgba(239, 68, 68, 0.1);
    }

    .btn-danger {
      padding: 10px 20px;
      background: var(--clx-error);
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
      gap: 7px;
    }
    .btn-danger:hover:not(:disabled) { background: #dc2626; box-shadow: 0 2px 8px rgba(239,68,68,.25); }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .spin { animation: spin .6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 700px) {
      .page { padding: 0 12px 32px; }
      .page-header { flex-direction: column; gap: 8px; }
      .page-header h1 { font-size: 1.2rem; }
      .form-grid--2 { grid-template-columns: 1fr; }
      .panel { padding: 18px; }
      .panel-header { gap: 10px; }
      .panel-icon { width: 36px; height: 36px; }
      .panel-header h2 { font-size: 0.95rem; }
      .dias-grid { gap: 4px; }
      .dia-chip { padding: 6px 10px; font-size: 0.72rem; }
    }
    @media (max-width: 450px) {
      .panel { padding: 14px; }
      .panel-header { margin-bottom: 16px; }
      .btn-danger { padding: 8px 14px; font-size: 0.8rem; }
    }
  `],
})
export class ConfigPageComponent implements OnInit {
  private configService = inject(ConfigService);
  private toast = inject(ToastService);

  formNome = '';
  formEmail = '';
  formTelefone = '';
  formEndereco = '';
  formAbertura = '08:00';
  formFechamento = '18:00';
  formPlano = 'Mensal';
  formSenhaAtual = '';
  formNovaSenha = '';
  diasSelecionados = new Set<number>([1, 2, 3, 4, 5]);
  readonly diasSemana = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
  ];
  senhaErro = signal('');
  resetting = signal(false);
  saveClinicaState = signal<BtnSubmitState>('idle');
  saveHorarioState = signal<BtnSubmitState>('idle');
  saveSenhaState = signal<BtnSubmitState>('idle');

  ngOnInit() {
    this.carregarDados();
  }

  toggleDia(value: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.diasSelecionados.add(value);
    else this.diasSelecionados.delete(value);
  }

  private diasFuncionamentoStr(): string {
    return [...this.diasSelecionados].sort((a, b) => a - b).join(',');
  }

  private carregarDados() {
    this.configService.get().subscribe({
      next: (data) => {
        this.formNome = data.nome;
        this.formEmail = data.email;
        this.formTelefone = data.telefone;
        this.formEndereco = data.endereco;
        this.formAbertura = data.horarioAbertura.substring(0, 5);
        this.formFechamento = data.horarioFechamento.substring(0, 5);
        this.formPlano = data.plano;
        const dias = (data.diasFuncionamento || '1,2,3,4,5')
          .split(',')
          .map(d => parseInt(d.trim(), 10))
          .filter(d => !isNaN(d));
        this.diasSelecionados = new Set(dias.length ? dias : [1, 2, 3, 4, 5]);
      },
      error: () => {
        this.formNome = 'Clínica Demo';
        this.formEmail = 'demo@clinica.com';
      },
    });
  }

  private updateClinica(state: WritableSignal<BtnSubmitState>, successMsg: string) {
    if (state() !== 'idle') return;
    if (this.diasSelecionados.size === 0) {
      this.toast.show('warning', 'Selecione ao menos um dia de funcionamento.');
      return;
    }
    state.set('loading');
    this.configService.update({
      nome: this.formNome,
      email: this.formEmail,
      telefone: this.formTelefone,
      endereco: this.formEndereco,
      horarioAbertura: this.formAbertura,
      horarioFechamento: this.formFechamento,
      diasFuncionamento: this.diasFuncionamentoStr(),
      plano: this.formPlano,
    }).subscribe({
      next: () => {
        state.set('done');
        this.toast.show('success', successMsg);
        setTimeout(() => state.set('idle'), 1000);
      },
      error: () => {
        state.set('idle');
        this.toast.show('error', 'Erro ao salvar.');
      },
    });
  }

  salvarClinica() {
    this.updateClinica(this.saveClinicaState, 'Dados da clínica salvos!');
  }

  salvarHorario() {
    this.updateClinica(this.saveHorarioState, 'Horário comercial salvo!');
  }

  alterarSenha() {
    if (this.formNovaSenha.length < 4) {
      this.senhaErro.set('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (this.saveSenhaState() !== 'idle') return;
    this.senhaErro.set('');
    this.saveSenhaState.set('loading');
    this.configService.changePassword({
      senhaAtual: this.formSenhaAtual,
      novaSenha: this.formNovaSenha,
    }).subscribe({
      next: () => {
        this.saveSenhaState.set('done');
        this.toast.show('success', 'Senha alterada com sucesso!');
        this.formSenhaAtual = '';
        this.formNovaSenha = '';
        setTimeout(() => this.saveSenhaState.set('idle'), 1000);
      },
      error: () => {
        this.saveSenhaState.set('idle');
        this.toast.show('error', 'Senha atual incorreta.');
      },
    });
  }

  resetarDemo() {
    if (!confirm('Tem certeza? Todos os dados serão limpos e recriados.')) return;
    this.resetting.set(true);
    this.configService.resetDemo().subscribe({
      next: () => {
        this.resetting.set(false);
        this.toast.show('success', 'Dados demo restaurados!');
        this.carregarDados();
      },
      error: () => {
        this.resetting.set(false);
        this.toast.show('error', 'Erro ao resetar dados.');
      },
    });
  }
}
