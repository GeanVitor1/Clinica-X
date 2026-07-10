import { Component, signal, computed, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RelatorioService, RelatorioFinanceiro, RelatorioOcupacao } from '../../services/relatorio.service';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Relatórios</h1>
        <div class="header-actions">
          <button class="btn-outline" type="button" (click)="exportPdf()">📄 Exportar PDF</button>
          <button class="btn-outline" type="button" (click)="exportCsv()">📊 Exportar CSV</button>
        </div>
      </header>

      <div class="filters">
        <div class="tab-group">
          <button type="button" class="tab" [class.tab--active]="tab() === 'financeiro'" (click)="tab.set('financeiro'); carregarDados()">Financeiro</button>
          <button type="button" class="tab" [class.tab--active]="tab() === 'ocupacao'" (click)="tab.set('ocupacao'); carregarDados()">Ocupação</button>
        </div>
        <div class="period-group">
          <label>Período</label>
          <select [(ngModel)]="mesSelecionado" (change)="carregarDados()">
            @for (m of meses; track m.value) {
              <option [value]="m.value">{{ m.label }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-skeleton variant="table" />
        <app-skeleton variant="chart" />
      }

      <div class="report-content" #reportContent [class.hidden]="loading()">
        @if (tab() === 'financeiro') {
          <div class="report-card">
            <h2>Faturamento por Serviço</h2>
            <p class="period-label">{{ periodoLabel() }}</p>
            @if (financeiro().porServico.length === 0) {
              <app-empty-state icon="relatorios" message="Sem faturamento neste período." />
            }

            @if (financeiro().porServico.length > 0) {
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th class="num">Qtd</th>
                    <th class="num">Valor Unit.</th>
                    <th class="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of financeiro().porServico; track item.servicoNome) {
                    <tr>
                      <td>{{ item.servicoNome }}</td>
                      <td class="num">{{ item.quantidade }}</td>
                      <td class="num">{{ item.valorUnitario | currency:'BRL' }}</td>
                      <td class="num">{{ item.total | currency:'BRL' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="3">Total do Período</th>
                    <th class="num">{{ financeiro().totalPeriodo | currency:'BRL' }}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            }
          </div>
        }

        @if (tab() === 'ocupacao') {
          <div class="report-card">
            <h2>Ocupação</h2>
            <p class="period-label">{{ periodoLabel() }} — {{ ocupacao().totalAgendamentos }} consultas no total</p>

            <div class="ocupacao-grid">
              <div class="sub-card">
                <h3>Horários de Pico</h3>
                <div class="bar-chart-h">
                  @for (item of ocupacao().horariosPico; track item.hora) {
                    <div class="bar-row">
                      <span class="bar-label">{{ item.hora }}h</span>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="(item.quantidade / maxOcupacao()) * 100">
                          <span class="bar-val">{{ item.quantidade }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="sub-card">
                <h3>Serviços Mais Agendados</h3>
                <div class="servicos-list">
                  @for (item of ocupacao().servicosMaisAgendados; track item.servicoNome) {
                    <div class="servico-item">
                      <div class="servico-header">
                        <span class="servico-nome">{{ item.servicoNome }}</span>
                        <span class="servico-qtd">{{ item.quantidade }}x</span>
                      </div>
                      <div class="servico-track">
                        <div class="servico-fill" [style.width.%]="item.percentual"></div>
                      </div>
                      <span class="servico-pct">{{ item.percentual }}%</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary); letter-spacing: -0.02em; }
    .header-actions { display: flex; gap: 8px; }

    .btn-outline {
      padding: 8px 16px;
      background: transparent;
      color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-outline:hover { border-color: var(--clx-accent); color: var(--clx-accent); background: var(--clx-accent-muted); }

    .filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; }
    .tab-group { display: flex; gap: 2px; background: var(--clx-surface-3); padding: 3px; border-radius: var(--clx-radius-md); }
    .tab {
      padding: 7px 18px;
      border: none;
      background: transparent;
      border-radius: var(--clx-radius-sm);
      cursor: pointer;
      font-size: 0.84rem;
      color: var(--clx-text-secondary);
      font-weight: 500;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
    }
    .tab--active { background: var(--clx-surface-1); color: var(--clx-text-primary); font-weight: 600; box-shadow: var(--clx-shadow-xs); }

    .period-group { display: flex; align-items: center; gap: 8px; }
    .period-group label { font-size: 0.8rem; color: var(--clx-text-secondary); font-weight: 500; }
    .period-group select {
      padding: 7px 12px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-sm);
      background: var(--clx-surface-1);
      color: var(--clx-text-primary);
      font-size: 0.82rem;
      font-family: var(--clx-font);
      outline: none;
    }

    .report-card {
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-lg);
      padding: 24px;
    }
    .report-card h2 { font-size: 1.05rem; margin-bottom: 4px; color: var(--clx-text-primary); font-weight: 700; }
    .period-label { font-size: 0.8rem; color: var(--clx-text-tertiary); margin-bottom: 20px; }

    .table-container { overflow-x: auto; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 12px; font-size: 0.72rem; color: var(--clx-text-tertiary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--clx-border); }
    td { padding: 10px 12px; border-bottom: 1px solid var(--clx-border); font-size: 0.86rem; color: var(--clx-text-primary); }
    tfoot th { padding: 12px 12px; font-size: 0.88rem; color: var(--clx-text-primary); border-top: 2px solid var(--clx-border-strong); border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }

    .ocupacao-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .sub-card h3 { font-size: 0.9rem; margin-bottom: 14px; color: var(--clx-text-primary); font-weight: 650; }

    .bar-chart-h { display: flex; flex-direction: column; gap: 8px; }
    .bar-row { display: flex; align-items: center; gap: 8px; }
    .bar-label { width: 32px; font-size: 0.76rem; color: var(--clx-text-tertiary); text-align: right; flex-shrink: 0; }
    .bar-track { flex: 1; height: 20px; background: var(--clx-surface-2); border-radius: var(--clx-radius-xs); overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--clx-accent), var(--clx-purple)); border-radius: var(--clx-radius-xs); display: flex; align-items: center; padding-left: 6px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .bar-val { font-size: 0.65rem; font-weight: 600; color: #fff; }

    .servicos-list { display: flex; flex-direction: column; gap: 12px; }
    .servico-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .servico-nome { font-size: 0.82rem; color: var(--clx-text-primary); }
    .servico-qtd { font-size: 0.78rem; color: var(--clx-text-secondary); }
    .servico-track { height: 16px; background: var(--clx-surface-2); border-radius: var(--clx-radius-xs); overflow: hidden; margin-bottom: 2px; }
    .servico-fill { height: 100%; background: linear-gradient(90deg, var(--clx-accent), var(--clx-success)); border-radius: var(--clx-radius-xs); transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .servico-pct { font-size: 0.7rem; color: var(--clx-text-tertiary); }

    .hidden { display: none; }

    @media (max-width: 700px) {
      .ocupacao-grid { grid-template-columns: 1fr; }
      .filters { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class RelatoriosPageComponent implements OnInit {
  private relatorioService = inject(RelatorioService);

  @ViewChild('reportContent', { read: ElementRef }) reportContentRef?: ElementRef;

  tab = signal<'financeiro' | 'ocupacao'>('financeiro');
  mesSelecionado = '';
  loading = signal(false);

  financeiro = signal<RelatorioFinanceiro>({
    dataInicio: '', dataFim: '', totalPeriodo: 0, porServico: [],
  });
  ocupacao = signal<RelatorioOcupacao>({
    dataInicio: '', dataFim: '', totalAgendamentos: 0, horariosPico: [], servicosMaisAgendados: [],
  });

  meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1);
    return { value: `${d.getFullYear()}-${String(i + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) };
  });

  periodoLabel = computed(() => {
    const [ano, mes] = this.mesSelecionado.split('-');
    const d = new Date(+ano, +mes - 1, 1);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  maxOcupacao = computed(() => Math.max(...this.ocupacao().horariosPico.map(h => h.quantidade), 1));

  ngOnInit() {
    const d = new Date();
    this.mesSelecionado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarDados();
  }

  carregarDados() {
    this.loading.set(true);
    const [ano, mes] = this.mesSelecionado.split('-');
    const dataInicio = `${ano}-${mes}-01`;
    const ultimoDia = new Date(+ano, +mes, 0).getDate();
    const dataFim = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;

    if (this.tab() === 'financeiro') {
      this.relatorioService.getFinanceiro(dataInicio, dataFim).subscribe({
        next: (data) => { this.financeiro.set(data); this.loading.set(false); },
        error: () => {
          this.financeiro.set({ dataInicio, dataFim, totalPeriodo: 0, porServico: [] });
          this.loading.set(false);
        },
      });
    } else {
      this.relatorioService.getOcupacao(dataInicio, dataFim).subscribe({
        next: (data) => { this.ocupacao.set(data); this.loading.set(false); },
        error: () => {
          this.ocupacao.set({ dataInicio, dataFim, totalAgendamentos: 0, horariosPico: [], servicosMaisAgendados: [] });
          this.loading.set(false);
        },
      });
    }
  }

  async exportPdf() {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const el = this.reportContentRef?.nativeElement;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgW = 190;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH);
    pdf.save(`relatorio-${this.tab()}-${this.mesSelecionado}.pdf`);
  }

  exportCsv() {
    let csv = '';
    if (this.tab() === 'financeiro') {
      csv = 'Serviço,Quantidade,Valor Unitário,Total\n';
      for (const item of this.financeiro().porServico) {
        csv += `${item.servicoNome},${item.quantidade},${item.valorUnitario},${item.total}\n`;
      }
      csv += `Total,,,${this.financeiro().totalPeriodo}\n`;
    } else {
      csv = 'Serviço,Quantidade,Percentual\n';
      for (const item of this.ocupacao().servicosMaisAgendados) {
        csv += `${item.servicoNome},${item.quantidade},${item.percentual}%\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${this.tab()}-${this.mesSelecionado}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
