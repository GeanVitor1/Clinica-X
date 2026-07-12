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
      <aside class="sidebar" [class.sidebar-open]="sidebarOpen()">
        <div class="sidebar-header">
          <a routerLink="/dashboard" class="logo" (click)="closeSidebar()">
            <span class="logo-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="8" fill="var(--clx-accent)" />
                <path d="M7 14L9 12l5 5 5-5 2 2-7 7-7-7z" fill="var(--clx-text-inverse)" />
              </svg>
            </span>
            <span class="logo-text">ClinicaX</span>
          </a>
          @if (auth.isDemo()) {
            <span class="demo-pill">DEMO</span>
          }
        </div>
        <nav class="sidebar-nav" aria-label="Navegação principal">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item" (click)="closeSidebar()">
            <span class="nav-label">Dashboard</span>
          </a>

          <div class="nav-section nav-section--toggle" (click)="toggleSection('clinica')">
            <span>Clínica</span>
            <svg class="section-chevron" [class.section-chevron--open]="sectionsExpanded()['clinica']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          @if (sectionsExpanded()['clinica']) {
            <a routerLink="/pacientes" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Pacientes</span></a>
            <a routerLink="/agenda" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Agenda inteligente</span></a>
            <a routerLink="/pacientes" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Prontuário (via pacientes)</span></a>
            <a routerLink="/modulos/anamneses" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Anamneses</span></a>
            <a routerLink="/modulos/contratos" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Termos e contratos</span></a>
            <a routerLink="/servicos" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Serviços</span></a>
          }

          <div class="nav-section nav-section--toggle" (click)="toggleSection('comunicacao')">
            <span>Comunicação</span>
            <svg class="section-chevron" [class.section-chevron--open]="sectionsExpanded()['comunicacao']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          @if (sectionsExpanded()['comunicacao']) {
            <a routerLink="/modulos/whatsapp" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Central WhatsApp</span></a>
            <a routerLink="/modulos/telemedicina" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Telemedicina</span></a>
            <a routerLink="/modulos/portal" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Painel do paciente</span></a>
          }

          <div class="nav-section nav-section--toggle" (click)="toggleSection('clinico')">
            <span>Clínico avançado</span>
            <svg class="section-chevron" [class.section-chevron--open]="sectionsExpanded()['clinico']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          @if (sectionsExpanded()['clinico']) {
            <a routerLink="/modulos/injetaveis" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Injetáveis</span></a>
            <a routerLink="/modulos/transcricoes" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Transcrições</span></a>
            <a routerLink="/modulos/avaliacao-facial" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Avaliação facial IA</span></a>
          }

          <div class="nav-section nav-section--toggle" (click)="toggleSection('gestao')">
            <span>Gestão</span>
            <svg class="section-chevron" [class.section-chevron--open]="sectionsExpanded()['gestao']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          @if (sectionsExpanded()['gestao']) {
            <a routerLink="/modulos/financeiro" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Financeiro</span></a>
            <a routerLink="/modulos/vendas" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Vendas</span></a>
            <a routerLink="/modulos/estoque" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Estoque</span></a>
            <a routerLink="/modulos/notas" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Notas fiscais</span></a>
            <a routerLink="/relatorios" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Relatórios</span></a>
          }

          <div class="nav-section nav-section--toggle" (click)="toggleSection('ia')">
            <span>IA</span>
            <svg class="section-chevron" [class.section-chevron--open]="sectionsExpanded()['ia']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          @if (sectionsExpanded()['ia']) {
            <a routerLink="/modulos/tarefas" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Tarefas com IA</span></a>
            <a routerLink="/modulos/ia-textos" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Agente de textos</span></a>
          }

          <div class="nav-section nav-section--toggle" (click)="toggleSection('sistema')">
            <span>Sistema</span>
            <svg class="section-chevron" [class.section-chevron--open]="sectionsExpanded()['sistema']" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          @if (sectionsExpanded()['sistema']) {
            <a routerLink="/config" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><span class="nav-label">Configurações</span></a>
          }
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
              <button class="btn-install" type="button" (click)="installApp()" aria-label="Instalar aplicativo">
                <span>Instalar</span>
              </button>
            }
            <button class="btn-logout" type="button" (click)="logout()" aria-label="Sair">
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
      <div class="sidebar-backdrop" [class.visible]="sidebarOpen()" (click)="closeSidebar()"></div>
      <main class="main-content">
        <button class="hamburger" type="button" (click)="toggleSidebar()" aria-label="Abrir menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
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
  protected readonly sidebarOpen = signal(false);
  protected readonly sectionsExpanded = signal<Record<string, boolean>>({
    clinica: false,
    comunicacao: false,
    clinico: false,
    gestao: false,
    ia: false,
    sistema: false,
  });
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleSection(key: string): void {
    this.sectionsExpanded.update(s => ({ ...s, [key]: !s[key] }));
  }

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
    try {
      await this.signalR.stop();
    } catch {
      /* ignore */
    }
    // clearSession + navega para landing (/); isAuthenticated reage via tokenSignal
    this.auth.logout();
  }
}
