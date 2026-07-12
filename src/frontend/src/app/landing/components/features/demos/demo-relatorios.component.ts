import { Component, viewChild, ElementRef, signal, AfterViewInit } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-demo-relatorios',
  standalone: true,
  template: `
    <div class="demo-relatorios" #root>
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
          @for (bar of monthlyData; track bar.label; let i = $index) {
            <div class="bar-col">
              <div class="bar-label">{{ bar.label }}</div>
              <div class="bar-track">
                <div class="bar-fill"
                     [style.background]="bar.color"
                     [style.--h]="bar.percent"
                     [style.--d]="i * 0.12 + 's'"
                     [class.grown]="barsGrown()">
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
    :host { display: block; width: 100%; }
    .demo-relatorios {
      font-size: 0.82rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
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
      padding: 18px;
      transition: 0.2s;
    }
    .chart-box:hover { border-color: var(--clx-accent); }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
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
      height: 0%;
      border-radius: 6px 6px 0 0;
      position: relative;
      transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition-delay: var(--d, 0s);
    }
    .bar-fill.grown {
      height: calc(var(--h) * 1%);
    }
    .bar-fill::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.15), transparent 60%);
      border-radius: inherit;
      opacity: 0;
    }
    .bar-fill.grown::after {
      animation: barShine 1.5s ease-out 0.6s forwards;
    }
    @keyframes barShine {
      0% { opacity: 0; }
      30% { opacity: 1; }
      100% { opacity: 0.5; }
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
export class DemoRelatoriosComponent implements AfterViewInit {
  readonly root = viewChild<ElementRef>('root');
  readonly fatValue = viewChild<ElementRef>('fatValue');
  readonly conValue = viewChild<ElementRef>('conValue');
  readonly ocpValue = viewChild<ElementRef>('ocpValue');
  readonly barChart = viewChild<ElementRef>('barChart');
  readonly barsGrown = signal(false);

  readonly monthlyData = [
    { label: 'Fev', value: 48, percent: 60, color: '#c9954a' },
    { label: 'Mar', value: 62, percent: 78, color: '#c9954a' },
    { label: 'Abr', value: 55, percent: 69, color: '#c9954a' },
    { label: 'Mai', value: 71, percent: 89, color: '#d4a055' },
    { label: 'Jun', value: 68, percent: 85, color: '#d4a055' },
    { label: 'Jul', value: 83, percent: 100, color: '#c9954a' },
  ];

  private started = false;

  ngAfterViewInit() {
    const el = this.root()?.nativeElement;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !this.started) {
        this.started = true;
        obs.disconnect();
        this.loop();
      }
    }, { threshold: 0.25 });
    obs.observe(el);
  }

  private loop() {
    // Reset to initial state
    this.barsGrown.set(false);
    gsap.killTweensOf('.demo-relatorios .stat-card');
    gsap.killTweensOf('.demo-relatorios .chart-box');
    gsap.killTweensOf(this.fatValue()?.nativeElement);
    gsap.killTweensOf(this.conValue()?.nativeElement);
    gsap.killTweensOf(this.ocpValue()?.nativeElement);

    // Reset DOM to initial
    gsap.set('.demo-relatorios .stat-card', { y: 24, opacity: 0, clearProps: 'all' });
    gsap.set('.demo-relatorios .chart-box', { y: 24, opacity: 0, clearProps: 'all' });
    if (this.fatValue()?.nativeElement) this.fatValue()!.nativeElement.textContent = 'R$ 0';
    if (this.conValue()?.nativeElement) this.conValue()!.nativeElement.textContent = '0';
    if (this.ocpValue()?.nativeElement) this.ocpValue()!.nativeElement.textContent = '0%';

    setTimeout(() => {
      // Animate entrance
      gsap.fromTo('.demo-relatorios .stat-card',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
      gsap.fromTo('.demo-relatorios .chart-box',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, delay: 0.25, ease: 'power2.out' }
      );

      // Animate numbers
      gsap.to(this.fatValue()?.nativeElement, {
        textContent: 84750, duration: 2.2, ease: 'power2.out', snap: { textContent: 1 },
        modifiers: { textContent: (v: string) => { const n = parseInt(v) || 0; return 'R$ ' + n.toLocaleString('pt-BR'); } },
      });
      gsap.to(this.conValue()?.nativeElement, {
        textContent: 387, duration: 2.2, ease: 'power2.out', snap: { textContent: 1 },
      });
      gsap.to(this.ocpValue()?.nativeElement, {
        textContent: 78, duration: 2.2, ease: 'power2.out', snap: { textContent: 1 },
        modifiers: { textContent: (v: string) => (parseInt(v) || 0) + '%' },
      });

      // Grow bars
      setTimeout(() => this.barsGrown.set(true), 500);
    }, 100);

    // Loop after total cycle time (~4.5s of animation + 3s pause)
    setTimeout(() => this.loop(), 7500);
  }
}
