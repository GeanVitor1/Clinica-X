import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demo-access',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="demo">
      <div class="demo-card">
        <div class="demo-copy">
          <span class="section-label">Ambiente demo</span>
          <h2>Explore com dados fictícios</h2>
          <p>
            Entre na clínica de demonstração e navegue por agenda, pacientes, prontuário e financeiro —
            sem cadastrar nada e sem risco.
          </p>
        </div>
        <div class="demo-actions">
          <a routerLink="/auth/login" [queryParams]="{demo: true}" class="demo-btn">
            Abrir demo
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <div class="demo-creds">
            <span>demo&#64;clinica.com</span>
            <span class="sep">·</span>
            <span>senha 1234</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .demo {
      padding: 0 28px 100px;
      background: transparent;
    }
    .demo-card {
      max-width: 1120px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      padding: 36px 40px;
      border-radius: 18px;
      border: 1px solid var(--clx-border);
      background:
        radial-gradient(ellipse 60% 80% at 0% 50%, rgba(35, 75, 160, 0.16), transparent 55%),
        linear-gradient(135deg, #b8cce4 0%, #a5bddc 100%);
      border: 1px solid rgba(20, 45, 90, 0.2);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.18) inset,
        0 10px 32px rgba(20, 42, 85, 0.14);
    }
    .section-label {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--clx-accent);
      margin-bottom: 10px;
    }
    .demo-copy h2 {
      font-size: clamp(1.35rem, 2.2vw, 1.7rem);
      font-weight: 700;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }
    .demo-copy p {
      font-size: 0.92rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      max-width: 480px;
    }
    .demo-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      flex-shrink: 0;
    }
    .demo-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: var(--clx-accent);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 11px;
      text-decoration: none;
      box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 6px 18px rgba(59, 110, 245, 0.28);
      transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, background 200ms ease;
    }
    .demo-btn:hover {
      background: var(--clx-accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 1px 0 rgba(255,255,255,0.14) inset, 0 10px 24px rgba(59, 110, 245, 0.34);
    }
    .demo-creds {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--clx-text-tertiary);
      font-variant-numeric: tabular-nums;
    }
    .sep { opacity: 0.5; }

    @media (max-width: 720px) {
      .demo-card {
        flex-direction: column;
        align-items: flex-start;
        padding: 28px 24px;
      }
      .demo-actions {
        align-items: flex-start;
        width: 100%;
      }
      .demo { padding-bottom: 72px; }
    }
  `],
})
export class DemoAccessComponent {}
