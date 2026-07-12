import { Component, signal, afterNextRender } from '@angular/core';

interface Message {
  text: string;
  sent: boolean;
  time: string;
  delay: number;
}

type Scene = 'dashboard' | 'whatsapp';

@Component({
  selector: 'app-demo-whatsapp',
  standalone: true,
  template: `
    <div class="demo-container">

      @if (scene() === 'dashboard') {
        <div class="dashboard-scene">
          <div class="dd-card">
            <div class="dd-accent"></div>
            <div class="dd-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b7a6c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M8 14h.01"/>
                <path d="M12 14h.01"/>
                <path d="M16 14h.01"/>
                <path d="M8 18h.01"/>
                <path d="M12 18h.01"/>
                <path d="M16 18h.01"/>
              </svg>
            </div>
            <h3 class="dd-title">Nova Consulta</h3>
            <div class="dd-divider"></div>
            <div class="dd-row"><span class="dd-label">Paciente</span><span class="dd-value">Luciene</span></div>
            <div class="dd-row"><span class="dd-label">Data</span><span class="dd-value">15/07 às 14:00</span></div>
            <div class="dd-row"><span class="dd-label">Procedimento</span><span class="dd-value">Consulta geral</span></div>
            <div class="dd-divider"></div>
            <div class="dd-btn-row">
              <div class="dd-btn-wrap">
                <button class="dd-btn" [class.clicked]="cursorPhase() === 'clicking'">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Enviar Consulta
                </button>
                <div class="dd-cursor" [class.phase-move]="cursorPhase() === 'moving'" [class.phase-click]="cursorPhase() === 'clicking'" [class.phase-leave]="cursorPhase() === 'leaving'">
                  <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                    <defs>
                      <filter id="cursorShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-opacity="0.35"/>
                      </filter>
                    </defs>
                    <path d="M2 2L2 19L6.5 14.5L9.5 21L12 20L9 13.5L16 13.5L2 2Z" fill="#222" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" filter="url(#cursorShadow)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (scene() === 'whatsapp') {
        <div class="wa-container">
          <div class="wa-header">
            <div class="wa-header-left">
              <svg class="wa-back" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <div class="wa-avatar wa-avatar-sm">
                <span class="wa-initials">L</span>
              </div>
              <div class="wa-header-info">
                <strong>Luciene</strong>
                <small>online</small>
              </div>
            </div>
            <div class="wa-header-actions">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </div>
          </div>

          <div class="wa-chat">
            @for (msg of messages(); track $index) {
              <div class="wa-msg" [class.sent]="msg.sent">
                <div class="wa-tail" [class.tail-sent]="msg.sent" [class.tail-received]="!msg.sent"></div>
                <div class="wa-bubble" [class.bubble-sent]="msg.sent" [class.bubble-received]="!msg.sent">
                  <span class="wa-text">{{ msg.text }}</span>
                  <span class="wa-time">{{ msg.time }}
                    @if (msg.sent) {
                      <svg class="wa-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    }
                  </span>
                </div>
              </div>
            }

            @if (isTyping()) {
              <div class="wa-typing">
                <div class="wa-typing-dots">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            }
          </div>

          <div class="wa-footer">
            <div class="wa-input-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="wa-input-placeholder">Digite uma mensagem...</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .demo-container {
      border-radius: 14px;
      overflow: hidden;
      font-size: 0.8rem;
      position: relative;
      background: #f0f2f5;
      /* Altura maior para o mock do WhatsApp caber com conforto */
      min-height: 480px;
      height: 480px;
    }

    /* ===== DASHBOARD SCENE ===== */
    .dashboard-scene {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f2f5;
      animation: dashIn 0.12s ease-out;
      padding: 0;
      height: 100%;
    }
    @keyframes dashIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .dd-card {
      background: #fff;
      border-radius: 0;
      padding: 0 0 20px;
      text-align: center;
      box-shadow: none;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dd-accent {
      height: 4px;
      background: linear-gradient(90deg, #0b7a6c, #14b8a6);
    }
    .dd-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(11, 122, 108, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px auto 10px;
    }
    .dd-title {
      margin: 0 0 10px;
      font-size: 0.95rem;
      color: #1a1a1a;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .dd-divider {
      height: 1px;
      background: #eef0f2;
      margin: 0 32px 6px;
    }
    .dd-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 32px;
      font-size: 0.78rem;
    }
    .dd-label { color: #8696a0; font-weight: 400; }
    .dd-value { color: #1a1a1a; font-weight: 600; }

    .dd-btn-row {
      margin-top: 10px;
      display: flex;
      justify-content: center;
    }
    .dd-btn-wrap {
      position: relative;
      display: inline-block;
    }
    .dd-btn {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 11px 28px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.12s, box-shadow 0.12s;
      box-shadow: 0 3px 10px rgba(37, 99, 235, 0.3);
      letter-spacing: 0.01em;
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    .dd-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(37, 99, 235, 0.35);
    }
    .dd-btn svg { flex-shrink: 0; }
    .dd-btn.clicked {
      animation: btnClick 0.2s ease;
    }
    @keyframes btnClick {
      0% { transform: scale(1); }
      40% { transform: scale(0.92); }
      70% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }

    /* Cursor */
    .dd-cursor {
      position: absolute;
      right: -22px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      z-index: 10;
      pointer-events: none;
    }
    .dd-cursor.phase-move {
      animation: cursorMove 0.3s ease-in-out forwards;
    }
    .dd-cursor.phase-click {
      animation: cursorClick 0.16s ease-in-out forwards;
    }
    .dd-cursor.phase-leave {
      animation: cursorLeave 0.14s ease-in forwards;
    }
    @keyframes cursorMove {
      0% { right: -22px; opacity: 0; }
      15% { opacity: 1; }
      85% { right: 6px; opacity: 1; }
      100% { right: 6px; opacity: 1; }
    }
    @keyframes cursorClick {
      0% { right: 6px; transform: translateY(-50%) scale(1); opacity: 1; }
      35% { right: 6px; transform: translateY(-50%) scale(0.65); opacity: 1; }
      60% { right: 6px; transform: translateY(-50%) scale(0.65); opacity: 1; }
      100% { right: 6px; transform: translateY(-50%) scale(1); opacity: 1; }
    }
    @keyframes cursorLeave {
      0% { right: 6px; opacity: 1; }
      100% { right: -40px; opacity: 0; }
    }

    /* ===== WHATSAPP SCENE ===== */
    .wa-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #efeae2;
      animation: waIn 0.12s ease-out;
    }
    @keyframes waIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .wa-header {
      background: linear-gradient(135deg, #075e54, #0b7a6c);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      flex-shrink: 0;
    }
    .wa-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .wa-back { opacity: 0.8; }
    .wa-avatar-sm {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wa-initials {
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
    }
    .wa-header-info strong { display: block; font-size: 0.82rem; }
    .wa-header-info small { font-size: 0.62rem; opacity: 0.7; }
    .wa-header-actions { opacity: 0.7; cursor: pointer; }

    .wa-chat {
      flex: 1;
      padding: 10px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 4px;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(210, 220, 200, 0.3) 0%, transparent 70%),
        radial-gradient(ellipse at 80% 50%, rgba(200, 210, 190, 0.2) 0%, transparent 60%),
        #efeae2;
    }
    .wa-msg {
      display: flex;
      margin-bottom: 2px;
      position: relative;
      animation: msgIn 0.1s ease-out;
    }
    .wa-msg.sent {
      justify-content: flex-end;
      animation: msgInRight 0.1s ease-out;
    }
    @keyframes msgIn {
      from { transform: translateX(-16px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes msgInRight {
      from { transform: translateX(16px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .wa-tail {
      position: absolute;
      bottom: 0;
      width: 8px; height: 8px;
    }
    .wa-tail.tail-sent { right: -4px; }
    .wa-tail.tail-received { left: -4px; }

    .wa-bubble {
      max-width: 80%;
      padding: 7px 12px;
      font-size: 0.78rem;
      line-height: 1.45;
      position: relative;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .wa-bubble.bubble-received {
      background: #fff;
      color: #111;
      border-radius: 8px 8px 8px 2px;
    }
    .wa-bubble.bubble-sent {
      background: linear-gradient(135deg, #d9fdd3, #c8f5c2);
      color: #111;
      border-radius: 8px 8px 2px 8px;
    }
    .wa-text { display: block; }
    .wa-time {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.58rem;
      color: #667781;
      margin-top: 2px;
      float: right;
    }
    .wa-check { color: #53bdeb; }

    .wa-typing {
      display: flex;
      align-items: center;
      padding: 6px 14px;
      animation: typingIn 0.12s ease-out;
    }
    @keyframes typingIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .wa-typing-dots {
      background: #fff;
      border-radius: 18px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #8696a0;
      animation: waBounce 0.9s infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes waBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); background: #14b8a6; }
    }

    .wa-footer {
      padding: 0;
      background: transparent;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
    .wa-input-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px 5px;
      background: #fff;
      border-radius: 0;
      box-shadow: 0 -1px 3px rgba(0,0,0,0.04);
    }
    .wa-input-bar svg { width: 14px; height: 14px; }
    .wa-input-bar svg:first-child { color: #8696a0; flex-shrink: 0; }
    .wa-input-placeholder {
      flex: 1;
      color: #8696a0;
      font-size: 0.68rem;
    }
    .wa-input-bar svg:last-child { flex-shrink: 0; width: 16px; height: 16px; }
  `],
})
export class DemoWhatsappComponent {
  readonly scene = signal<Scene>('dashboard');
  readonly cursorPhase = signal<'hidden' | 'moving' | 'clicking' | 'leaving'>('hidden');
  readonly messages = signal<Message[]>([]);
  readonly isTyping = signal(false);

  private readonly chatMessages: Message[] = [
    { text: '🕐 Olá Luciene! Consulta agendada para 15/07 às 14:00. Confirma?', sent: true, time: '14:00', delay: 0.18 },
    { text: 'Sim, confirmo! Obrigada 😊', sent: false, time: '14:01', delay: 0.45 },
    { text: '✅ Horário confirmado! Avisaremos 1h antes.', sent: true, time: '14:01', delay: 0.7 },
  ];

  constructor() {
    afterNextRender(() => this.startLoop());
  }

  private startLoop() {
    this.scene.set('dashboard');
    this.messages.set([]);
    this.isTyping.set(false);
    this.cursorPhase.set('hidden');

    setTimeout(() => this.cursorPhase.set('moving'), 120);
    setTimeout(() => this.cursorPhase.set('clicking'), 420);
    setTimeout(() => this.cursorPhase.set('leaving'), 580);
    setTimeout(() => {
      this.scene.set('whatsapp');
      this.showMessages();
    }, 720);
  }

  private showMessages() {
    let i = 0;
    const next = () => {
      if (i >= this.chatMessages.length) {
        this.isTyping.set(false);
        setTimeout(() => this.startLoop(), 900);
        return;
      }
      const msg = this.chatMessages[i];
      this.isTyping.set(true);
      setTimeout(() => {
        this.isTyping.set(false);
        this.messages.update(m => [...m, { ...msg }]);
        i++;
        const el = document.querySelector('.wa-chat');
        if (el) el.scrollTop = el.scrollHeight;
        next();
      }, msg.delay * 1000);
    };
    setTimeout(next, 120);
  }
}
