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
        <h1>Configurações</h1>
      </header>

      <div class="config-grid">
        <div class="card">
          <h2>Dados da Clínica</h2>
          <form class="config-form" (ngSubmit)="salvarClinica()">
            <div class="field">
              <label>Nome da Clínica</label>
              <input [(ngModel)]="formNome" name="nome" />
            </div>
            <div class="field">
              <label>Email</label>
              <input [(ngModel)]="formEmail" name="email" type="email" />
            </div>
            <div class="field">
              <label>Telefone</label>
              <input [(ngModel)]="formTelefone" name="telefone" />
            </div>
            <div class="field">
              <label>Endereço</label>
              <input [(ngModel)]="formEndereco" name="endereco" />
            </div>
            <app-btn-submit label="Salvar Dados" [state]="saveClinicaState()" />
          </form>
        </div>

        <div class="card">
          <h2>Horário Comercial</h2>
          <form class="config-form" (ngSubmit)="salvarHorario()">
            <div class="field">
              <label>Abertura</label>
              <input [(ngModel)]="formAbertura" name="abertura" type="time" />
            </div>
            <div class="field">
              <label>Fechamento</label>
              <input [(ngModel)]="formFechamento" name="fechamento" type="time" />
            </div>
            <div class="field">
              <label>Dias de funcionamento</label>
              <div class="dias-grid">
                @for (d of diasSemana; track d.value) {
                  <label class="dia-chip">
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
            <app-btn-submit label="Salvar Horário" [state]="saveHorarioState()" />
          </form>
        </div>

        <div class="card">
          <h2>Alterar Senha</h2>
          <form class="config-form" (ngSubmit)="alterarSenha()">
            <div class="field">
              <label>Senha Atual</label>
              <input [(ngModel)]="formSenhaAtual" name="senhaAtual" type="password" />
            </div>
            <div class="field">
              <label>Nova Senha</label>
              <input [(ngModel)]="formNovaSenha" name="novaSenha" type="password" />
            </div>
            <app-btn-submit label="Alterar Senha" [state]="saveSenhaState()" />
            @if (senhaErro()) { <span class="field-error">{{ senhaErro() }}</span> }
          </form>
        </div>

        <div class="card card--danger">
          <h2>Resetar Dados Demo</h2>
          <p class="danger-desc">Limpa todos os dados cadastrados (pacientes, agendamentos, notificações) e recria os dados fictícios iniciais.</p>
          <button type="button" class="btn-danger" (click)="resetarDemo()" [disabled]="resetting()">
            {{ resetting() ? 'Resetando...' : '🔄 Resetar Dados Demo' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary); letter-spacing: -0.02em; }

    .config-grid { display: flex; flex-direction: column; gap: 20px; }

    .card {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      padding: 24px;
    }
    .card h2 { font-size: 1rem; font-weight: 700; margin-bottom: 18px; color: var(--clx-text-primary); }

    .config-form { display: flex; flex-direction: column; gap: 14px; max-width: 420px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 0.8rem; font-weight: 500; color: var(--clx-text-secondary); }
    .field input, .field select {
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
    .field input:focus, .field select:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }

    .dias-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .dia-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--clx-surface-2);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-sm);
      font-size: 0.78rem;
      color: var(--clx-text-primary);
      cursor: pointer;
      font-weight: 500;
      transition: all var(--clx-transition-fast);
    }
    .dia-chip:has(input:checked) { background: var(--clx-accent-muted); border-color: var(--clx-accent); color: var(--clx-accent); }
    .dia-chip input { accent-color: var(--clx-accent); }

    .card--danger { border-color: rgba(239, 68, 68, 0.2); background: var(--clx-surface-1); }
    .card--danger h2 { color: var(--clx-error); }
    .danger-desc { font-size: 0.82rem; color: var(--clx-text-secondary); margin-bottom: 16px; line-height: 1.5; }

    .btn-danger {
      padding: 9px 18px;
      background: var(--clx-error);
      color: #fff;
      border: none;
      border-radius: var(--clx-radius-md);
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
    }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .field-error { color: var(--clx-error); font-size: 0.78rem; }
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
