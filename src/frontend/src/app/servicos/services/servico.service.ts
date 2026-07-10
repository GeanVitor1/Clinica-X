import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracaoMin: number;
  valor: number;
  cor: string;
  ativo: boolean;
}

export interface CreateServicoRequest {
  nome: string;
  descricao?: string;
  duracaoMin: number;
  valor: number;
  cor?: string;
}

export interface UpdateServicoRequest {
  nome: string;
  descricao?: string;
  duracaoMin: number;
  valor: number;
  cor?: string;
}

@Injectable({ providedIn: 'root' })
export class ServicoService extends ApiService {
  getAll() {
    return this.http.get<Servico[]>(`${this.baseUrl}/servicos`);
  }

  create(request: CreateServicoRequest) {
    return this.http.post<Servico>(`${this.baseUrl}/servicos`, request);
  }

  update(id: string, request: UpdateServicoRequest) {
    return this.http.put<Servico>(`${this.baseUrl}/servicos/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/servicos/${id}`);
  }
}
