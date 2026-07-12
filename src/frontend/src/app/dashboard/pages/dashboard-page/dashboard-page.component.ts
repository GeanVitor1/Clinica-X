import { Component, signal, OnInit, OnDestroy, inject, ElementRef, ViewChild, NgZone, afterNextRender, Injector } from '@angular/core';
import { DatePipe } from '@angular/common';
import { gsap } from 'gsap';
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
        <button class="dash-bell" type="button" (click)="toggleNotifPanel()">
          <svg width="18" height="18"><use href="#ic-bell"/></svg>
          @if (notificacoesPendentes() > 0) {
            <span class="bell-dot">{{ notificacoesPendentes() }}</span>
          }
        </button>
        @if (notifPanelOpen()) {
          <div class="notif-panel">
            <div class="notif-panel-header">
              <h3>Notifica&ccedil;&otilde;es</h3>
              <span class="notif-count">{{ timeline().length }}</span>
            </div>
            <div class="notif-list">
              @for (ev of timeline(); track ev.id) {
                <div class="notif-item">
                  <div class="notif-icon notif-icon--{{ ev.tipo }}">
                    @switch (ev.tipo) {
                      @case ('AgendamentoCriado') { <span>&#128197;</span> }
                      @case ('AgendamentoCancelado') { <span>&#10007;</span> }
                      @case ('AgendamentoRemarcado') { <span>&#128260;</span> }
                      @case ('PacienteCriado') { <span>&#10003;</span> }
                      @case ('PacienteEditado') { <span>&#9998;</span> }
                      @case ('NotificacaoEnviada') { <span>&#128276;</span> }
                      @default { <span>&#128204;</span> }
                    }
                  </div>
                  <div class="notif-body">
                    <p class="notif-msg">{{ ev.descricao }}</p>
                    <span class="notif-time">{{ timeAgo(ev.criadoEm) }}</span>
                  </div>
                </div>
              }
              @if (timeline().length === 0) {
                <div class="notif-empty">Nenhuma notifica&ccedil;&atilde;o</div>
              }
            </div>
          </div>
        }
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
        <div class="dash-featured">
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
        </div>

        <div class="kpi-grid" #cardsGrid>
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
            <div class="panel-header panel-header--toggle" (click)="timelineExpanded.set(!timelineExpanded())">
              <h2>Atividades recentes</h2>
              <svg class="tl-chevron" [class.tl-chevron--open]="timelineExpanded()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            @if (timelineExpanded()) {
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
            }
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

    .dash-header { position: relative; }

    .notif-panel {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      width: 360px;
      max-height: 400px;
      background: var(--clx-card-bg);
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius);
      box-shadow: var(--clx-shadow-xl);
      z-index: 200;
      overflow: hidden;
    }

    .notif-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--clx-border);
    }

    .notif-panel-header h3 {
      font-size: 0.88rem;
      font-weight: 650;
      color: var(--clx-text);
    }

    .notif-count {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--clx-radius-full);
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
    }

    .notif-list {
      max-height: 340px;
      overflow-y: auto;
      padding: 6px 0;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 18px;
      transition: background var(--clx-transition-fast);
    }

    .notif-item:hover {
      background: color-mix(in srgb, var(--clx-accent) 5%, transparent);
    }

    .notif-item--unread {
      background: color-mix(in srgb, var(--clx-accent) 4%, transparent);
    }

    .notif-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--clx-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .notif-icon--AgendamentoCriado { background: var(--clx-success-muted); color: var(--clx-success); }
    .notif-icon--AgendamentoCancelado { background: var(--clx-error-muted); color: var(--clx-error); }
    .notif-icon--AgendamentoRemarcado { background: var(--clx-amber-muted); color: var(--clx-amber); }
    .notif-icon--PacienteCriado { background: var(--clx-success-muted); color: var(--clx-success); }
    .notif-icon--PacienteEditado { background: var(--clx-accent-muted); color: var(--clx-accent); }
    .notif-icon--NotificacaoEnviada { background: var(--clx-accent-muted); color: var(--clx-accent); }

    .notif-body { flex: 1; min-width: 0; }

    .notif-msg {
      font-size: 0.8rem;
      color: var(--clx-text);
      line-height: 1.4;
      margin: 0;
    }

    .notif-time {
      font-size: 0.68rem;
      color: var(--clx-text-muted);
    }

    .notif-empty {
      text-align: center;
      padding: 32px 16px;
      color: var(--clx-text-muted);
      font-size: 0.82rem;
    }

    .dash-featured { margin-bottom: 16px; }

    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
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
    .kpi-value--money { font-size: 1.5rem; }

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

    .dash-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }

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
    .panel-header--toggle { cursor: pointer; margin-bottom: 0; user-select: none; }
    .panel-header--toggle:hover { opacity: 0.8; }

    .tl-chevron { color: var(--clx-text-muted); transition: transform var(--clx-transition-base); flex-shrink: 0; }
    .tl-chevron--open { transform: rotate(180deg); }

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

    .chart-wrap { position: relative; height: 260px; }
    .apex-chart { width: 100%; }

    :host ::ng-deep .apexcharts-tooltip {
      background: #c5d4e8 !important;
      border: 1px solid rgba(20, 42, 85, 0.18) !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 16px rgba(28, 55, 110, 0.07) !important;
      color: #0a1424 !important;
    }
    :host ::ng-deep .apexcharts-tooltip-title {
      background: #b8c9e0 !important;
      border-bottom: 1px solid rgba(20, 42, 85, 0.18) !important;
      color: #0a1424 !important;
      font-weight: 600 !important;
    }
    :host ::ng-deep .apexcharts-legend-text {
      color: #2f4260 !important;
    }

    .tl { display: flex; flex-direction: column; position: relative; margin-top: 16px; }
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
      .kpi-value { font-size: 1.6rem; }
      .chart-wrap { height: auto; }
      .apex-chart { min-height: 150px; }
      .panel { padding: 16px; }
      .dash-header h1 { font-size: 1.2rem; }
    }
  `],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private zone = inject(NgZone);
  private injector = inject(Injector);

  @ViewChild('cardsGrid', { read: ElementRef }) cardsGridRef?: ElementRef;
  @ViewChild('apexChart', { read: ElementRef }) apexChartRef?: ElementRef;

  loading = signal(true);
  consultasHoje = signal(0);
  proximos7Dias = signal(0);
  faturamentoMes = signal(0);
  notificacoesPendentes = signal(0);
  consultasHojeLista = signal<AgendamentoDto[]>([]);
  timeline = signal<EventoDto[]>([]);
  ocupacaoSemana = signal<OcupacaoDto[]>([]);
  notifPanelOpen = signal(false);
  timelineExpanded = signal(false);

  private chartInstance: any = null;
  private destroyed = false;

  ngOnInit() {
    this.carregarDados();
  }

  ngOnDestroy() {
    this.destroyed = true;
    try {
      this.chartInstance?.destroy?.();
    } catch { /* ignore */ }
    this.chartInstance = null;
  }

  private carregarDados() {
    this.loading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        // Valores finais de imediato (evita KPI “zerado/invisível” por animação)
        this.consultasHoje.set(data.consultasHoje);
        this.proximos7Dias.set(data.proximos7Dias);
        this.faturamentoMes.set(data.faturamentoMes);
        this.notificacoesPendentes.set(data.notificacoesPendentes);
        this.consultasHojeLista.set(data.consultasHojeLista ?? []);
        this.ocupacaoSemana.set(data.ocupacaoSemana ?? []);
        this.loading.set(false);
        this.scheduleUiReady();
      },
      error: () => {
        this.consultasHoje.set(0);
        this.proximos7Dias.set(0);
        this.faturamentoMes.set(0);
        this.notificacoesPendentes.set(0);
        this.consultasHojeLista.set([]);
        this.ocupacaoSemana.set([]);
        this.loading.set(false);
        this.scheduleUiReady();
      },
    });
    this.dashboardService.getTimeline().subscribe({
      next: (data) => this.timeline.set(data ?? []),
      error: () => this.timeline.set([]),
    });
  }

  /** Roda após o DOM do @if (!loading) existir de verdade. */
  private scheduleUiReady() {
    afterNextRender(() => {
      if (this.destroyed) return;
      this.zone.runOutsideAngular(() => {
        this.animarCards();
        void this.iniciarApexChart();
      });
    }, { injector: this.injector });
  }

  private animarCards() {
    const cards = document.querySelectorAll<HTMLElement>('.dashboard .kpi, .dashboard .panel');
    if (!cards.length) return;

    // Limpa animações anteriores (navegação SPA)
    gsap.killTweensOf(cards);

    gsap.fromTo(
      cards,
      { opacity: 0.01, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        overwrite: true,
        onComplete: () => {
          // Nunca deixar cards “presos” em opacity 0
          gsap.set(cards, { clearProps: 'opacity,transform' });
        },
      }
    );

    // Rede de segurança
    setTimeout(() => {
      cards.forEach((el) => {
        if (getComputedStyle(el).opacity === '0') {
          gsap.set(el, { opacity: 1, y: 0, clearProps: 'opacity,transform' });
        }
      });
    }, 800);
  }

  private async iniciarApexChart() {
    // ViewChild só existe após loading=false + afterNextRender
    await new Promise((r) => setTimeout(r, 0));
    if (this.destroyed) return;

    let host = this.apexChartRef?.nativeElement as HTMLElement | undefined;
    if (!host) {
      host = document.querySelector('.dashboard .apex-chart') as HTMLElement | null ?? undefined;
    }
    if (!host || this.ocupacaoSemana().length === 0) return;

    try {
      this.chartInstance?.destroy?.();
    } catch { /* ignore */ }
    this.chartInstance = null;
    host.innerHTML = '';

    const ApexCharts = (await import('apexcharts')).default;
    const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    const categories = this.ocupacaoSemana().map(o => dias.includes(o.dia) ? o.dia.substring(0, 3) : o.dia.substring(0, 3));
    const totals = this.ocupacaoSemana().map(o => o.total);
    const realizados = this.ocupacaoSemana().map(o => o.realizados || 0);

    const maxVal = Math.max(...totals, 5);

    const options = {
      chart: {
        type: 'bar',
        height: 220,
        stacked: true,
        toolbar: { show: false },
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        background: 'transparent',
        animations: { enabled: true, speed: 400 },
      },
      series: [
        { name: 'Realizados', data: realizados },
        { name: 'Restantes', data: totals.map((t: number, i: number) => t - (realizados[i] || 0)) },
      ],
      xaxis: {
        categories,
        labels: { style: { colors: '#2f4260', fontSize: '0.75rem', fontWeight: '500' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false, max: maxVal },
      colors: ['#3b6ef5', '#8babff'],
      legend: { show: false },
      grid: { show: false },
      plotOptions: {
        bar: { borderRadius: 6, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last', horizontal: false, columnWidth: '50%' },
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: 'light',
        style: { fontSize: '0.8rem' },
        y: { formatter: (val: number) => `${val} consulta${val !== 1 ? 's' : ''}` },
      },
    };

    this.chartInstance = new ApexCharts(host, options);
    await this.chartInstance.render();
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

  toggleNotifPanel() {
    this.notifPanelOpen.update(v => !v);
  }
}
