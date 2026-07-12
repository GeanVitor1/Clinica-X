import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ModulosApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // Anamnese
  listAnamneses(pacienteId?: string) {
    let params = new HttpParams();
    if (pacienteId) params = params.set('pacienteId', pacienteId);
    return this.http.get<any[]>(`${this.base}/anamneses`, { params });
  }
  createAnamnese(body: any) {
    return this.http.post(`${this.base}/anamneses`, body);
  }
  deleteAnamnese(id: string) {
    return this.http.delete(`${this.base}/anamneses/${id}`);
  }

  // Contratos
  listContratos() {
    return this.http.get<any[]>(`${this.base}/contratos`);
  }
  createContrato(body: any) {
    return this.http.post(`${this.base}/contratos`, body);
  }
  updateContrato(id: string, body: any) {
    return this.http.put(`${this.base}/contratos/${id}`, body);
  }

  // WhatsApp
  listConversas() {
    return this.http.get<any[]>(`${this.base}/whatsapp/conversas`);
  }
  createConversa(body: any) {
    return this.http.post(`${this.base}/whatsapp/conversas`, body);
  }
  listMensagens(conversaId: string) {
    return this.http.get<any[]>(`${this.base}/whatsapp/conversas/${conversaId}/mensagens`);
  }
  enviarMensagem(conversaId: string, conteudo: string, automatica = false) {
    return this.http.post(`${this.base}/whatsapp/conversas/${conversaId}/mensagens`, { conteudo, automatica });
  }

  // Injetáveis
  listInjetaveis(pacienteId?: string) {
    let params = new HttpParams();
    if (pacienteId) params = params.set('pacienteId', pacienteId);
    return this.http.get<any[]>(`${this.base}/injetaveis`, { params });
  }
  createInjetavel(body: any) {
    return this.http.post(`${this.base}/injetaveis`, body);
  }
  updateInjetavel(id: string, body: any) {
    return this.http.put(`${this.base}/injetaveis/${id}`, body);
  }
  deleteInjetavel(id: string) {
    return this.http.delete(`${this.base}/injetaveis/${id}`);
  }

  // Telemedicina
  listTeleconsultas() {
    return this.http.get<any[]>(`${this.base}/telemedicina`);
  }
  createTeleconsulta(body: any) {
    return this.http.post(`${this.base}/telemedicina`, body);
  }
  updateTeleStatus(id: string, status: string) {
    return this.http.put(`${this.base}/telemedicina/${id}/status`, { status });
  }

  // Financeiro
  listLancamentos(inicio?: string, fim?: string) {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);
    return this.http.get<any[]>(`${this.base}/financeiro/lancamentos`, { params });
  }
  resumoFinanceiro() {
    return this.http.get<any>(`${this.base}/financeiro/resumo`);
  }
  createLancamento(body: any) {
    return this.http.post(`${this.base}/financeiro/lancamentos`, body);
  }

  // Vendas
  listVendas() {
    return this.http.get<any[]>(`${this.base}/vendas`);
  }
  createVenda(body: any) {
    return this.http.post(`${this.base}/vendas`, body);
  }
  pagarVenda(id: string, formaPagamento?: string) {
    return this.http.put(`${this.base}/vendas/${id}/pagar`, { formaPagamento });
  }
  deleteVenda(id: string) {
    return this.http.delete(`${this.base}/vendas/${id}`);
  }

  // Estoque
  listProdutos() {
    return this.http.get<any[]>(`${this.base}/estoque/produtos`);
  }
  createProduto(body: any) {
    return this.http.post(`${this.base}/estoque/produtos`, body);
  }
  updateProduto(id: string, body: any) {
    return this.http.put(`${this.base}/estoque/produtos/${id}`, body);
  }
  deleteProduto(id: string) {
    return this.http.delete(`${this.base}/estoque/produtos/${id}`);
  }
  movimentar(body: any) {
    return this.http.post(`${this.base}/estoque/movimentacoes`, body);
  }

  // Notas
  listNotas() {
    return this.http.get<any[]>(`${this.base}/notas`);
  }
  emitirNota(body: any) {
    return this.http.post(`${this.base}/notas/emitir`, body);
  }

  // Transcrições
  listTranscricoes(pacienteId?: string) {
    let params = new HttpParams();
    if (pacienteId) params = params.set('pacienteId', pacienteId);
    return this.http.get<any[]>(`${this.base}/transcricoes`, { params });
  }
  createTranscricao(body: any) {
    return this.http.post(`${this.base}/transcricoes`, body);
  }

  // Portal
  listPortal() {
    return this.http.get<any[]>(`${this.base}/portal`);
  }
  createPortal(body: any) {
    return this.http.post(`${this.base}/portal`, body);
  }

  // Avaliação facial
  listAvaliacoes(pacienteId?: string) {
    let params = new HttpParams();
    if (pacienteId) params = params.set('pacienteId', pacienteId);
    return this.http.get<any[]>(`${this.base}/avaliacao-facial`, { params });
  }
  createAvaliacao(body: any) {
    return this.http.post(`${this.base}/avaliacao-facial`, body);
  }

  // Tarefas
  listTarefas() {
    return this.http.get<any[]>(`${this.base}/tarefas`);
  }
  createTarefa(body: any) {
    return this.http.post(`${this.base}/tarefas`, body);
  }
  sugerirTarefas() {
    return this.http.post<any[]>(`${this.base}/tarefas/sugerir-ia`, {});
  }
  updateTarefa(id: string, body: any) {
    return this.http.put(`${this.base}/tarefas/${id}`, body);
  }
  deleteTarefa(id: string) {
    return this.http.delete(`${this.base}/tarefas/${id}`);
  }

  // IA textos
  listTextos() {
    return this.http.get<any[]>(`${this.base}/ia/textos`);
  }
  gerarTexto(tipo: string, prompt: string) {
    return this.http.post<any>(`${this.base}/ia/textos/gerar`, { tipo, prompt });
  }
  enviarTexto(tipo: string, resultado: string, pacienteTelefone?: string) {
    return this.http.post<any>(`${this.base}/ia/textos/enviar`, { tipo, resultado, pacienteTelefone });
  }
}
