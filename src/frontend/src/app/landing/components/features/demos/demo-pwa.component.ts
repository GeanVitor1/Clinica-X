import { Component, signal, afterNextRender } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-demo-pwa',
  standalone: true,
  template: `
    <div class="demo-pwa">
      <div class="device-scene">
        <div class="device-wrapper">
          <div class="device-power-btn"></div>
          <div class="device-silent-btn"></div>
          <div class="device-vol-up"></div>
          <div class="device-vol-down"></div>

          <div class="device-body">
            <div class="device-frame">
              <div class="device-screen">
                <!-- Dynamic Island -->
                <div class="dynamic-island">
                  <div class="di-camera">
                    <div class="di-lens"></div>
                  </div>
                </div>

                <div class="screen-status">
                  <span class="st-time">9:41</span>
                  <div class="st-icons">
                    <svg width="15" height="11" viewBox="0 0 18 14" fill="currentColor" opacity="0.55"><rect x="0" y="8" width="3" height="6" rx="0.5"/><rect x="5" y="4" width="3" height="10" rx="0.5"/><rect x="10" y="1" width="3" height="13" rx="0.5"/><rect x="15" y="0" width="3" height="14" rx="0.5"/></svg>
                    <svg width="14" height="11" viewBox="0 0 16 12" fill="currentColor" opacity="0.55"><path d="M8 2.4c1.7 0 3.2.7 4.3 1.8l1.2-1.2A7.7 7.7 0 0 0 8 .8 7.7 7.7 0 0 0 2.5 3l1.2 1.2A6 6 0 0 1 8 2.4zm0 3.2c.9 0 1.7.4 2.3 1l1.2-1.2A4.6 4.6 0 0 0 8 4 4.6 4.6 0 0 0 4.5 5.4l1.2 1.2A3.2 3.2 0 0 1 8 5.6zM8 11a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 8 11z"/></svg>
                    <svg width="24" height="11" viewBox="0 0 28 14" fill="none"><rect x="0.5" y="1" width="22" height="12" rx="3" stroke="currentColor" stroke-width="1" opacity="0.55"/><rect x="2.5" y="3" width="15" height="8" rx="1.5" fill="currentColor" opacity="0.7"/><path d="M24 5v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4"/></svg>
                  </div>
                </div>

                <div class="app-area">
                  <div class="app-topbar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    <div class="app-logo">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
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
                      <div class="sch-tag sch-tag--green">OK</div>
                    </div>
                    <div class="sch-row sch-row--active">
                      <div class="sch-dot sch-dot--blue"></div>
                      <div class="sch-time">11:30</div>
                      <div class="sch-name">João Santos</div>
                      <div class="sch-tag sch-tag--blue">Agora</div>
                      <div class="sch-pulse"></div>
                    </div>
                    <div class="sch-row">
                      <div class="sch-dot sch-dot--amber"></div>
                      <div class="sch-time">14:00</div>
                      <div class="sch-name">Ana Costa</div>
                      <div class="sch-tag sch-tag--amber">Pend.</div>
                    </div>
                    <div class="sch-row">
                      <div class="sch-dot sch-dot--gray"></div>
                      <div class="sch-time">16:30</div>
                      <div class="sch-name">Carlos Lima</div>
                      <div class="sch-tag sch-tag--gray">Fila</div>
                    </div>
                  </div>

                  <div class="app-actions">
                    <button class="aa-btn" type="button">Nova consulta</button>
                    <button class="aa-btn aa-btn--outline" type="button">Pacientes</button>
                  </div>

                  <div class="app-nav">
                    <button class="an-item active" type="button" aria-label="Home">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </button>
                    <button class="an-item" type="button" aria-label="Agenda">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    </button>
                    <button class="an-item" type="button" aria-label="Pacientes">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </button>
                    <button class="an-item" type="button" aria-label="Config">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>

                <div class="screen-homebar"></div>
              </div>
            </div>
            <div class="device-reflection" aria-hidden="true"></div>
          </div>
        </div>

        <div class="notif-pop" [class.notif-pop--hidden]="!showToast()" aria-hidden="true">
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
      </div>

      <!-- Always in flow (hidden visually) so install doesn't shrink the card -->
      <div class="install-card" [class.install-card--hidden]="!showInstallBanner()">
        <div class="ic-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="ic-text">
          <strong>Instalar ClinicaX</strong>
          <small>Adicione à tela inicial</small>
        </div>
        <button class="ic-btn" type="button" (click)="installApp()">Instalar</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .demo-pwa {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 4px 0;
      position: relative;
    }

    .device-scene {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .device-wrapper {
      position: relative;
      transform: rotateY(-2deg) rotateX(1deg);
      transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
      filter: drop-shadow(0 28px 48px rgba(0, 0, 0, 0.28)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.18));
    }
    .device-wrapper:hover {
      transform: rotateY(0deg) rotateX(0deg) scale(1.01);
    }

    /* Side buttons — realistic aluminum */
    .device-power-btn {
      position: absolute;
      right: -2.5px;
      top: 148px;
      width: 3px;
      height: 58px;
      background: linear-gradient(180deg, #6a6a70, #9a9aa0 30%, #7a7a80 70%, #5a5a60);
      border-radius: 0 2px 2px 0;
      z-index: 3;
    }
    .device-silent-btn {
      position: absolute;
      left: -2.5px;
      top: 108px;
      width: 3px;
      height: 22px;
      background: linear-gradient(180deg, #6a6a70, #9a9aa0, #5a5a60);
      border-radius: 2px 0 0 2px;
      z-index: 3;
    }
    .device-vol-up, .device-vol-down {
      position: absolute;
      left: -2.5px;
      width: 3px;
      height: 36px;
      background: linear-gradient(180deg, #6a6a70, #9a9aa0 40%, #5a5a60);
      border-radius: 2px 0 0 2px;
      z-index: 3;
    }
    .device-vol-up { top: 148px; }
    .device-vol-down { top: 194px; }

    /* Phone body — natural size (no reserved empty space below) */
    .device-body {
      position: relative;
      width: 220px;
      background: linear-gradient(160deg, #3e3e44 0%, #2c2c32 25%, #1a1a1e 55%, #2a2a30 85%, #404048 100%);
      border-radius: 38px;
      padding: 8px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        inset 0 -1px 0 rgba(0, 0, 0, 0.35);
    }

    .device-frame {
      position: relative;
      border-radius: 32px;
      overflow: hidden;
      background: #000;
    }

    .device-screen {
      position: relative;
      background: linear-gradient(180deg, #f4f2f8 0%, #f7f5f2 50%, #faf9f7 100%);
      border-radius: 32px;
      overflow: hidden;
      aspect-ratio: 9 / 17.2;
      height: auto;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    }

    .device-reflection {
      position: absolute;
      top: 12px;
      left: 18px;
      right: 48%;
      height: 42%;
      background: linear-gradient(165deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 40%, transparent 70%);
      border-radius: 32px 20px 60% 32px;
      pointer-events: none;
      z-index: 5;
    }

    /* Dynamic Island */
    .dynamic-island {
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 26px;
      background: #0a0a0c;
      border-radius: 20px;
      z-index: 12;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.35);
    }
    .di-camera {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #1e3a5f, #0a0c14 70%);
      box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.6);
    }
    .di-lens {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 30%, #4a7aba, #0a1220);
      margin: 3.5px auto 0;
    }

    .screen-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px 4px;
      position: relative;
      z-index: 5;
    }
    .st-time {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.2px;
      font-variant-numeric: tabular-nums;
    }
    .st-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #0f172a;
    }

    .app-area {
      padding: 2px 14px 0;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: calc(100% - 70px);
    }
    .app-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 2px 10px;
    }
    .app-logo {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #3b6ef5, #5b6ef0);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(59, 110, 245, 0.3);
    }

    .app-hello {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .ah-line1 {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .ah-line2 {
      font-size: 0.68rem;
      color: #64748b;
    }
    .ah-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b6ef5, #6d5af0);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.62rem;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(59, 110, 245, 0.25);
    }

    .app-schedule {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e8e4de;
      padding: 6px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }
    .sch-row {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 8px;
      border-radius: 10px;
      position: relative;
    }
    .sch-row--active {
      background: linear-gradient(135deg, rgba(59, 110, 245, 0.07), rgba(59, 110, 245, 0.02));
      border: 1px solid rgba(59, 110, 245, 0.12);
    }
    .sch-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .sch-dot--green { background: #22c55e; }
    .sch-dot--blue { background: #3b6ef5; }
    .sch-dot--amber { background: #eab308; }
    .sch-dot--gray { background: #cbd5e1; }
    .sch-time {
      font-size: 0.66rem;
      font-weight: 700;
      color: #94a3b8;
      min-width: 36px;
      font-variant-numeric: tabular-nums;
    }
    .sch-name {
      flex: 1;
      font-size: 0.72rem;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sch-tag {
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 0.52rem;
      font-weight: 700;
      letter-spacing: 0.15px;
      flex-shrink: 0;
    }
    .sch-tag--green { background: #f0fdf4; color: #16a34a; }
    .sch-tag--blue { background: #eff4ff; color: #3b6ef5; }
    .sch-tag--amber { background: #fefce8; color: #ca8a04; }
    .sch-tag--gray { background: #f1f5f9; color: #64748b; }
    .sch-pulse {
      position: absolute;
      right: -4px;
      top: 50%;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #3b6ef5;
      transform: translateY(-50%);
      animation: schPulse 2s ease-in-out infinite;
    }
    @keyframes schPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(59, 110, 245, 0.4); }
      50% { box-shadow: 0 0 0 7px rgba(59, 110, 245, 0); }
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
      padding: 9px 6px;
      border-radius: 10px;
      border: none;
      background: #3b6ef5;
      color: #fff;
      font-size: 0.66rem;
      font-weight: 600;
      cursor: default;
      font-family: inherit;
    }
    .aa-btn--outline {
      background: transparent;
      border: 1px solid #e2e8f0;
      color: #475569;
    }

    .app-nav {
      display: flex;
      margin-top: auto;
      padding: 8px 0 2px;
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
    }
    .an-item.active { color: #3b6ef5; }

    .screen-homebar {
      width: 108px;
      height: 4px;
      background: rgba(15, 23, 42, 0.14);
      border-radius: 4px;
      margin: 6px auto 10px;
    }

    .install-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: var(--clx-bg, #fff);
      border-radius: 14px;
      box-shadow: var(--clx-shadow-card);
      border: 1px solid var(--clx-border, #e8e4de);
      width: min(100%, 280px);
      transition: opacity 220ms ease;
    }
    .install-card--hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .ic-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(59, 110, 245, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b6ef5;
      flex-shrink: 0;
    }
    .ic-text { flex: 1; min-width: 0; }
    .ic-text strong { display: block; font-size: 0.8rem; color: var(--clx-text, #0f172a); }
    .ic-text small { font-size: 0.65rem; color: var(--clx-text-muted, #64748b); }
    .ic-btn {
      padding: 8px 14px;
      border-radius: 10px;
      background: #3b6ef5;
      color: #fff;
      border: none;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: transform 200ms ease, box-shadow 200ms ease;
      flex-shrink: 0;
    }
    .ic-btn:hover {
      box-shadow: 0 4px 14px rgba(59, 110, 245, 0.3);
      transform: translateY(-1px);
    }

    .notif-pop {
      position: absolute;
      top: 20px;
      left: calc(50% + 112px);
      z-index: 20;
      animation: popIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      transition: opacity 200ms ease;
    }
    .notif-pop--hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      animation: none;
    }
    .notif-pop-inner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: var(--clx-bg, #fff);
      border-radius: 14px;
      box-shadow: var(--clx-shadow-lg);
      border: 1px solid var(--clx-border, rgba(0,0,0,0.06));
      min-width: 168px;
    }
    .np-bell {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(59, 110, 245, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b6ef5;
      flex-shrink: 0;
    }
    .notif-pop-inner strong { display: block; font-size: 0.72rem; color: var(--clx-text, #0f172a); }
    .notif-pop-inner small { font-size: 0.62rem; color: var(--clx-text-muted, #64748b); }
    @keyframes popIn {
      from { opacity: 0; transform: translateX(12px) scale(0.94); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    @media (max-width: 900px) {
      .device-wrapper { transform: none; }
      .notif-pop {
        position: relative;
        left: auto;
        top: auto;
        margin-top: 10px;
      }
      .device-scene {
        flex-direction: column;
      }
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
        gsap.fromTo(
          phone,
          { y: 28, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' }
        );
      }
      const card = document.querySelector('.demo-pwa .install-card');
      if (card) {
        gsap.fromTo(
          card,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.35, ease: 'power2.out' }
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
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55, x: 0.5 },
          colors: ['#3b6ef5', '#6d5af0', '#0d9488', '#8babff'],
        });
        this.confettiLoaded = true;
      }
    } catch {}
  }
}
