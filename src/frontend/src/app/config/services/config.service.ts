import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface ClinicaData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: string;
  plano: string;
}

export interface UpdateClinicaRequest {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: string;
  plano: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  novaSenha: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService extends ApiService {
  get() {
    return this.http.get<ClinicaData>(`${this.baseUrl}/config`);
  }

  update(request: UpdateClinicaRequest) {
    return this.http.put(`${this.baseUrl}/config`, request);
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.post(`${this.baseUrl}/config/change-password`, request);
  }

  resetDemo() {
    return this.http.post(`${this.baseUrl}/config/reset-demo`, {});
  }
}
