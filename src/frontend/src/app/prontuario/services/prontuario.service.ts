import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface Anexo {
  id: string;
  nome: string;
  contentType: string;
  tamanho: number;
}

export interface Prontuario {
  id: string;
  pacienteId: string;
  data: string;
  descricao: string;
  diagnostico: string;
  prescricao: string;
  anexos: Anexo[];
  pacienteNome?: string;
}

export interface CreateProntuarioRequest {
  data: string;
  descricao?: string;
  diagnostico?: string;
  prescricao?: string;
}

export interface UpdateProntuarioRequest {
  descricao?: string;
  diagnostico?: string;
  prescricao?: string;
}

@Injectable({ providedIn: 'root' })
export class ProntuarioService extends ApiService {
  getByPaciente(pacienteId: string) {
    return this.http.get<Prontuario[]>(`${this.baseUrl}/prontuarios/paciente/${pacienteId}`);
  }

  create(pacienteId: string, request: CreateProntuarioRequest) {
    return this.http.post<Prontuario>(`${this.baseUrl}/prontuarios/paciente/${pacienteId}`, request);
  }

  update(id: string, request: UpdateProntuarioRequest) {
    return this.http.put<Prontuario>(`${this.baseUrl}/prontuarios/${id}`, request);
  }

  uploadAnexo(prontuarioId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Anexo>(`${this.baseUrl}/prontuarios/${prontuarioId}/anexos`, formData);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/prontuarios/${id}`);
  }

  deleteAnexo(id: string) {
    return this.http.delete(`${this.baseUrl}/prontuarios/anexos/${id}`);
  }

  downloadAnexo(id: string) {
    return this.http.get(`${this.baseUrl}/prontuarios/anexos/${id}/download`, { responseType: 'blob' });
  }
}
