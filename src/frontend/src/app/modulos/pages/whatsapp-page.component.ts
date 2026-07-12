import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulosApiService } from '../services/modulos-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-whatsapp-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }

    /* ── Header ── */
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 1.5rem; font-weight: 750; color: var(--clx-text-primary);
      letter-spacing: -0.02em; margin: 0 0 4px 0; line-height: 1.2;
    }
    .header-subtitle {
      font-size: 0.82rem; color: var(--clx-text-tertiary); font-weight: 500;
    }
    .header-actions { display: flex; gap: 8px; }

    .btn-export {
      padding: 9px 16px;
      background: var(--clx-surface-1);
      color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 550;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      line-height: 1;
    }
    .btn-export:hover {
      border-color: var(--clx-accent);
      color: var(--clx-accent);
      background: var(--clx-accent-muted);
      box-shadow: var(--clx-shadow-sm);
      transform: translateY(-1px);
    }

    /* ── Panel ── */
    .panel {
      background: var(--clx-card-bg, var(--clx-surface-1));
      border: 1px solid var(--clx-border);
      border-radius: var(--clx-radius-2xl, 16px);
      padding: 0;
      margin-bottom: 24px;
      box-shadow: var(--clx-shadow-card, 0 2px 12px rgba(0,0,0,0.03));
      overflow: hidden;
    }

    /* ── Chat Layout ── */
    .chat-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      min-height: 520px;
    }

    /* ── Sidebar ── */
    .sidebar {
      border-right: 1px solid var(--clx-border);
      display: flex;
      flex-direction: column;
    }
    .sidebar-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--clx-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-header h3 {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--clx-text-primary);
    }
    .sidebar-count {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--clx-text-tertiary);
      background: var(--clx-surface-3);
      padding: 2px 8px;
      border-radius: 999px;
    }

    .conv-list {
      flex: 1;
      overflow-y: auto;
    }
    .conv-item {
      padding: 14px 20px;
      border-bottom: 1px solid var(--clx-border);
      cursor: pointer;
      transition: background 0.12s;
    }
    .conv-item:last-child { border-bottom: none; }
    .conv-item:hover { background: var(--clx-surface-2); }
    .conv-item.active {
      background: color-mix(in srgb, var(--clx-accent) 8%, transparent);
      border-left: 3px solid var(--clx-accent);
    }
    .conv-name {
      display: block;
      font-size: 0.88rem;
      font-weight: 650;
      color: var(--clx-text-primary);
      margin-bottom: 3px;
    }
    .conv-phone {
      font-size: 0.76rem;
      color: var(--clx-text-tertiary);
    }
    .conv-time {
      font-size: 0.68rem;
      color: var(--clx-text-muted);
      margin-top: 4px;
    }
    .conv-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.65rem;
      font-weight: 700;
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
      margin-top: 6px;
    }

    /* ── Chat Area ── */
    .chat-area {
      display: flex;
      flex-direction: column;
    }
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--clx-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .chat-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--clx-accent), color-mix(in srgb, var(--clx-accent) 60%, #004d40));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.82rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .chat-header-info { flex: 1; min-width: 0; }
    .chat-header-name {
      font-size: 0.92rem;
      font-weight: 650;
      color: var(--clx-text-primary);
    }
    .chat-header-sub {
      font-size: 0.72rem;
      color: var(--clx-text-tertiary);
    }

    .msgs {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--clx-surface-2);
    }
    .msg {
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.86rem;
      line-height: 1.45;
    }
    .msg.out {
      align-self: flex-end;
      background: linear-gradient(135deg, var(--clx-accent), color-mix(in srgb, var(--clx-accent) 75%, #004d40));
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .msg.in {
      align-self: flex-start;
      background: var(--clx-surface-1);
      border: 1px solid var(--clx-border);
      border-bottom-left-radius: 4px;
    }
    .msg-time {
      font-size: 0.65rem;
      opacity: 0.6;
      margin-top: 4px;
    }

    .composer {
      display: flex;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid var(--clx-border);
      background: var(--clx-surface-1);
    }
    .composer input {
      flex: 1;
      padding: 11px 16px;
      border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-md);
      background: var(--clx-surface-2);
      color: var(--clx-text-primary);
      font-size: 0.88rem;
      font-family: var(--clx-font);
      outline: none;
      transition: all var(--clx-transition-fast);
    }
    .composer input::placeholder { color: var(--clx-text-muted); }
    .composer input:focus {
      border-color: var(--clx-accent);
      box-shadow: 0 0 0 3px var(--clx-accent-muted);
    }
    .btn-send {
      padding: 10px 20px;
      background: var(--clx-accent);
      color: #fff;
      border: none;
      border-radius: var(--clx-radius-md);
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      font-family: var(--clx-font);
      transition: all var(--clx-transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .btn-send:hover { background: var(--clx-accent-hover); box-shadow: var(--clx-shadow-glow); }

    /* ── Empty states ── */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: var(--clx-text-muted);
    }
    .empty-state svg { opacity: 0.15; margin-bottom: 12px; }
    .empty-state p { margin: 0; font-size: 0.86rem; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      backdrop-filter: blur(6px); display: flex; align-items: center;
      justify-content: center; z-index: 2000; animation: fadeIn .15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      background: var(--clx-surface-1); border: 1px solid var(--clx-border-strong);
      border-radius: var(--clx-radius-lg); width: 92%; max-width: 420px;
      box-shadow: 0 4px 16px rgba(0,0,0,.08);
      animation: modalIn .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal-top {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 24px 26px 0;
    }
    .modal-top-left { display: flex; align-items: flex-start; gap: 13px; }
    .modal-deco {
      width: 40px; height: 40px; border-radius: 11px;
      background: linear-gradient(135deg, #25d366, #128c7e);
      color: #fff; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .modal-top-left h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--clx-text); }
    .modal-sub { margin: 3px 0 0; font-size: .78rem; color: var(--clx-text-muted); }
    .modal-x {
      width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--clx-border);
      background: var(--clx-bg); color: var(--clx-text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s; flex-shrink: 0;
    }
    .modal-x:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

    .form-body { display: flex; flex-direction: column; gap: 16px; padding: 20px 26px 24px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: .8rem; font-weight: 600; color: var(--clx-text-secondary); }
    .field input {
      padding: 10px 13px; border: 1px solid var(--clx-border-strong); border-radius: 10px;
      background: var(--clx-surface-2); color: var(--clx-text); font-size: .87rem;
      font-family: var(--clx-font); outline: none; transition: all .2s;
    }
    .field input:focus { border-color: var(--clx-accent); box-shadow: 0 0 0 3px var(--clx-accent-muted); }

    .form-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 16px 26px; border-top: 1px solid var(--clx-border);
    }
    .btn-cancel {
      padding: 10px 20px; background: transparent; color: var(--clx-text-secondary);
      border: 1px solid var(--clx-border-strong); border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 500; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-cancel:hover { border-color: var(--clx-text-tertiary); color: var(--clx-text-primary); }
    .btn-create {
      padding: 10px 20px; background: #25d366; color: #fff;
      border: none; border-radius: 10px;
      cursor: pointer; font-size: .85rem; font-weight: 600; font-family: var(--clx-font);
      transition: all .2s;
    }
    .btn-create:hover { background: #1da851; }
    .btn-create:disabled { opacity: .45; cursor: not-allowed; }

    @media (max-width: 768px) {
      .chat-layout { grid-template-columns: 1fr; }
      .sidebar { max-height: 260px; }
      .page-header { flex-direction: column; gap: 14px; }
    }
  `],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-left">
          <h1>WhatsApp</h1>
          <span class="header-subtitle">Conversas e envios automáticos</span>
        </div>
        <div class="header-actions">
          <button class="btn-export" type="button" (click)="showNovaConversa = true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova Conversa
          </button>
        </div>
      </header>

      <div class="panel">
        <div class="chat-layout">
          <div class="sidebar">
            <div class="sidebar-header">
              <h3>Conversas</h3>
              <span class="sidebar-count">{{ conversas().length }}</span>
            </div>
            <div class="conv-list">
              @for (c of conversas(); track c.id) {
                <div class="conv-item" [class.active]="selected()?.id === c.id" (click)="select(c)">
                  <span class="conv-name">{{ c.nomeContato }}</span>
                  <span class="conv-phone">{{ c.telefone }}</span>
                  <div class="conv-time">{{ c.ultimaMensagemEm | date:'dd/MM HH:mm' }}</div>
                  @if (c.naoLida) {
                    <span class="conv-badge">Nova mensagem</span>
                  }
                </div>
              } @empty {
                <div class="empty-state" style="padding: 32px 16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p>Nenhuma conversa</p>
                </div>
              }
            </div>
          </div>

          <div class="chat-area">
            @if (!selected()) {
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p>Selecione uma conversa para iniciar</p>
              </div>
            } @else {
              <div class="chat-header">
                <div class="chat-header-avatar">
                  {{ selected()?.nomeContato?.charAt(0) || '?' }}
                </div>
                <div class="chat-header-info">
                  <div class="chat-header-name">{{ selected()?.nomeContato }}</div>
                  <div class="chat-header-sub">{{ selected()?.telefone }}</div>
                </div>
              </div>
              <div class="msgs">
                @for (m of mensagens(); track m.id) {
                  <div class="msg" [class.out]="m.direcao === 'Saida'" [class.in]="m.direcao === 'Entrada'">
                    {{ m.conteudo }}
                    <div class="msg-time">{{ m.enviadaEm | date:'HH:mm' }}@if (m.automatica) { · auto }</div>
                  </div>
                } @empty {
                  <div class="empty-state" style="background: transparent;">
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                }
              </div>
              <div class="composer">
                <input [(ngModel)]="texto" placeholder="Digite a mensagem..." (keyup.enter)="enviar()" />
                <button class="btn-send" type="button" (click)="enviar()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Enviar
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    @if (showNovaConversa) {
      <div class="modal-overlay" (click)="fecharNovaConversa()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-top-left">
              <div class="modal-deco">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <div>
                <h2>Nova Conversa</h2>
                <p class="modal-sub">Inicie uma conversa no WhatsApp</p>
              </div>
            </div>
            <button class="modal-x" (click)="fecharNovaConversa()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form (ngSubmit)="criarConversa()">
            <div class="form-body">
              <div class="field">
                <label>Telefone do contato *</label>
                <input [(ngModel)]="novaTel" name="tel" required placeholder="(00) 00000-0000" maxlength="20" />
              </div>
              <div class="field">
                <label>Nome do contato *</label>
                <input [(ngModel)]="novaNome" name="nome" required placeholder="Nome completo" maxlength="200" />
              </div>
            </div>
            <div class="form-footer">
              <button type="button" class="btn-cancel" (click)="fecharNovaConversa()">Cancelar</button>
              <button type="submit" class="btn-create" [disabled]="!novaTel.trim() || !novaNome.trim()">Criar Conversa</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class WhatsappPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ModulosApiService);
  private readonly toast = inject(ToastService);

  conversas = signal<any[]>([]);
  selected = signal<any | null>(null);
  mensagens = signal<any[]>([]);
  texto = '';
  showNovaConversa = false;
  novaTel = '';
  novaNome = '';

  ngOnInit() {
    this.api.listConversas().subscribe({ next: (d) => this.conversas.set(d) });
  }

  select(c: any) {
    this.selected.set(c);
    this.api.listMensagens(c.id).subscribe({ next: (m) => this.mensagens.set(m) });
  }

  enviar() {
    const c = this.selected();
    if (!c || !this.texto.trim()) return;
    this.api.enviarMensagem(c.id, this.texto.trim()).subscribe({
      next: () => {
        this.texto = '';
        this.select(c);
        this.toast.show('success', 'Mensagem enviada');
      },
      error: () => this.toast.show('error', 'Falha ao enviar'),
    });
  }

  criarConversa() {
    if (!this.novaTel.trim() || !this.novaNome.trim()) return;
    this.api.createConversa({ telefone: this.novaTel.trim(), nomeContato: this.novaNome.trim() }).subscribe({
      next: () => {
        this.api.listConversas().subscribe({ next: (d) => this.conversas.set(d) });
        this.toast.show('success', 'Conversa criada');
        this.fecharNovaConversa();
      },
      error: () => this.toast.show('error', 'Falha ao criar conversa'),
    });
  }

  fecharNovaConversa() {
    this.showNovaConversa = false;
    this.novaTel = '';
    this.novaNome = '';
  }
}
