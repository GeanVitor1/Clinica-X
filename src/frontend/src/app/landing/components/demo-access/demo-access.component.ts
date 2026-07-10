import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demo-access',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="demo">
      <h2>Quer testar agora?</h2>
      <p>Acesse a demonstração com dados fictícios e explore o sistema.</p>
      <a routerLink="/auth/login" [queryParams]="{demo: true}" class="demo-btn">Acessar demo da clínica</a>
    </section>
  `,
  styles: [`
    .demo {
      padding: 80px 24px;
      text-align: center;
      background: var(--clx-bg-alt);
      border-top: 1px solid var(--clx-border);
    }
    .demo h2 {
      font-size: 1.8rem;
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .demo p {
      color: var(--clx-text-muted);
      margin-bottom: 32px;
      font-size: 0.95rem;
    }
    .demo-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 36px;
      background: var(--clx-accent);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 50px;
      text-decoration: none;
      transition: all 0.25s;
    }
    .demo-btn:hover {
      background: var(--clx-accent-light);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
    }
  `],
})
export class DemoAccessComponent {}
