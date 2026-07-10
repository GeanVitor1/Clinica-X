import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SignalRService } from '../services/signalr.service';
import { ToastContainerComponent } from '../../shared/components/toast.component';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/dashboard" class="logo">
            <span class="logo-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="var(--clx-accent)"/>
                <path d="M7 14L9 12l5 5 5-5 2 2-7 7-7-7z" fill="var(--clx-text-inverse)"/>
              </svg>
            </span>
            <span class="logo-text">ClinicaX</span>
          </a>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
            <svg class="nav-icon" width="20" height="20"><use href="#ic-dashboard"/></svg>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/pacientes" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20"><use href="#ic-users"/></svg>
            <span class="nav-label">Pacientes</span>
          </a>
          <a routerLink="/agenda" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20"><use href="#ic-calendar"/></svg>
            <span class="nav-label">Agenda</span>
          </a>
          <a routerLink="/servicos" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20"><use href="#ic-briefcase"/></svg>
            <span class="nav-label">Servi&ccedil;os</span>
          </a>
          <a routerLink="/relatorios" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20"><use href="#ic-chart"/></svg>
            <span class="nav-label">Relat&oacute;rios</span>
          </a>
          <a routerLink="/config" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20"><use href="#ic-settings"/></svg>
            <span class="nav-label">Configura&ccedil;&otilde;es</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar">{{ auth.userEmail()?.charAt(0)?.toUpperCase() }}</div>
            <div class="user-meta">
              <span class="user-email">{{ auth.userEmail() }}</span>
              @if (signalR.connected()) {
                <span class="live-dot">online</span>
              }
            </div>
          </div>
          <div class="sidebar-actions">
            @if (canInstall()) {
              <button class="btn-install" type="button" (click)="installApp()">
                <svg width="16" height="16"><use href="#ic-download"/></svg>
                <span>Instalar</span>
              </button>
            }
            <button class="btn-logout" type="button" (click)="logout()">
              <svg width="16" height="16"><use href="#ic-logout"/></svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet />
      </main>
      <app-toast-container />
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }

    .sidebar {
      width: 260px;
      background: var(--clx-bg);
      border-right: 1px solid var(--clx-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
    }

    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--clx-border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .logo-mark {
      flex-shrink: 0;
      display: flex;
    }

    .logo-text {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--clx-text);
      letter-spacing: -0.02em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: var(--clx-radius-md);
      color: var(--clx-text-muted);
      text-decoration: none;
      font-size: 0.84rem;
      font-weight: 500;
      transition: all var(--clx-transition-fast);
      position: relative;
    }

    .nav-item:hover {
      background: var(--clx-bg-alt);
      color: var(--clx-text);
    }

    .nav-item.active {
      background: var(--clx-accent-muted);
      color: var(--clx-accent);
      font-weight: 600;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--clx-accent);
    }

    .nav-icon {
      flex-shrink: 0;
      opacity: 0.65;
      transition: opacity var(--clx-transition-fast);
    }

    .nav-item:hover .nav-icon,
    .nav-item.active .nav-icon { opacity: 1; }

    .sidebar-footer {
      padding: 14px 16px;
      border-top: 1px solid var(--clx-border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: var(--clx-bg-alt);
      border-radius: var(--clx-radius-md);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--clx-radius-sm);
      background: linear-gradient(135deg, var(--clx-accent), var(--clx-purple));
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .user-email {
      font-size: 0.74rem;
      color: var(--clx-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .live-dot {
      font-size: 0.66rem;
      color: var(--clx-success);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .live-dot::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--clx-success);
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }

    .sidebar-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .btn-install, .btn-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      border-radius: var(--clx-radius-sm);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--clx-transition-fast);
    }

    .btn-install {
      background: var(--clx-accent);
      color: #fff;
    }

    .btn-install:hover {
      background: var(--clx-accent-hover);
      box-shadow: var(--clx-shadow-glow);
    }

    .btn-logout {
      background: transparent;
      border: 1px solid var(--clx-border);
      color: var(--clx-text-muted);
    }

    .btn-logout:hover {
      background: var(--clx-error-muted);
      border-color: rgba(239, 68, 68, 0.25);
      color: var(--clx-error);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      min-height: 100vh;
      background: var(--clx-bg-alt);
      padding: 36px 36px 48px;
    }

    @media (max-width: 768px) {
      .sidebar { width: 68px; }
      .logo-text, .nav-label, .user-email, .live-dot, .btn-install span, .btn-logout span { display: none; }
      .sidebar-header { padding: 14px; display: flex; justify-content: center; }
      .nav-item { justify-content: center; padding: 10px; }
      .nav-item.active::before { display: none; }
      .user-card { justify-content: center; padding: 8px; }
      .sidebar-actions { align-items: center; }
      .btn-install, .btn-logout { padding: 8px; border-radius: var(--clx-radius-sm); }
      .main-content { margin-left: 68px; padding: 20px 16px 32px; }
    }
  `],
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  protected readonly signalR = inject(SignalRService);
  protected readonly canInstall = signal(false);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    this.deferredPrompt = e as BeforeInstallPromptEvent;
    this.canInstall.set(true);
  }

  ngOnInit(): void {
    void this.signalR.start();
  }

  ngOnDestroy(): void {
    void this.signalR.stop();
  }

  async installApp(): Promise<void> {
    if (!this.deferredPrompt) return;
    await this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
  }

  async logout(): Promise<void> {
    await this.signalR.stop();
    this.auth.logout();
  }
}
