import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingAnimationService } from '../../services/landing-animation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()" [class.menu-open]="menuOpen()">
      <div class="nav-inner">
        <a routerLink="/" class="logo">ClinicaX</a>
        <div class="nav-right">
          <div class="nav-links" [class.open]="menuOpen()">
            <a href="#funcionalidades" (click)="closeMenu()">Funcionalidades</a>
            <a href="#planos" (click)="closeMenu()">Planos</a>
            <a routerLink="/auth/login" (click)="closeMenu()">Demo</a>
          </div>
          <button class="theme-toggle" (click)="toggleTheme()" [class.rotating]="rotating()"
            aria-label="Alternar modo escuro">
            {{ isDark() ? '☀️' : '🌙' }}
          </button>
          <button class="hamburger" (click)="toggleMenu()" aria-label="Abrir menu" [class.active]="menuOpen()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      @if (menuOpen()) {
        <div class="menu-overlay" (click)="closeMenu()"></div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 18px 0;
      transition: background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s;
      background: transparent;
    }
    .navbar.scrolled {
      background: var(--clx-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 1px 0 var(--clx-border);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--clx-accent);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 32px;
    }
    .nav-links a {
      color: var(--clx-text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover {
      color: var(--clx-accent);
    }
    .theme-toggle {
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: transform 0.3s;
    }
    .theme-toggle.rotating {
      animation: spin 0.3s ease;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      z-index: 1100;
    }
    .hamburger span {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--clx-text);
      border-radius: 2px;
      transition: transform 0.3s, opacity 0.3s;
    }
    .hamburger.active span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.active span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
    .menu-overlay {
      display: none;
    }
    @media (max-width: 768px) {
      .hamburger {
        display: flex;
      }
      .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        width: 260px;
        height: 100vh;
        flex-direction: column;
        gap: 8px;
        padding: 80px 24px 24px;
        background: var(--clx-bg);
        box-shadow: -4px 0 24px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 1050;
      }
      .nav-links.open {
        right: 0;
      }
      .nav-links a {
        font-size: 1.1rem;
        padding: 12px 0;
        border-bottom: 1px solid var(--clx-border);
      }
      .menu-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 1040;
      }
    }
  `],
})
export class NavbarComponent {
  private animation = inject(LandingAnimationService);
  scrolled = signal(false);
  isDark = signal(true);
  rotating = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 50);
  }

  toggleTheme() {
    this.rotating.set(true);
    this.animation.toggleDark();
    this.isDark.update(v => !v);
    setTimeout(() => this.rotating.set(false), 300);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
