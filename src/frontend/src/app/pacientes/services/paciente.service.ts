import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string | null;
  dataNascimento: string | null;
  observacoes: string | null;
  convenio?: string | null;
  numeroCarteirinha?: string | null;
  endereco?: string | null;
  contatoEmergencia?: string | null;
  telefoneEmergencia?: string | null;
  ativo: boolean;
  criadoEm: string;
  ultimoAgendamento: string | null;
  ultimoAgendamentoInfo: string | null;
}

export interface CreatePacienteRequest {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string | null;
  dataNascimento?: string | null;
  observacoes?: string | null;
  convenio?: string | null;
  numeroCarteirinha?: string | null;
  endereco?: string | null;
  contatoEmergencia?: string | null;
  telefoneEmergencia?: string | null;
}

export interface UpdatePacienteRequest extends CreatePacienteRequest {
  ativo: boolean;
}

export interface Evento {
  id: string;
  tipo: string;
  descricao: string;
  criadoEm: string;
  pacienteNome?: string | null;
}

export interface PacienteHistorico {
  paciente: Paciente;
  agendamentos: {
    id: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    status: string;
    servicoNome: string;
    profissional?: string | null;
  }[];
  eventos: {
    id: string;
    tipo: string;
    descricao: string;
    criadoEm: string;
  }[];
}

export interface PacienteListResponse {
  items: Paciente[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class PacienteService extends ApiService {
  getAll(search?: string, page = 1, pageSize = 20, ativo?: boolean | null) {
    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes`, {
      params: this.buildParams({
        search,
        page,
        pageSize,
        ativo: ativo === undefined ? true : ativo === null ? undefined : ativo,
      }),
    });
  }

  getById(id: string) {
    return this.http.get<Paciente>(`${this.baseUrl}/pacientes/${id}`);
  }

  getHistorico(id: string) {
    return this.http.get<PacienteHistorico>(`${this.baseUrl}/pacientes/${id}/historico`);
  }

  create(request: CreatePacienteRequest) {
    return this.http.post<Paciente>(`${this.baseUrl}/pacientes`, request);
  }

  update(id: string, request: UpdatePacienteRequest) {
    return this.http.put<Paciente>(`${this.baseUrl}/pacientes/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/pacientes/${id}`);
  }

  getEventos(id: string) {
    return this.http.get<Evento[]>(`${this.baseUrl}/eventos/paciente/${id}`);
  }
}
