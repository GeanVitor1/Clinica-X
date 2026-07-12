import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AgendamentoService } from '../agenda/services/agendamento.service';

@Component({
  selector: 'app-confirmar-consulta',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="wrap">
      <div class="card">
        <div class="logo">ClinicaX</div>
        @if (loading()) {
          <p class="muted">Processando…</p>
        } @else if (!confirmed() && !done()) {
          <h1>Confirmar consulta</h1>
          <p class="muted">Clique no botão abaixo para confirmar sua presença. Isso evita confirmações acidentais por links automáticos.</p>
          <button type="button" class="btn" (click)="confirmar()" [disabled]="loading()">
            Confirmar minha consulta
          </button>
        } @else if (ok()) {
          <div class="icon ok">✓</div>
          <h1>Consulta confirmada</h1>
          <p>{{ mensagem() }}</p>
          @if (paciente()) {
            <p class="detail"><strong>{{ paciente() }}</strong></p>
          }
          @if (dataHora()) {
            <p class="detail">{{ dataHora() | date: 'dd/MM/yyyy HH:mm' }}</p>
          }
        } @else {
          <div class="icon err">!</div>
          <h1>Não foi possível confirmar</h1>
          <p>{{ mensagem() }}</p>
        }
        <a routerLink="/auth/login" class="btn link">Acessar ClinicaX</a>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: linear-gradient(145deg, #0f172a, #1e3a5f 50%, #0d9488);
      }
      .card {
        max-width: 420px;
        width: 100%;
        background: #fff;
        border-radius: 20px;
        padding: 36px 28px;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      }
      .logo {
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #0f172a;
        margin-bottom: 20px;
      }
      h1 {
        font-size: 1.35rem;
        margin: 12px 0 8px;
        color: #0f172a;
      }
      p {
        color: #64748b;
        line-height: 1.5;
      }
      .detail {
        color: #0f172a;
        margin-top: 8px;
      }
      .muted {
        color: #94a3b8;
      }
      .icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        margin: 0 auto;
        font-size: 1.4rem;
        font-weight: 700;
        color: #fff;
      }
      .icon.ok {
        background: #0d9488;
      }
      .icon.err {
        background: #e11d48;
      }
      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 22px;
        border-radius: 12px;
        background: #3b6ef5;
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn.link {
        background: transparent;
        color: #3b6ef5;
        display: block;
        margin-top: 12px;
      }
    `,
  ],
})
export class ConfirmarConsultaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AgendamentoService);

  readonly loading = signal(false);
  readonly done = signal(false);
  readonly confirmed = signal(false);
  readonly ok = signal(false);
  readonly mensagem = signal('');
  readonly paciente = signal<string | null>(null);
  readonly dataHora = signal<string | null>(null);
  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.done.set(true);
      this.ok.set(false);
      this.mensagem.set('Link inválido.');
    }
  }

  confirmar(): void {
    if (!this.token || this.loading()) return;
    this.loading.set(true);
    this.api.confirmarPublico(this.token).subscribe({
      next: (r) => {
        this.ok.set(!!r.sucesso);
        this.mensagem.set(r.mensagem);
        this.paciente.set(r.pacienteNome ?? null);
        this.dataHora.set(r.dataHora ?? null);
        this.confirmed.set(true);
        this.done.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.ok.set(false);
        this.mensagem.set(err?.error?.mensagem || 'Não foi possível processar a confirmação. Tente novamente.');
        this.done.set(true);
        this.loading.set(false);
      },
    });
  }
}
