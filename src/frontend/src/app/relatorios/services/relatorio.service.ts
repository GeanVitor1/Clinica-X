import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface FaturamentoServico {
  servicoNome: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export interface RelatorioFinanceiro {
  dataInicio: string;
  dataFim: string;
  totalPeriodo: number;
  porServico: FaturamentoServico[];
}

export interface OcupacaoHorario {
  hora: number;
  quantidade: number;
}

export interface ServicoAgendado {
  servicoNome: string;
  quantidade: number;
  percentual: number;
}

export interface RelatorioOcupacao {
  dataInicio: string;
  dataFim: string;
  totalAgendamentos: number;
  horariosPico: OcupacaoHorario[];
  servicosMaisAgendados: ServicoAgendado[];
}

@Injectable({ providedIn: 'root' })
export class RelatorioService extends ApiService {
  getFinanceiro(dataInicio: string, dataFim: string) {
    return this.http.get<RelatorioFinanceiro>(`${this.baseUrl}/relatorios/financeiro`, {
      params: this.buildParams({ dataInicio, dataFim }),
    });
  }

  getOcupacao(dataInicio: string, dataFim: string) {
    return this.http.get<RelatorioOcupacao>(`${this.baseUrl}/relatorios/ocupacao`, {
      params: this.buildParams({ dataInicio, dataFim }),
    });
  }
}
