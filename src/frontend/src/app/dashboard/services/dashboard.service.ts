import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface AgendamentoDto {
  id: string;
  pacienteNome: string;
  servicoNome: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  observacao: string | null;
}

export interface OcupacaoDto {
  dia: string;
  total: number;
  realizados: number;
}

export interface DashboardData {
  consultasHoje: number;
  proximos7Dias: number;
  faturamentoMes: number;
  notificacoesPendentes: number;
  consultasHojeLista: AgendamentoDto[];
  ocupacaoSemana: OcupacaoDto[];
}

export interface EventoDto {
  id: string;
  tipo: string;
  descricao: string;
  criadoEm: string;
  pacienteNome: string | null;
}

export interface NotificacaoDto {
  id: string;
  tipo: string;
  mensagem: string;
  status: string;
  lida: boolean;
  criadoEm: string;
  enviadaEm: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  getDashboard() {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`);
  }

  getTimeline() {
    return this.http.get<EventoDto[]>(`${this.baseUrl}/dashboard/timeline`);
  }

  getNotificacoes() {
    return this.http.get<NotificacaoDto[]>(`${this.baseUrl}/notificacoes`);
  }
}
