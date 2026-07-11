import { Component, signal, OnInit, AfterViewInit, inject, ElementRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { gsap } from 'gsap';
import { ToastService } from '../../../shared/services/toast.service';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { DashboardService, EventoDto, AgendamentoDto, OcupacaoDto } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, SkeletonComponent],
  template: `
    <div class="dashboard-bg"></div>
    <div class="dashboard">
      <header class="dash-header">
        <div class="dash-header-start">
          <h1>Dashboard</h1>
          <span class="dash-badge">Demo</span>
        </div>
        <button class="dash-bell" type="button" (click)="showDemoToast()">
          <svg width="18" height="18"><use href="#ic-bell"/></svg>
          @if (notificacoesPendentes() > 0) {
            <span class="bell-dot">{{ notificacoesPendentes() }}</span>
          }
        </button>
      </header>

      @if (loading()) {
        <div class="kpi-grid">
          @for (_ of [1,2,3,4]; track $index) {
            <app-skeleton variant="card" />
          }
        </div>
        <div class="dash-bottom-grid">
          <app-skeleton variant="chart" />
          <app-skeleton variant="text" />
        </div>
      } @else {
        <div class="kpi-grid" #cardsGrid>
          <div class="kpi kpi--featured" #cardEl>
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon--blue">
                <svg width="18" height="18"><use href="#ic-clipboard"/></svg>
              </div>
              <span class="kpi-label">Consultas hoje</span>
            </div>
            <span class="kpi-value" #countUp>{{ consultasHoje() }}</span>
            <div class="kpi-details">
              @for (c of consultasHojeLista(); track c.id) {
                <div class="kpi-item">
                  <span class="kpi-item-name">{{ c.pacienteNome }}</span>
                  <span class="kpi-item-time">{{ c.dataHoraInicio | date:'HH:mm' }}</span>
                </div>
              }
              @if (consultasHojeLista().length === 0) {
                <span class="kpi-empty">Nenhuma consulta hoje</span>
              }
            </div>
          </div>

          <div class="kpi" #cardEl>
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon--purple">
                <svg width="18" height="18"><use href="#ic-calendar"/></svg>
              </div>
              <span class="kpi-label">Pr&oacute;ximos 7 dias</span>
            </div>
            <span class="kpi-value" #countUp>{{ proximos7Dias() }}</span>
          </div>

          <div class="kpi" #cardEl>
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon--green">
                <svg width="18" height="18"><use href="#ic-dollar"/></svg>
              </div>
              <span class="kpi-label">Faturamento do m&ecirc;s</span>
            </div>
            <span class="kpi-value kpi-value--money" #countUp>R$ {{ faturamentoMes() }}</span>
          </div>

          <div class="kpi" #cardEl>
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon--amber">
                <svg width="18" height="18"><use href="#ic-bell"/></svg>
              </div>
              <span class="kpi-label">Notifica&ccedil;&otilde;es pendentes</span>
            </div>
            <span class="kpi-value" #countUp>{{ notificacoesPendentes() }}</span>
          </div>
        </div>

        <div class="dash-bottom-grid">
          <div class="panel" #chartCard>
            <div class="panel-header">
              <h2>Ocupa&ccedil;&atilde;o da semana</h2>
              <span class="panel-badge">
                <svg width="12" height="12"><use href="#ic-chart"/></svg>
                Gr&aacute;fico
              </span>
            </div>
            <div class="chart-wrap">
              <div #apexChart class="apex-chart"></div>
            </div>
          </div>

          <div class="panel" #timelineCard>
            <div class="panel-header">
              <h2>Atividades recentes</h2>
            </div>
            <div class="tl">
              @for (ev of timeline(); track ev.id) {
                <div class="tl-item">
                  <div class="tl-dot" [style.background]="getEventColor(ev.tipo)">
                    <span>{{ getEventIcon(ev.tipo) }}</span>
                  </div>
                  <div class="tl-body">
                    <p class="tl-desc">{{ ev.descricao }}</p>
                    <span class="tl-time">{{ timeAgo(ev.criadoEm) }}</span>
                  </div>
                </div>
              }
              @if (timeline().length === 0) {
                <div class="tl-empty">Nenhuma atividade recente</div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-bg {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: var(--clx-bg-mesh);
      pointer-events: none;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .dashboard { max-width: 1200px; margin: 0 auto; position: relative; }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .dash-header-start { display: flex; align-items: center; gap: 12px; }

    .dash-header h1 {
      font-size: 1.5rem;
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.02em;
    }

    .dash-badge {
      padding: 3px 10px;
      border-radius: var(--clx-radius-full);
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .dash-bell {
      position: relative;
      background: var(--clx-card-bg);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-md);
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--clx-text-muted);
      box-shadow: var(--clx-shadow-xs);
      transition: all var(--clx-transition-fast);
    }

    .dash-bell:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
      background: var(--clx-accent-muted);
    }

    .bell-dot {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--clx-error);
      color: #fff;
      border-radius: var(--clx-radius-full);
      min-width: 18px;
      height: 18px;
      font-size: 0.6rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi {
      background: var(--clx-card-bg);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius);
      padding: 20px;
      box-shadow: var(--clx-shadow-card);
      transition: all var(--clx-transition-base);
      position: relative;
      overflow: hidden;
    }

    .kpi:hover {
      border-color: color-mix(in srgb, var(--clx-accent) 30%, var(--clx-border));
      box-shadow: var(--clx-shadow-card-hover);
      transform: translateY(-2px);
    }

    .kpi--featured {
      background: linear-gradient(145deg, #1a3570 0%, #122445 55%, #0f2145 100%);
      border-color: rgba(96, 165, 250, 0.22);
      box-shadow:
        0 0 0 1px rgba(147, 197, 253, 0.08) inset,
        0 12px 32px rgba(15, 40, 90, 0.25);
    }

    .kpi-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }

    .kpi-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--clx-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon--blue { background: var(--clx-accent-muted); color: var(--clx-accent); }
    .kpi-icon--purple { background: var(--clx-purple-muted); color: var(--clx-purple); }
    .kpi-icon--green { background: var(--clx-success-muted); color: var(--clx-success); }
    .kpi-icon--amber { background: var(--clx-amber-muted); color: var(--clx-amber); }

    .kpi-label { font-size: 0.78rem; font-weight: 500; color: var(--clx-text-muted); }
    .kpi--featured .kpi-label { color: rgba(250, 250, 249, 0.6); }

    .kpi-value {
      display: block;
      font-size: 2rem;
      font-weight: 800;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }

    .kpi--featured .kpi-value { color: var(--clx-text-light); }

    .kpi-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .kpi-item { display: flex; justify-content: space-between; font-size: 0.76rem; }
    .kpi-item-name { color: rgba(250, 250, 249, 0.65); }
    .kpi-item-time { color: var(--clx-accent-hover); font-weight: 600; }
    .kpi-empty { font-size: 0.76rem; color: rgba(250, 250, 249, 0.35); }

    .dash-bottom-grid { display: grid; grid-template-columns: 5fr 4fr; gap: 16px; }

    .panel {
      background: var(--clx-card-bg);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius);
      padding: 24px;
      box-shadow: var(--clx-shadow-card);
      transition: box-shadow var(--clx-transition-base), transform var(--clx-transition-base);
    }

    .panel:hover {
      box-shadow: var(--clx-shadow-card-hover);
      transform: translateY(-1px);
    }

    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

    .panel-header h2 {
      font-size: 0.92rem;
      font-weight: 650;
      color: var(--clx-text);
      letter-spacing: -0.01em;
    }

    .panel-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: var(--clx-radius-xs);
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
      font-size: 0.62rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .chart-wrap { height: 280px; }

    .tl { display: flex; flex-direction: column; position: relative; }
    .tl::before {
      content: '';
      position: absolute;
      left: 17px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--clx-border);
    }

    .tl-item { display: flex; gap: 14px; padding: 12px 0; position: relative; }
    .tl-item:first-child { padding-top: 0; }

    .tl-dot {
      width: 35px;
      height: 35px;
      border-radius: var(--clx-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
      z-index: 1;
    }

    .tl-body { flex: 1; min-width: 0; padding-top: 2px; }

    .tl-desc {
      font-size: 0.82rem;
      color: var(--clx-text);
      margin-bottom: 2px;
      font-weight: 500;
      line-height: 1.4;
    }

    .tl-time { font-size: 0.69rem; color: var(--clx-text-muted); }

    .tl-empty {
      text-align: center;
      padding: 40px 0;
      color: var(--clx-text-muted);
      font-size: 0.82rem;
    }

    @media (max-width: 1000px) {
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .dash-bottom-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private toastService = inject(ToastService);

  @ViewChild('cardsGrid', { read: ElementRef }) cardsGridRef?: ElementRef;
  @ViewChild('apexChart', { read: ElementRef }) apexChartRef?: ElementRef;

  loading = signal(true);
  consultasHoje = signal(0);
  proximos7Dias = signal(0);
  faturamentoMes = signal(0);
  notificacoesPendentes = signal(0);
  consultasHojeLista = signal<AgendamentoDto[]>([]);
  timeline = signal<EventoDto[]>([]);
  ocupacao = signal<OcupacaoDto[]>([]);

  private chartInstance: any = null;

  ngOnInit() {
    this.carregarDados();
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      if (!this.loading()) {
        this.animarCards();
        this.iniciarApexChart();
      }
    });
  }

  private carregarDados() {
    this.loading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.consultasHoje.set(data.consultasHoje);
        this.proximos7Dias.set(data.proximos7Dias);
        this.faturamentoMes.set(data.faturamentoMes);
        this.notificacoesPendentes.set(data.notificacoesPendentes);
        this.consultasHojeLista.set(data.consultasHojeLista);
        this.ocupacao.set(data.ocupacao);
        this.loading.set(false);
        requestAnimationFrame(() => {
          this.animarCountUp();
          this.animarCards();
          this.iniciarApexChart();
        });
      },
      error: () => {
        this.consultasHoje.set(0);
        this.proximos7Dias.set(0);
        this.faturamentoMes.set(0);
        this.notificacoesPendentes.set(0);
        this.consultasHojeLista.set([]);
        this.ocupacao.set([]);
        this.loading.set(false);
      },
    });
    this.dashboardService.getTimeline().subscribe({
      next: (data) => this.timeline.set(data),
      error: () => this.timeline.set([]),
    });
  }

  private animarCountUp() {
    const alvos = [
      { s: this.consultasHoje, v: this.consultasHoje() },
      { s: this.proximos7Dias, v: this.proximos7Dias() },
      { s: this.faturamentoMes, v: this.faturamentoMes() },
      { s: this.notificacoesPendentes, v: this.notificacoesPendentes() },
    ];
    alvos.forEach(({ s, v }) => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: v,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => s.set(Math.round(obj.val)),
      });
    });
  }

  private animarCards() {
    if (!this.cardsGridRef) return;
    const cards = this.cardsGridRef.nativeElement.querySelectorAll('.card');
    gsap.fromTo(cards,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }

  private async iniciarApexChart() {
    if (!this.apexChartRef || this.ocupacao().length === 0) return;
    const ApexCharts = (await import('apexcharts')).default;
    const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    const categories = this.ocupacao().map(o => dias.includes(o.dia) ? o.dia.substring(0, 3) : o.dia.substring(0, 3));
    const totals = this.ocupacao().map(o => o.total);
    const realizados = this.ocupacao().map(o => o.realizados || 0);

    const options = {
      chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },
      series: [
        { name: 'Realizados', data: realizados },
        { name: 'Total', data: totals.map((t: number, i: number) => t - (realizados[i] || 0)) },
      ],
      xaxis: { categories, labels: { style: { colors: '#94a3b8' } } },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      colors: ['#14b8a6', '#1e293b'],
      legend: { labels: { colors: '#94a3b8' } },
      grid: { borderColor: '#334155' },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: false },
      },
    };

    if (this.chartInstance) {
      this.chartInstance.updateOptions(options);
    } else {
      this.chartInstance = new ApexCharts(this.apexChartRef.nativeElement, options);
      await this.chartInstance.render();
    }
  }

  getEventIcon(tipo: string): string {
    const icons: Record<string, string> = {
      AgendamentoCriado: '📅', AgendamentoCancelado: '❌', AgendamentoRemarcado: '🔄',
      PacienteCriado: '✅', PacienteEditado: '✏️', NotificacaoEnviada: '📤',
    };
    return icons[tipo] || '📌';
  }

  getEventColor(tipo: string): string {
    const colors: Record<string, string> = {
      AgendamentoCriado: '#14b8a6', AgendamentoCancelado: '#ef4444', AgendamentoRemarcado: '#f59e0b',
      PacienteCriado: '#10b981', PacienteEditado: '#3b82f6', NotificacaoEnviada: '#3b82f6',
    };
    return colors[tipo] || '#64748b';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `há ${days} dia${days > 1 ? 's' : ''}`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  showDemoToast() {
    this.toastService.show('info', `Você tem ${this.notificacoesPendentes()} notificações pendentes`);
  }
}
