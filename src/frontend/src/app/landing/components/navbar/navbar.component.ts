import { Component, HostListener, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingAnimationService } from '../../services/landing-animation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()" [class.menu-open]="menuOpen()">
      <div class="nav-inner">
        <a routerLink="/" class="logo" aria-label="ClinicaX">
          <span class="logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.14"/>
              <path d="M7.5 12l4.5-4.5L16.5 12 12 16.5 7.5 12z" fill="currentColor" opacity="0.35"/>
              <path d="M10 12l2-2 2 2-2 2-2-2z" fill="currentColor"/>
            </svg>
          </span>
          <span class="logo-text">ClinicaX</span>
        </a>

        <div class="nav-right">
          <div class="nav-links" [class.open]="menuOpen()">
            <a href="#funcionalidades" (click)="closeMenu()">Funcionalidades</a>
            <a href="#como-funciona" (click)="closeMenu()">Como funciona</a>
            <a href="#planos" (click)="closeMenu()">Planos</a>
            <a routerLink="/auth/login" class="nav-cta nav-cta--mobile" (click)="closeMenu()">Entrar</a>
          </div>

          <button
            type="button"
            class="theme-toggle"
            (click)="toggleTheme()"
            [attr.aria-label]="isDark() ? 'Ativar modo claro' : 'Ativar modo escuro'"
          >
            @if (isDark()) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
              </svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z"/>
              </svg>
            }
          </button>

          <a routerLink="/auth/login" class="nav-cta nav-cta--desktop">Entrar</a>

          <button type="button" class="hamburger" (click)="toggleMenu()" aria-label="Abrir menu" [class.active]="menuOpen()">
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
      padding: 14px 0;
      transition:
        background 280ms cubic-bezier(0.16, 1, 0.3, 1),
        backdrop-filter 280ms ease,
        border-color 280ms ease,
        box-shadow 280ms ease,
        padding 280ms ease;
      background: transparent;
      border-bottom: 1px solid transparent;
    }
    .navbar.scrolled {
      padding: 10px 0;
      background: rgba(155, 180, 215, 0.9);
      backdrop-filter: blur(20px) saturate(1.25);
      -webkit-backdrop-filter: blur(20px) saturate(1.25);
      border-bottom-color: rgba(37, 80, 150, 0.12);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
    }
    .navbar.scrolled .logo-text,
    .navbar.scrolled .nav-links a {
      color: #0f1b33;
    }
    .navbar.scrolled .nav-links a {
      color: #4d5f7c;
    }
    .navbar.scrolled .nav-links a:hover {
      color: #0f1b33;
    }
    .navbar.scrolled .theme-toggle {
      color: #4d5f7c;
      border-color: rgba(37, 80, 150, 0.14);
      background: rgba(255, 255, 255, 0.45);
    }
    .nav-inner {
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      color: var(--clx-accent);
      flex-shrink: 0;
    }
    .logo-mark {
      display: flex;
      color: var(--clx-accent);
    }
    .logo-text {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.04em;
      color: var(--clx-text);
    }
    .navbar:not(.scrolled) .logo-text {
      color: #f0f2f7;
    }
    .navbar:not(.scrolled) .nav-links a {
      color: rgba(240, 242, 247, 0.62);
    }
    .navbar:not(.scrolled) .nav-links a:hover {
      color: #f0f2f7;
    }
    .navbar:not(.scrolled) .theme-toggle {
      color: rgba(240, 242, 247, 0.7);
      border-color: rgba(240, 242, 247, 0.12);
      background: rgba(240, 242, 247, 0.05);
    }
    .navbar:not(.scrolled) .theme-toggle:hover {
      color: #f0f2f7;
      background: rgba(240, 242, 247, 0.1);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-links a {
      color: var(--clx-text-muted);
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 10px;
      transition: color 180ms ease, background 180ms ease;
    }
    .nav-links a:hover {
      color: var(--clx-text);
      background: color-mix(in srgb, var(--clx-text) 4%, transparent);
    }

    .theme-toggle {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: 1px solid var(--clx-border);
      background: var(--clx-bg-alt);
      color: var(--clx-text-secondary);
      cursor: pointer;
      transition: color 180ms ease, background 180ms ease, border-color 180ms ease, transform 180ms ease;
    }
    .theme-toggle:hover {
      color: var(--clx-text);
      border-color: var(--clx-border-strong);
      transform: translateY(-1px);
    }

    .nav-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 16px;
      border-radius: 11px;
      background: var(--clx-accent);
      color: #fff;
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 14px rgba(59, 110, 245, 0.25);
      transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, background 180ms ease;
    }
    .nav-cta:hover {
      background: var(--clx-accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 8px 20px rgba(59, 110, 245, 0.32);
    }
    .nav-cta--mobile { display: none; }

    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      background: none;
      border: 1px solid var(--clx-border);
      border-radius: 10px;
      cursor: pointer;
      padding: 0 9px;
      z-index: 1100;
    }
    .hamburger span {
      display: block;
      width: 100%;
      height: 1.5px;
      background: var(--clx-text);
      border-radius: 2px;
      transition: transform 240ms ease, opacity 240ms ease;
    }
    .hamburger.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
    .hamburger.active span:nth-child(2) { opacity: 0; }
    .hamburger.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
    .menu-overlay { display: none; }

    @media (max-width: 860px) {
      .hamburger { display: flex; }
      .nav-cta--desktop { display: none; }
      .nav-cta--mobile {
        display: inline-flex;
        margin-top: 12px;
        width: 100%;
      }
      .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        width: min(300px, 86vw);
        height: 100vh;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        padding: 88px 20px 28px;
        background: var(--clx-bg);
        border-left: 1px solid var(--clx-border);
        box-shadow: -12px 0 40px rgba(0,0,0,0.12);
        transition: right 280ms cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1050;
      }
      .nav-links.open { right: 0; }
      .nav-links a {
        font-size: 1rem;
        padding: 14px 12px;
        border-radius: 12px;
      }
      .menu-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(7, 11, 18, 0.45);
        backdrop-filter: blur(2px);
        z-index: 1040;
      }
      .navbar:not(.scrolled) .nav-links a {
        color: var(--clx-text-muted);
      }
      .navbar:not(.scrolled) .nav-links a:hover {
        color: var(--clx-text);
      }
    }
  `],
})
export class NavbarComponent implements OnInit {
  private animation = inject(LandingAnimationService);
  scrolled = signal(false);
  isDark = signal(true);
  menuOpen = signal(false);

  ngOnInit() {
    const theme = document.documentElement.getAttribute('data-theme');
    this.isDark.set(theme !== 'light');
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleTheme() {
    this.animation.toggleDark();
    this.isDark.update((v) => !v);
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
