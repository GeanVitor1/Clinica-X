import { Component, signal, afterNextRender } from '@angular/core';

interface Message {
  text: string;
  sent: boolean;
  time: string;
  delay: number;
  visible?: boolean;
}

@Component({
  selector: 'app-demo-whatsapp',
  standalone: true,
  template: `
    <div class="demo-whats">
      <div class="wa-header">
        <div class="wa-header-left">
          <div class="wa-avatar">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" fill="#25D366"/>
              <path fill="#fff" d="M22.4 18.9c-.25-.12-1.48-.73-1.7-.81-.23-.09-.4-.12-.56.12-.17.25-.64.81-.79 1-.14.17-.29.19-.54.07-1.48-.74-2.45-1.33-3.43-3.01-.18-.31.18-.29.63-1.18.07-.14.04-.27-.02-.38-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.53c-.18 0-.47.07-.72.34-.24.27-.94.92-.94 2.24s.96 2.6 1.1 2.78c.13.17 1.88 2.87 4.56 4.02 1.7.68 2.36.73 3.21.62.49-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.28z"/>
              <path fill="#fff" d="M16 6.2a9.8 9.8 0 0 0-8.4 14.8l-.9 3.3 3.4-.9A9.8 9.8 0 1 0 16 6.2zm0 17.7c-1.55 0-3-.42-4.25-1.15l-.3-.18-2.95.77.79-2.88-.2-.3A8.05 8.05 0 0 1 7.95 16 8.05 8.05 0 0 1 16 7.95 8.05 8.05 0 0 1 24.05 16 8.05 8.05 0 0 1 16 23.9z"/>
            </svg>
          </div>
          <div class="wa-header-info">
            <strong>Assistente ClinicaX</strong>
            <small>online · WhatsApp Business</small>
          </div>
        </div>
        <div class="wa-header-actions">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>
      </div>

      <div class="wa-chat" #chat>
        @for (msg of messages(); track $index) {
          <div class="wa-msg" [class.sent]="msg.sent" [class.visible]="msg.visible">
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
  `,
  styles: [`
    .demo-whats {
      border-radius: 14px;
      overflow: hidden;
      background: #efeae2;
      display: flex;
      flex-direction: column;
      max-height: 340px;
      font-size: 0.8rem;
    }
    .wa-header {
      background: linear-gradient(135deg, #075e54, #0b7a6c);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
    }
    .wa-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .wa-avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.12);
    }
    .wa-header-info strong { display: block; font-size: 0.85rem; }
    .wa-header-info small { font-size: 0.65rem; opacity: 0.7; }
    .wa-header-actions { opacity: 0.7; cursor: pointer; }

    .wa-chat {
      flex: 1;
      padding: 12px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(210, 220, 200, 0.3) 0%, transparent 70%),
        radial-gradient(ellipse at 80% 50%, rgba(200, 210, 190, 0.2) 0%, transparent 60%),
        #efeae2;
    }
    .wa-msg {
      display: flex;
      opacity: 0;
      margin-bottom: 2px;
      position: relative;
    }
    .wa-msg.sent { justify-content: flex-end; }
    .wa-msg.visible { opacity: 1; }

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
      font-size: 0.8rem;
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
      font-size: 0.6rem;
      color: #667781;
      margin-top: 2px;
      float: right;
    }
    .wa-check { color: #53bdeb; }

    .wa-typing {
      display: flex;
      align-items: center;
      padding: 8px 14px;
    }
    .wa-typing-dots {
      background: #fff;
      border-radius: 18px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #8696a0;
      animation: waBounce 1.4s infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes waBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); background: #14b8a6; }
    }

    .wa-footer {
      padding: 8px 12px;
      background: #f0f2f5;
    }
    .wa-input-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px;
      background: #fff;
      border-radius: 24px;
    }
    .wa-input-bar svg:first-child { color: #8696a0; flex-shrink: 0; }
    .wa-input-placeholder {
      flex: 1;
      color: #8696a0;
      font-size: 0.8rem;
    }
    .wa-input-bar svg:last-child { flex-shrink: 0; }
  `],
})
export class DemoWhatsappComponent {
  readonly messages = signal<Message[]>([]);
  readonly isTyping = signal(false);

  private readonly chatMessages: Message[] = [
    { text: '🕐 Lembrete: Consulta com Dra. Ana amanhã às 09:00. Confirme presença!', sent: true, time: '08:00', delay: 0.5 },
    { text: '✅ Confirmo minha presença!', sent: false, time: '08:05', delay: 2.5 },
    { text: '👍 Perfeito! Enviaremos lembrete 1h antes.', sent: true, time: '08:05', delay: 4 },
    { text: '🔔 Lembrete: Sua consulta é em 1 hora. Rua das Flores, 123.', sent: true, time: '10:00', delay: 5.5 },
    { text: '🚀 Nova funcionalidade! Agora você pode cancelar pelo WhatsApp.', sent: true, time: '14:30', delay: 7.5 },
    { text: 'Qual o horário disponível para a próxima semana?', sent: false, time: '15:00', delay: 9.5 },
    { text: '📅 Segunda às 14h, Terça às 10h e 15h. Qual prefere?', sent: true, time: '15:01', delay: 11.5 },
  ];

  constructor() {
    afterNextRender(() => this.startChat());
  }

  private startChat() {
    let i = 0;
    const showNext = () => {
      if (i >= this.chatMessages.length) { this.isTyping.set(false); return; }
      const msg = this.chatMessages[i];
      this.isTyping.set(msg.sent);

      setTimeout(() => {
        this.isTyping.set(false);
        this.messages.update(m => [...m, { ...msg, visible: true }]);
        i++;
        const el = document.querySelector('.wa-chat');
        if (el) setTimeout(() => el.scrollTop = el.scrollHeight, 50);
        showNext();
      }, msg.delay * 1000);
    };
    showNext();
  }
}
