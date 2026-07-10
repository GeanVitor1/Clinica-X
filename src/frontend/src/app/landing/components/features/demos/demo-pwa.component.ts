import { Component, signal, afterNextRender } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-demo-pwa',
  standalone: true,
  template: `
    <div class="demo-pwa">
      <div class="device-wrapper">
        <!-- botão power lateral -->
        <div class="device-power-btn"></div>
        <div class="device-vol-up"></div>
        <div class="device-vol-down"></div>

        <div class="device-body">
          <div class="device-bezel"></div>

          <div class="device-screen">
            <!-- notch -->
            <div class="device-notch">
              <div class="notch-sensor"></div>
              <div class="notch-camera">
                <div class="notch-lens"></div>
              </div>
            </div>

            <!-- status -->
            <div class="screen-status">
              <span class="st-time">9:41</span>
              <div class="st-icons">
                <svg width="14" height="10" viewBox="0 0 18 14" fill="currentColor" opacity="0.5"><rect x="0" y="8" width="3" height="6" rx="0.5"/><rect x="5" y="4" width="3" height="10" rx="0.5"/><rect x="10" y="1" width="3" height="13" rx="0.5"/><rect x="15" y="0" width="3" height="14" rx="0.5"/></svg>
                <svg width="12" height="10" viewBox="0 0 18 14" fill="currentColor" opacity="0.5"><path d="M9 10.5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5z"/></svg>
                <svg width="22" height="10" viewBox="0 0 28 14" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"><rect x="0.5" y="0.5" width="20" height="13" rx="2.5"/><rect x="2.5" y="2.5" width="16" height="9" rx="1.5" fill="currentColor" opacity="0.5"/></svg>
              </div>
            </div>

            <!-- app -->
            <div class="app-area">
              <div class="app-topbar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a5a7a" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                <div class="app-logo">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a5a7a" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </div>

              <div class="app-hello">
                <div>
                  <span class="ah-line1">Bom dia, Dra. 👋</span>
                  <span class="ah-line2">3 consultas hoje</span>
                </div>
                <div class="ah-avatar">AB</div>
              </div>

              <div class="app-schedule">
                <div class="sch-row">
                  <div class="sch-dot sch-dot--green"></div>
                  <div class="sch-time">09:00</div>
                  <div class="sch-name">Maria Silva</div>
                  <div class="sch-tag sch-tag--green">Confirmado</div>
                </div>
                <div class="sch-row sch-row--active">
                  <div class="sch-dot sch-dot--gold"></div>
                  <div class="sch-time">11:30</div>
                  <div class="sch-name">João Santos</div>
                  <div class="sch-tag sch-tag--gold">Em andamento</div>
                  <div class="sch-pulse"></div>
                </div>
                <div class="sch-row">
                  <div class="sch-dot sch-dot--amber"></div>
                  <div class="sch-time">14:00</div>
                  <div class="sch-name">Ana Costa</div>
                  <div class="sch-tag sch-tag--amber">Pendente</div>
                </div>
                <div class="sch-row">
                  <div class="sch-dot sch-dot--gray"></div>
                  <div class="sch-time">16:30</div>
                  <div class="sch-name">Carlos Lima</div>
                  <div class="sch-tag sch-tag--gray">Aguardando</div>
                </div>
              </div>

              <div class="app-actions">
                <button class="aa-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  Nova consulta
                </button>
                <button class="aa-btn aa-btn--outline">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Pacientes
                </button>
              </div>

              <div class="app-nav">
                <button class="an-item active">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </button>
                <button class="an-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                </button>
                <button class="an-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </button>
                <button class="an-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="screen-homebar"></div>
          </div>
        </div>
      </div>

      @if (showInstallBanner()) {
        <div class="install-card">
          <div class="ic-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div class="ic-text">
            <strong>Instalar ClinicaX</strong>
            <small>Adicione à tela inicial</small>
          </div>
          <button class="ic-btn" (click)="installApp()">Instalar</button>
        </div>
      }

      @if (showToast()) {
        <div class="notif-pop">
          <div class="notif-pop-inner">
            <div class="np-bell">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8 4a2 2 0 0 1-4 0"/></svg>
            </div>
            <div>
              <strong>Lembrete</strong>
              <small>Maria Silva • 09:00</small>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .demo-pwa {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      position: relative;
      perspective: 1000px;
    }

    .device-wrapper {
      position: relative;
      transform: rotateY(-1.5deg) rotateX(0.5deg);
      transition: transform 0.5s ease;
    }
    .device-wrapper:hover {
      transform: rotateY(0deg) rotateX(0deg);
    }

    /* botoes laterais */
    .device-power-btn {
      position: absolute;
      right: -3px;
      top: 130px;
      width: 3px;
      height: 56px;
      background: linear-gradient(180deg, #5a5a5e, #8a8a8e, #6a6a6e, #5a5a5e);
      border-radius: 0 2px 2px 0;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.15),
        0 1px 3px rgba(0,0,0,0.4);
      z-index: 2;
    }
    .device-vol-up, .device-vol-down {
      position: absolute;
      left: -3px;
      width: 3px;
      height: 32px;
      background: linear-gradient(180deg, #5a5a5e, #8a8a8e, #6a6a6e, #5a5a5e);
      border-radius: 2px 0 0 2px;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.15),
        0 1px 3px rgba(0,0,0,0.4);
      z-index: 2;
    }
    .device-vol-up { top: 110px; }
    .device-vol-down { top: 148px; }

    .device-body {
      position: relative;
      width: 206px;
      background: linear-gradient(145deg, #3a3a3e 0%, #2a2a2e 20%, #1e1e22 50%, #2a2a2e 80%, #3a3a3e 100%);
      border-radius: 44px;
      padding: 10px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.08),
        inset 0 1px 0 rgba(255,255,255,0.12),
        inset 0 -1px 0 rgba(0,0,0,0.3),
        0 40px 100px rgba(0,0,0,0.4),
        0 15px 40px rgba(0,0,0,0.25),
        0 5px 15px rgba(0,0,0,0.15);
    }
    .device-body::after {
      content: '';
      position: absolute;
      top: 10px;
      left: 20px;
      right: 60%;
      height: 40%;
      background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
      border-radius: 34px 34px 100px 34px;
      pointer-events: none;
      z-index: 3;
    }
    .device-bezel {
      position: absolute;
      inset: 10px;
      border-radius: 34px;
      background: transparent;
      pointer-events: none;
      z-index: 1;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
    }

    .device-screen {
      position: relative;
      background: linear-gradient(180deg, #f0edf5 0%, #f5f2f0 50%, #faf8f5 100%);
      border-radius: 34px;
      overflow: hidden;
      min-height: 420px;
      z-index: 2;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.08);
    }

    /* notch - Dynamic Island style */
    .device-notch {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 82px;
      height: 22px;
      background: #0a0a0c;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 10;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.06),
        0 0 4px rgba(0,0,0,0.3);
    }
    .notch-sensor {
      width: 28px;
      height: 3px;
      background: linear-gradient(90deg, #1a1a2e, #2a2a3e, #1a1a2e);
      border-radius: 4px;
      opacity: 0.4;
    }
    .notch-camera {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #1a2a4a, #080812);
      box-shadow: inset 0 0 2px rgba(0,0,0,0.5);
    }
    .notch-lens {
      width: 2.5px;
      height: 2.5px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, #4a7aba, #0a1220);
      margin: 2.5px auto 0;
    }

    /* status bar */
    .screen-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 22px 6px;
      position: relative;
      z-index: 5;
    }
    .st-time {
      font-size: 0.72rem;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: 0.3px;
    }
    .st-icons {
      display: flex;
      align-items: center;
      gap: 3px;
      color: #1a1a2e;
    }

    /* app area */
    .app-area {
      padding: 0 14px 0;
      display: flex;
      flex-direction: column;
      min-height: 340px;
    }
    .app-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 4px 8px;
    }
    .app-logo {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: linear-gradient(135deg, #c9954a, #d4a055);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(201, 149, 74, 0.3);
    }

    .app-hello {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .ah-line1 {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #1a1a2e;
    }
    .ah-line2 {
      font-size: 0.65rem;
      color: #8a8a9a;
    }
    .ah-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9954a, #d4a055);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(201, 149, 74, 0.25);
    }

    .app-schedule {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e8e4de;
      padding: 8px;
    }
    .sch-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 10px;
      position: relative;
    }
    .sch-row--active {
      background: linear-gradient(135deg, rgba(201, 149, 74, 0.06), rgba(201, 149, 74, 0.02));
      border: 1px solid rgba(201, 149, 74, 0.12);
    }
    .sch-row--active .sch-name { color: #1a1a2e; }
    .sch-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .sch-dot--green { background: #22c55e; }
    .sch-dot--gold { background: #c9954a; }
    .sch-dot--amber { background: #eab308; }
    .sch-dot--gray { background: #cbd5e1; }
    .sch-time {
      font-size: 0.65rem;
      font-weight: 700;
      color: #8a8a9a;
      min-width: 34px;
      font-variant-numeric: tabular-nums;
    }
    .sch-name {
      flex: 1;
      font-size: 0.7rem;
      font-weight: 600;
      color: #4a4a5a;
    }
    .sch-tag {
      padding: 2px 8px;
      border-radius: 5px;
      font-size: 0.52rem;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .sch-tag--green { background: #f0fdf4; color: #16a34a; }
    .sch-tag--gold { background: #fef7ee; color: #c9954a; }
    .sch-tag--amber { background: #fefce8; color: #ca8a04; }
    .sch-tag--gray { background: #f1f5f9; color: #64748b; }
    .sch-pulse {
      position: absolute;
      right: -5px;
      top: 50%;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #c9954a;
      transform: translateY(-50%);
      animation: schPulse 2s ease-in-out infinite;
    }
    @keyframes schPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201, 149, 74, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(201, 149, 74, 0); }
    }

    .app-actions {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
    }
    .aa-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 8px;
      border-radius: 10px;
      border: none;
      background: #c9954a;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 600;
      cursor: default;
      transition: 0.15s;
    }
    .aa-btn--outline {
      background: transparent;
      border: 1px solid #e8e4de;
      color: #5a5a7a;
    }

    .app-nav {
      display: flex;
      margin: auto 0 0;
      padding: 6px 0 2px;
      border-top: 1px solid #e8e4de;
    }
    .an-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 0;
      background: none;
      border: none;
      cursor: default;
      color: #cbd5e1;
      transition: 0.15s;
    }
    .an-item.active { color: #c9954a; }

    .screen-homebar {
      width: 36px;
      height: 4px;
      background: rgba(0,0,0,0.12);
      border-radius: 4px;
      margin: 4px auto 6px;
    }

    /* install card */
    .install-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(26, 26, 46, 0.06);
      border: 1px solid #e8e4de;
      min-width: 280px;
    }
    .ic-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(201, 149, 74, 0.08), rgba(201, 149, 74, 0.03));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c9954a;
    }
    .ic-text { flex: 1; }
    .ic-text strong { display: block; font-size: 0.8rem; color: #1a1a2e; }
    .ic-text small { font-size: 0.65rem; color: #8a8a9a; }
    .ic-btn {
      padding: 7px 18px;
      border-radius: 50px;
      background: linear-gradient(135deg, #c9954a, #d4a055);
      color: #fff;
      border: none;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: 0.2s;
    }
    .ic-btn:hover {
      box-shadow: 0 3px 12px rgba(201, 149, 74, 0.3);
    }

    /* notification */
    .notif-pop {
      position: absolute;
      top: 0;
      left: calc(100% + 12px);
      z-index: 20;
      animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .notif-pop-inner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 8px 30px rgba(26, 26, 46, 0.1), 0 0 0 1px rgba(0,0,0,0.02);
      min-width: 180px;
    }
    .np-bell {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(201, 149, 74, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c9954a;
    }
    .notif-pop-inner strong { display: block; font-size: 0.72rem; color: #1a1a2e; }
    .notif-pop-inner small { font-size: 0.62rem; color: #8a8a9a; }
    @keyframes popIn {
      from { opacity: 0; transform: translateX(16px) scale(0.92); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    @media (max-width: 800px) {
      .device-wrapper { transform: none; }
      .device-body { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
      .notif-pop { position: relative; left: auto; top: auto; }
    }
  `],
})
export class DemoPwaComponent {
  readonly showInstallBanner = signal(true);
  readonly showToast = signal(false);

  private confettiLoaded = false;

  constructor() {
    afterNextRender(() => {
      setTimeout(() => this.showToast.set(true), 1500);

      const phone = document.querySelector('.demo-pwa .device-wrapper');
      if (phone) {
        gsap.fromTo(phone,
          { y: 30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
        );
      }
      const card = document.querySelector('.demo-pwa .install-card');
      if (card) {
        gsap.fromTo(card,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: 'power2.out' }
        );
      }
    });
  }

  async installApp() {
    this.showInstallBanner.set(false);
    this.showToast.set(false);

    try {
      if (!this.confettiLoaded) {
        const confetti = await import('canvas-confetti');
        confetti.default({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55, x: 0.5 },
          colors: ['#c9954a', '#d4a055', '#e8c88a', '#fff5e6'],
        });
        this.confettiLoaded = true;
      }
    } catch {}
  }
}
