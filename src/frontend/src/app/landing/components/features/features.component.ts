import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { FeatureCardComponent } from './feature-card.component';

interface FeatureItem {
  icon: SafeHtml;
  accent: string;
  title: string;
  description: string;
  checks: string[];
  details: string[];
  demoType: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [RouterLink, AnimateOnScrollDirective, FeatureCardComponent],
  template: `
    <section class="features" id="funcionalidades">
      <div class="features-bg" aria-hidden="true">
        <div class="features-mesh"></div>
        <div class="features-medical"></div>
      </div>
      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-label">Funcionalidades</span>
          <h2>Tudo que sua clínica precisa em um único login</h2>
          <p>Gestão 360° sem trocar de ferramenta a cada tarefa do dia.</p>
        </div>

        <div class="features-list">
          @for (feature of features; track feature.demoType; let i = $index; let last = $last) {
            <article
              class="feature-block"
              [class.reverse]="i % 2 !== 0"
              appAnimateOnScroll="stagger"
              [style.--feature-accent]="feature.accent"
            >
              <div class="feature-text">
                <div class="feature-kicker anim-stagger">
                  <span class="feature-index">{{ (i + 1).toString().padStart(2, '0') }}</span>
                  <span class="feature-kicker-line"></span>
                  <span class="feature-kicker-label">Módulo</span>
                </div>

                <div class="feature-icon-wrap anim-stagger" [innerHTML]="feature.icon"></div>
                <h3 class="anim-stagger">{{ feature.title }}</h3>
                <p class="feature-desc anim-stagger">{{ feature.description }}</p>

                <div class="feature-checks">
                  @for (check of feature.checks; track check) {
                    <div class="fc-item anim-stagger">
                      <div class="fc-check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span>{{ check }}</span>
                    </div>
                  }
                </div>

                <div class="feature-details">
                  @for (d of feature.details; track d) {
                    <span class="fd-tag anim-stagger">{{ d }}</span>
                  }
                </div>
              </div>

              <div class="feature-media">
                <app-feature-card [demoType]="feature.demoType" />
              </div>
            </article>

            @if (!last) {
              <div class="feature-divider" appAnimateOnScroll aria-hidden="true">
                <span class="fd-line"></span>
              </div>
            }
          }
        </div>

        <div class="features-cta" appAnimateOnScroll>
          <div class="features-cta-copy">
            <h3>Pronto para sair da operação e assumir o controle</h3>
            <p>Configure em minutos. Dados demo disponíveis para explorar sem compromisso.</p>
          </div>
          <a class="btn-cta" routerLink="/auth/login">
            Criar conta grátis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features {
      position: relative;
      padding: 100px 0;
      background: transparent;
      overflow: visible;
      overflow-anchor: none;
    }
    .features-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .features-mesh {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 55% 45% at 8% 20%, rgba(59, 110, 245, 0.07) 0%, transparent 60%),
        radial-gradient(ellipse 45% 40% at 95% 70%, rgba(13, 148, 136, 0.05) 0%, transparent 55%);
    }
    .features-medical {
      position: absolute;
      inset: 0;
      opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%233b6ef5' stroke-width='1'%3E%3Cpath d='M20 60h20M30 50v20'/%3E%3Ccircle cx='90' cy='30' r='8'/%3E%3Cpath d='M86 30h8M90 26v8'/%3E%3Cpath d='M50 90c8-12 22-12 30 0'/%3E%3Cpath d='M10 20l8 4 8-8 8 12'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 140px 140px;
    }
    .features .container { position: relative; z-index: 1; }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
    }
    .section-head {
      text-align: center;
      max-width: 620px;
      margin: 0 auto 72px;
    }
    .section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--clx-accent);
      margin-bottom: 14px;
      padding: 6px 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--clx-accent) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--clx-accent) 18%, transparent);
    }
    .section-head h2 {
      font-size: clamp(1.7rem, 3.2vw, 2.35rem);
      font-weight: 800;
      color: var(--clx-text);
      letter-spacing: -0.04em;
      margin-bottom: 14px;
      line-height: 1.15;
    }
    .section-head p {
      font-size: 1rem;
      color: var(--clx-text-muted);
      line-height: 1.6;
      margin: 0;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .feature-block {
      --feature-accent: var(--clx-accent);
      display: flex;
      align-items: flex-start;
      gap: 48px;
      padding: 36px 0;
      margin: 0;
      overflow: visible;
      overflow-anchor: none;
    }
    .feature-block.reverse { flex-direction: row-reverse; }

    .feature-text {
      flex: 0 0 340px;
      max-width: 340px;
      padding-top: 8px;
    }

    .feature-kicker {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .feature-index {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--feature-accent);
      font-variant-numeric: tabular-nums;
    }
    .feature-kicker-line {
      width: 28px;
      height: 2px;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--feature-accent), transparent);
    }
    .feature-kicker-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--clx-text-muted);
    }

    .feature-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      background:
        linear-gradient(145deg,
          color-mix(in srgb, var(--feature-accent) 22%, #fff),
          color-mix(in srgb, var(--feature-accent) 10%, transparent));
      border: 1px solid color-mix(in srgb, var(--feature-accent) 28%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--feature-accent);
      margin-bottom: 18px;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.55) inset,
        0 10px 24px color-mix(in srgb, var(--feature-accent) 18%, transparent);
      transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 160ms ease;
    }
    .feature-icon-wrap ::ng-deep svg {
      width: 28px;
      height: 28px;
      display: block;
    }
    .feature-block:hover .feature-icon-wrap {
      transform: translateY(-3px) scale(1.05);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.65) inset,
        0 14px 32px color-mix(in srgb, var(--feature-accent) 28%, transparent);
    }
    .feature-text h3 {
      font-size: clamp(1.35rem, 2.2vw, 1.55rem);
      font-weight: 800;
      color: var(--clx-text);
      margin: 0 0 12px;
      letter-spacing: -0.035em;
      line-height: 1.15;
    }
    .feature-desc {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
      line-height: 1.7;
      margin: 0 0 22px;
      max-width: 34ch;
    }

    .feature-checks {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 18px;
    }
    .fc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.16));
      border: 1px solid color-mix(in srgb, var(--feature-accent) 14%, var(--clx-border));
      box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset;
      transition: border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
    }
    .fc-item:hover {
      border-color: color-mix(in srgb, var(--feature-accent) 32%, transparent);
      transform: translateX(3px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.4) inset,
        0 8px 18px color-mix(in srgb, var(--feature-accent) 10%, transparent);
    }
    .fc-check {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: linear-gradient(145deg, color-mix(in srgb, var(--feature-accent) 22%, #fff), color-mix(in srgb, var(--feature-accent) 12%, transparent));
      border: 1px solid color-mix(in srgb, var(--feature-accent) 28%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--feature-accent);
      flex-shrink: 0;
      box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset;
    }
    .fc-item span {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--clx-text);
      letter-spacing: -0.01em;
      line-height: 1.35;
    }

    .feature-details {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .fd-tag {
      padding: 5px 11px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--feature-accent) 10%, rgba(255,255,255,0.45));
      border: 1px solid color-mix(in srgb, var(--feature-accent) 22%, transparent);
      font-size: 0.68rem;
      color: color-mix(in srgb, var(--feature-accent) 70%, var(--clx-text));
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .feature-media {
      flex: 1 1 auto;
      min-width: 0;
      height: auto;
      max-height: none;
      overflow: visible;
      overflow-anchor: none;
      contain: layout style;
    }

    .feature-media ::ng-deep app-feature-card {
      display: block;
      width: 100%;
      height: auto;
    }

    .feature-divider {
      padding: 0;
      margin: 0;
      line-height: 0;
    }
    .fd-line {
      display: block;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--clx-accent) 35%, var(--clx-border)),
        transparent
      );
    }

    .features-cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
      margin-top: 64px;
      padding: 34px 38px;
      background:
        radial-gradient(ellipse 70% 100% at 0% 50%, color-mix(in srgb, var(--clx-accent) 22%, transparent), transparent 55%),
        linear-gradient(135deg, #b9cce8 0%, #a6bddc 100%);
      border: 1px solid rgba(20, 45, 90, 0.18);
      border-radius: 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.28) inset,
        0 12px 32px rgba(20, 42, 85, 0.14);
    }
    .features-cta-copy { max-width: 420px; }
    .features-cta h3 {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--clx-text);
      margin-bottom: 6px;
      letter-spacing: -0.03em;
    }
    .features-cta p {
      font-size: 0.92rem;
      color: var(--clx-text-muted);
      line-height: 1.55;
      margin: 0;
    }
    .btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 26px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--clx-accent), #2a56d4);
      color: #fff;
      font-size: 0.94rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.18) inset,
        0 8px 22px rgba(59, 110, 245, 0.32);
      transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 150ms ease;
    }
    .btn-cta:hover {
      transform: translateY(-2px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.2) inset,
        0 12px 30px rgba(59, 110, 245, 0.4);
    }

    @media (max-width: 860px) {
      .feature-block {
        flex-direction: column !important;
        align-items: stretch;
        gap: 18px;
        padding: 28px 0;
      }
      .feature-text {
        flex: none;
        width: 100%;
        max-width: none;
      }
      .feature-desc { max-width: none; }
      .feature-media {
        width: 100%;
        height: auto;
        max-height: none;
      }
      .features-cta {
        flex-direction: column;
        align-items: flex-start;
        padding: 28px 24px;
      }
    }
  `],
})
export class FeaturesComponent {
  private readonly sanitizer = inject(DomSanitizer);

  private icon(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  readonly features: FeatureItem[] = [
    {
      // Calendar with clock pulse — agenda inteligente
      icon: this.icon(`<svg viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="22" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M10 4v5M22 4v5M4 13h24" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="20.5" cy="21" r="5.2" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M20.5 18.5v2.8l1.8 1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="18" r="1.2" fill="currentColor"/><circle cx="14" cy="18" r="1.2" fill="currentColor"/></svg>`),
      accent: '#3b6ef5',
      title: 'Agenda Inteligente',
      description: 'Uma agenda que trabalha para você. Reduza o no-show em até 70% com lembretes automáticos via WhatsApp.',
      checks: [
        'Confirmação via WhatsApp com um clique',
        'Visão geral de salas, equipamentos e profissionais',
        'Painel do paciente com autoagendamento',
      ],
      details: ['Visão mensal', 'Conflitos', 'Drag & drop'],
      demoType: 'agenda',
    },
    {
      // Medical chart + cross — prontuário
      icon: this.icon(`<svg viewBox="0 0 32 32" fill="none"><path d="M9 5h10l5 5v16a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" stroke="currentColor" stroke-width="1.7"/><path d="M18 5v6h6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M11 16h10M11 20h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="19.5" y="18" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.4"/><path d="M23 19.8v3.4M21.3 21.5h3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`),
      accent: '#0d9488',
      title: 'Prontuário Digital',
      description: 'Otimize seu tempo com ferramentas que organizam o histórico clínico com precisão.',
      checks: [
        'Anamneses personalizáveis por especialidade',
        'Evolução com fotos e comparativos',
        'Prontuário eletrônico completo',
      ],
      details: ['Timeline', 'Anexos', 'Prescrições'],
      demoType: 'prontuario',
    },
    {
      // Official-style WhatsApp logo mark
      icon: this.icon(`<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" fill="#25D366"/><path fill="#fff" d="M22.4 18.9c-.25-.12-1.48-.73-1.7-.81-.23-.09-.4-.12-.56.12-.17.25-.64.81-.79 1-.14.17-.29.19-.54.07-1.48-.74-2.45-1.33-3.43-3.01-.18-.31.18-.29.63-1.18.07-.14.04-.27-.02-.38-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.53c-.18 0-.47.07-.72.34-.24.27-.94.92-.94 2.24s.96 2.6 1.1 2.78c.13.17 1.88 2.87 4.56 4.02 1.7.68 2.36.73 3.21.62.49-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.28z"/><path fill="#fff" d="M16 6.2a9.8 9.8 0 0 0-8.4 14.8l-.9 3.3 3.4-.9A9.8 9.8 0 1 0 16 6.2zm0 17.7c-1.55 0-3-.42-4.25-1.15l-.3-.18-2.95.77.79-2.88-.2-.3A8.05 8.05 0 0 1 7.95 16 8.05 8.05 0 0 1 16 7.95 8.05 8.05 0 0 1 24.05 16 8.05 8.05 0 0 1 16 23.9z"/></svg>`),
      accent: '#25D366',
      title: 'WhatsApp Automático',
      description: 'Reduza faltas em até 60% com comunicação inteligente. Lembretes, confirmações e acompanhamento automatizados.',
      checks: [
        'Lembretes automáticos de consulta',
        'Confirmação em um clique pelo WhatsApp',
        'Acompanhamento pós-consulta',
      ],
      details: ['Automação', 'Confirmações', 'Relatórios'],
      demoType: 'whatsapp',
    },
    {
      // Rising bars + coin — financeiro
      icon: this.icon(`<svg viewBox="0 0 32 32" fill="none"><path d="M6 24V16M13 24V11M20 24V14M27 24V8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M5 8l6 4 5-6 7 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/><circle cx="24" cy="22" r="5.5" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M24 19.5v5M22.2 21h3.6c.7 0 1.2.5 1.2 1.1s-.5 1.1-1.2 1.1h-2.4c-.7 0-1.2.5-1.2 1.1s.5 1.1 1.2 1.1H26" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>`),
      accent: '#d97706',
      title: 'Gestão Financeira',
      description: 'Controle financeiro na palma da mão. Saiba exatamente suas receitas, despesas e lucratividade.',
      checks: [
        'Comissões calculadas automaticamente',
        'Fluxo de caixa em tempo real',
        'Relatórios gerados em segundos',
      ],
      details: ['Financeiro', 'Gráficos', 'Exportar PDF'],
      demoType: 'relatorios',
    },
    {
      // Patient + medical badge
      icon: this.icon(`<svg viewBox="0 0 32 32" fill="none"><circle cx="12" cy="10" r="4.2" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 25c.6-4.2 3.6-6.5 7.5-6.5s6.9 2.3 7.5 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="18.5" y="7" width="10" height="12" rx="2.5" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M23.5 10v6M20.5 13h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="23.5" cy="22.5" r="3.2" stroke="currentColor" stroke-width="1.4"/><path d="M23.5 21v3M22 22.5h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`),
      accent: '#6d5af0',
      title: 'Gestão de Pacientes',
      description: 'Cadastro completo com busca inteligente. Todo o histórico e contatos organizados em um só lugar.',
      checks: [
        'Busca rápida por nome ou telefone',
        'Histórico completo de consultas',
        'Painel com status e convênio',
      ],
      details: ['Busca inteligente', 'Histórico', 'Contatos'],
      demoType: 'pacientes',
    },
    {
      // Smartphone + install badge
      icon: this.icon(`<svg viewBox="0 0 32 32" fill="none"><rect x="8" y="3" width="14" height="24" rx="3.5" stroke="currentColor" stroke-width="1.7"/><path d="M13 5.5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="15" cy="23.5" r="1.1" fill="currentColor"/><circle cx="23.5" cy="20.5" r="6" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.5"/><path d="M23.5 17.8v5.4M21.2 20.8l2.3 2.4 2.3-2.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
      accent: '#3b6ef5',
      title: 'PWA Instalável',
      description: 'Funciona como app nativo. Notificações push, modo offline e instalação sem ocupar espaço no celular.',
      checks: [
        'Notificações push em tempo real',
        'Modo offline para consulta de dados',
        'Instalação direta pelo navegador',
      ],
      details: ['Offline', 'Notificações', 'App nativo'],
      demoType: 'pwa',
    },
  ];
}
