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
  styleUrl: './dashboard-layout.component.scss',
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/dashboard" class="logo">
            <span class="logo-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="8" fill="var(--clx-accent)" />
                <path d="M7 14L9 12l5 5 5-5 2 2-7 7-7-7z" fill="var(--clx-text-inverse)" />
              </svg>
            </span>
            <span class="logo-text">ClinicaX</span>
          </a>
        </div>
        <nav class="sidebar-nav" aria-label="Navegação principal">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <svg class="nav-icon" width="20" height="20" aria-hidden="true">
              <use href="#ic-dashboard" />
            </svg>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/pacientes" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" aria-hidden="true">
              <use href="#ic-users" />
            </svg>
            <span class="nav-label">Pacientes</span>
          </a>
          <a routerLink="/agenda" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" aria-hidden="true">
              <use href="#ic-calendar" />
            </svg>
            <span class="nav-label">Agenda</span>
          </a>
          <a routerLink="/servicos" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" aria-hidden="true">
              <use href="#ic-briefcase" />
            </svg>
            <span class="nav-label">Servi&ccedil;os</span>
          </a>
          <a routerLink="/relatorios" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" aria-hidden="true">
              <use href="#ic-chart" />
            </svg>
            <span class="nav-label">Relat&oacute;rios</span>
          </a>
          <a routerLink="/config" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" aria-hidden="true">
              <use href="#ic-settings" />
            </svg>
            <span class="nav-label">Configura&ccedil;&otilde;es</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar" aria-hidden="true">
              {{ auth.userEmail()?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="user-meta">
              <span class="user-email">{{ auth.userEmail() }}</span>
              @if (signalR.connected()) {
                <span class="live-dot">online</span>
              }
            </div>
          </div>
          <div class="sidebar-actions">
            @if (canInstall()) {
              <button
                class="btn-install"
                type="button"
                (click)="installApp()"
                aria-label="Instalar aplicativo"
              >
                <svg width="16" height="16" aria-hidden="true"><use href="#ic-download" /></svg>
                <span>Instalar</span>
              </button>
            }
            <button class="btn-logout" type="button" (click)="logout()" aria-label="Sair">
              <svg width="16" height="16" aria-hidden="true"><use href="#ic-logout" /></svg>
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
