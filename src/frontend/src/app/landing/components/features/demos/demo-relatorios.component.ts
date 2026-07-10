import { Component, ElementRef, viewChild, afterNextRender } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-demo-relatorios',
  standalone: true,
  template: `
    <div class="demo-relatorios">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(201, 149, 74, 0.1); color: #c9954a;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span class="stat-label">Faturamento</span>
          <span class="stat-value" #fatValue>R$ 0</span>
          <span class="stat-change up">↑ 12,5%</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="23 11 17 11 20 8 14 8 14 14 17 14 14 17 23 17"/></svg>
          </div>
          <span class="stat-label">Consultas</span>
          <span class="stat-value" #conValue>0</span>
          <span class="stat-change up">↑ 8,3%</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span class="stat-label">Ocupação</span>
          <span class="stat-value" #ocpValue>0%</span>
          <span class="stat-change down">↓ 2,1%</span>
        </div>
      </div>

      <div class="chart-box">
        <div class="chart-header">
          <div>
            <strong>Consultas por mês</strong>
            <span>Evolução dos últimos 6 meses</span>
          </div>
          <select class="chart-select">
            <option>Últimos 6 meses</option>
          </select>
        </div>
        <div class="bar-chart" #barChart>
          @for (bar of monthlyData; track bar.label) {
            <div class="bar-col">
              <div class="bar-label">{{ bar.label }}</div>
              <div class="bar-track">
                <div class="bar-fill"
                     [style.height]="bar.percent + '%'"
                     [style.background]="bar.color"
                     #barFill>
                  <div class="bar-glow"></div>
                </div>
              </div>
              <div class="bar-val">{{ bar.value }}</div>
            </div>
          }
        </div>
      </div>

      <div class="rel-actions">
        <button class="rel-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Exportar PDF
        </button>
        <button class="rel-btn rel-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Relatório completo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .demo-relatorios { font-size: 0.82rem; }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      transition: 0.2s;
    }
    .stat-card:hover {
      border-color: var(--clx-accent);
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
    }
    .stat-icon {
      width: 32px; height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .stat-label { font-size: 0.7rem; color: var(--clx-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 1.25rem; font-weight: 750; color: var(--clx-text); font-variant-numeric: tabular-nums; }
    .stat-change { font-size: 0.7rem; font-weight: 600; }
    .stat-change.up { color: #10b981; }
    .stat-change.down { color: #ef4444; }

    .chart-box {
      background: var(--clx-bg);
      border: 1px solid var(--clx-border);
      border-radius: 14px;
      padding: 20px;
      transition: 0.2s;
    }
    .chart-box:hover { border-color: var(--clx-accent); }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .chart-header strong {
      display: block;
      font-size: 0.85rem;
      color: var(--clx-text);
    }
    .chart-header span {
      font-size: 0.7rem;
      color: var(--clx-text-muted);
    }
    .chart-select {
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid var(--clx-border);
      background: var(--clx-bg-alt);
      font-size: 0.72rem;
      color: var(--clx-text);
      cursor: pointer;
    }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      height: 130px;
    }
    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    .bar-label {
      font-size: 0.65rem;
      color: var(--clx-text-muted);
      font-weight: 500;
      margin-bottom: 6px;
    }
    .bar-track {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      background: var(--clx-bg-alt);
      border-radius: 6px 6px 0 0;
      position: relative;
      overflow: hidden;
    }
    .bar-fill {
      width: 100%;
      border-radius: 6px 6px 0 0;
      position: relative;
      transition: height 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      min-height: 4px;
    }
    .bar-glow {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent);
      border-radius: 6px 6px 0 0;
    }
    .bar-val {
      font-size: 0.68rem;
      font-weight: 650;
      color: var(--clx-text-muted);
      margin-top: 6px;
      font-variant-numeric: tabular-nums;
    }

    .rel-actions {
      display: flex;
      gap: 8px;
      margin-top: 14px;
    }
    .rel-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px;
      border-radius: 10px;
      border: 1px solid var(--clx-border);
      background: var(--clx-bg);
      font-size: 0.74rem;
      font-weight: 500;
      color: var(--clx-text);
      cursor: pointer;
      transition: all 0.2s;
    }
    .rel-btn:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
    }
    .rel-btn-primary {
      background: #c9954a;
      border-color: #c9954a;
      color: #fff;
    }
    .rel-btn-primary:hover {
      background: #b8853a;
      border-color: #b8853a;
      color: #fff;
      box-shadow: 0 4px 16px rgba(201, 149, 74, 0.3);
    }
  `],
})
export class DemoRelatoriosComponent {
  readonly fatValue = viewChild<ElementRef>('fatValue');
  readonly conValue = viewChild<ElementRef>('conValue');
  readonly ocpValue = viewChild<ElementRef>('ocpValue');
  readonly barChart = viewChild<ElementRef>('barChart');

  readonly monthlyData = [
    { label: 'Fev', value: 48, percent: 60, color: '#c9954a' },
    { label: 'Mar', value: 62, percent: 78, color: '#c9954a' },
    { label: 'Abr', value: 55, percent: 69, color: '#c9954a' },
    { label: 'Mai', value: 71, percent: 89, color: '#d4a055' },
    { label: 'Jun', value: 68, percent: 85, color: '#d4a055' },
    { label: 'Jul', value: 83, percent: 100, color: '#c9954a' },
  ];

  constructor() {
    afterNextRender(() => {
      const statCards = document.querySelectorAll('.demo-relatorios .stat-card');
      if (statCards.length) {
        gsap.fromTo(statCards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
        );
      }
      const chartBox = document.querySelector('.demo-relatorios .chart-box');
      if (chartBox) {
        gsap.fromTo(chartBox,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
        );
      }
      this.animate();
    });
  }

  private animate() {
    const fatEl = this.fatValue()?.nativeElement;
    const conEl = this.conValue()?.nativeElement;
    const ocpEl = this.ocpValue()?.nativeElement;

    if (fatEl) gsap.to(fatEl, {
      textContent: 84750, duration: 2.2, ease: 'power2.out', snap: { textContent: 1 },
      modifiers: { textContent: (v: string) => 'R$ ' + parseInt(v).toLocaleString('pt-BR') },
    });
    if (conEl) gsap.to(conEl, {
      textContent: 387, duration: 2.2, ease: 'power2.out', snap: { textContent: 1 },
    });
    if (ocpEl) gsap.to(ocpEl, {
      textContent: 78, duration: 2.2, ease: 'power2.out', snap: { textContent: 1 },
      modifiers: { textContent: (v: string) => v + '%' },
    });

    const bars = this.barChart()?.nativeElement?.querySelectorAll('.bar-fill');
    if (bars) {
      gsap.fromTo(bars, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: 1, stagger: 0.08, ease: 'back.out(1.7)' });
    }
  }
}
