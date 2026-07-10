import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

export interface NotificacaoRealtimeEvent {
  tipo: string;
  mensagem: string;
  sucesso: boolean;
  clinicaId: string;
  agendamentoId: string | null;
  pacienteId: string | null;
}

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private connection: HubConnection | null = null;
  private started = false;

  readonly connected = signal(false);
  readonly lastEvent = signal<NotificacaoRealtimeEvent | null>(null);

  async start(): Promise<void> {
    if (this.started && this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    const token = this.auth.getToken();
    if (!token) return;

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        /* ignore */
      }
      this.connection = null;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.onreconnected(() => this.connected.set(true));
    this.connection.onreconnecting(() => this.connected.set(false));
    this.connection.onclose(() => this.connected.set(false));

    this.connection.on('NotificacaoEnviada', (payload: NotificacaoRealtimeEvent) => {
      this.lastEvent.set(payload);
      const type = payload.sucesso ? 'success' : 'error';
      this.toast.show(type, payload.mensagem || `Notificação ${payload.tipo}`);
      window.dispatchEvent(new CustomEvent('notificacao', { detail: payload }));
    });

    try {
      await this.connection.start();
      this.started = true;
      this.connected.set(true);
    } catch {
      this.connected.set(false);
      // Reconnect automático do client; tenta de novo em 10s se falhou no start
      setTimeout(() => {
        if (this.auth.getToken()) void this.start();
      }, 10000);
    }
  }

  async stop(): Promise<void> {
    this.started = false;
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        /* ignore */
      }
      this.connection = null;
    }
    this.connected.set(false);
  }

  ngOnDestroy(): void {
    void this.stop();
  }
}
