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
}

export interface CreateAgendamentoRequest {
  pacienteId: string;
  servicoId: string;
  dataHoraInicio: string;
  observacao?: string | null;
}

export interface RemarcarAgendamentoRequest {
  dataHoraInicio: string;
}

export interface CancelarAgendamentoRequest {
  motivoCancelamento: string;
}

@Injectable({ providedIn: 'root' })
export class AgendamentoService extends ApiService {
  getAll(start?: string, end?: string) {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos`, {
      params: this.buildParams({ start, end }),
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
}
