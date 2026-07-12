import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface Agendamento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  servicoId: string;
  servicoNome: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  observacao: string | null;
  motivoCancelamento?: string | null;
  cor: string | null;
  profissional?: string | null;
  sala?: string | null;
  equipamento?: string | null;
  tokenConfirmacao?: string | null;
  confirmadoEm?: string | null;
  realizadoEm?: string | null;
}

export interface CreateAgendamentoRequest {
  pacienteId: string;
  servicoId: string;
  dataHoraInicio: string;
  observacao?: string | null;
  profissional?: string | null;
  sala?: string | null;
  equipamento?: string | null;
}

export interface RemarcarAgendamentoRequest {
  dataHoraInicio: string;
}

export interface CancelarAgendamentoRequest {
  motivoCancelamento: string;
}

export interface BloqueioAgenda {
  id: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  motivo: string;
  profissional?: string | null;
  sala?: string | null;
  equipamento?: string | null;
}

export interface CreateBloqueioRequest {
  dataHoraInicio: string;
  dataHoraFim: string;
  motivo: string;
  profissional?: string | null;
  sala?: string | null;
  equipamento?: string | null;
}

export interface ConfirmarPublicoResponse {
  sucesso: boolean;
  mensagem: string;
  pacienteNome?: string | null;
  dataHora?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AgendamentoService extends ApiService {
  getAll(start?: string, end?: string, profissional?: string, sala?: string, status?: string) {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos`, {
      params: this.buildParams({ start, end, profissional, sala, status }),
    });
  }

  create(request: CreateAgendamentoRequest) {
    return this.http.post<Agendamento>(`${this.baseUrl}/agendamentos`, request);
  }

  remarcar(id: string, request: RemarcarAgendamentoRequest) {
    return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}/remarcar`, request);
  }

  cancelar(id: string, request: CancelarAgendamentoRequest) {
    return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}/cancelar`, request);
  }

  confirmar(id: string) {
    return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}/confirmar`, {});
  }

  realizar(id: string) {
    return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}/realizar`, {});
  }

  falta(id: string) {
    return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}/falta`, {});
  }

  listBloqueios(start?: string, end?: string) {
    return this.http.get<BloqueioAgenda[]>(`${this.baseUrl}/agendamentos/bloqueios`, {
      params: this.buildParams({ start, end }),
    });
  }

  createBloqueio(request: CreateBloqueioRequest) {
    return this.http.post<BloqueioAgenda>(`${this.baseUrl}/agendamentos/bloqueios`, request);
  }

  deleteBloqueio(id: string) {
    return this.http.delete(`${this.baseUrl}/agendamentos/bloqueios/${id}`);
  }

  confirmarPublico(token: string) {
    return this.http.post<ConfirmarPublicoResponse>(`${this.baseUrl}/public/confirmar/${token}`, {});
  }
}
