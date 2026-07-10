import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { FeatureCardComponent } from './feature-card.component';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  checks: string[];
  details: string[];
  demoType: string;
  frameLabel?: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [RouterLink, AnimateOnScrollDirective, FeatureCardComponent],
  template: `
    <section class="features" id="funcionalidades">
      <div class="container">
        <div class="section-head" appAnimateOnScroll>
          <span class="section-badge">FUNCIONALIDADES</span>
          <h2>Tudo que sua clínica precisa em um único login</h2>
          <p>Em poucos cliques, a gestão 360° do seu negócio</p>
        </div>

        <div class="features-list">
          @for (feature of features; track feature.demoType; let i = $index; let last = $last) {
            <div class="feature-block" [class.reverse]="i % 2 !== 0" appAnimateOnScroll="stagger">
              <div class="feature-text">
                <div class="feature-icon-wrap anim-stagger">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><use [attr.href]="feature.icon"/></svg>
                </div>
                <h3 class="anim-stagger">{{ feature.title }}</h3>
                <p class="feature-desc anim-stagger">{{ feature.description }}</p>

                <div class="feature-checks">
                  @for (check of feature.checks; track check) {
                    <div class="fc-item anim-stagger">
                      <div class="fc-check">
                        <svg width="12" height="12"><use href="#ic-check"/></svg>
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
            </div>

            @if (!last) {
              <div class="feature-divider" appAnimateOnScroll>
                <span class="fd-line"></span>
                <span class="fd-icon">✦</span>
                <span class="fd-line"></span>
              </div>
            }
          }
        </div>

        <div class="features-cta" appAnimateOnScroll>
          <h3>O sistema que transforma sua rotina e acelera o crescimento da sua clínica!</h3>
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
      padding: 120px 0;
      background: var(--clx-bg);
    }
    .features::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 40% at 0% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 70%),
        radial-gradient(ellipse 50% 30% at 100% 50%, rgba(124, 58, 237, 0.02) 0%, transparent 60%);
      pointer-events: none;
    }
    .features .container { position: relative; z-index: 1; }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 32px;
    }
    .section-head {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 70px;
    }
    .section-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 100px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.05));
      color: var(--clx-accent);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 16px;
      border: 1px solid rgba(37, 99, 235, 0.1);
    }
    .section-head h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 750;
      color: var(--clx-text);
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }
    .section-head p {
      font-size: 0.95rem;
      color: var(--clx-text-muted);
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .feature-block {
      display: flex;
      align-items: center;
      gap: 60px;
    }
    .feature-block.reverse {
      flex-direction: row-reverse;
    }

    .feature-text {
      flex: 0 0 360px;
    }
    .feature-icon-wrap {
      width: 48px; height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.05));
      border: 1px solid rgba(37, 99, 235, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--clx-accent);
      margin-bottom: 18px;
    }
    .feature-text h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--clx-text);
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    .feature-desc {
      font-size: 0.88rem;
      color: var(--clx-text-muted);
      line-height: 1.7;
      margin-bottom: 20px;
    }

    .feature-checks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 18px;
    }
    .fc-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .fc-check {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.05));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--clx-accent);
      flex-shrink: 0;
    }
    .fc-item span {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--clx-text);
    }

    .feature-details {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .fd-tag {
      padding: 4px 12px;
      border-radius: 20px;
      background: var(--clx-bg-soft);
      border: 1px solid var(--clx-border);
      font-size: 0.68rem;
      color: var(--clx-text-muted);
      font-weight: 500;
    }

    .feature-media {
      flex: 1;
      min-width: 0;
    }

    .feature-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 50px 0;
    }
    .fd-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--clx-border), transparent);
    }
    .fd-icon {
      font-size: 0.6rem;
      color: var(--clx-accent);
      opacity: 0.3;
    }

    .features-cta {
      text-align: center;
      margin-top: 80px;
      padding: 48px 40px;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.03), rgba(124, 58, 237, 0.02));
      border: 1px solid var(--clx-border);
      border-radius: 20px;
    }
    .features-cta h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--clx-text);
      margin-bottom: 20px;
    }
    .btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: 50px;
      background: linear-gradient(135deg, var(--clx-accent), var(--clx-purple));
      color: #fff;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 24px rgba(37, 99, 235, 0.3);
      transition: all 0.25s;
    }
    .btn-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 36px rgba(37, 99, 235, 0.4);
    }

    @media (max-width: 860px) {
      .feature-block {
        flex-direction: column !important;
        gap: 28px;
      }
      .feature-text { flex: none; width: 100%; }
      .feature-media { width: 100%; }
    }
  `],
})
export class FeaturesComponent {
  readonly features: FeatureItem[] = [
    {
      icon: '#ic-calendar',
      title: 'Agenda Inteligente',
      description: 'Uma agenda que trabalha para você. Reduza o no-show em até 70% com lembretes automáticos via WhatsApp.',
      checks: [
        'Confirmação via WhatsApp com um clique',
        'Visão geral de salas, equipamentos e profissionais',
        'Painel do paciente com autoagendamento',
      ],
      details: ['Visão mensal', 'Conflitos', 'Drag & drop'],
      demoType: 'agenda',
      frameLabel: 'agenda-clinicaX.mp4',
    },
    {
      icon: '#ic-clipboard',
      title: 'Prontuário Digital',
      description: 'Otimize seu tempo com ferramentas que organizam o histórico clínico com precisão.',
      checks: [
        'Anamneses personalizáveis por especialidade',
        'Evolução com fotos e comparativos',
        'Prontuário eletrônico completo',
      ],
      details: ['Timeline', 'Anexos', 'Prescrições'],
      demoType: 'prontuario',
      frameLabel: 'prontuario-clinicaX.mp4',
    },
    {
      icon: '#ic-message',
      title: 'WhatsApp Automático',
      description: 'Reduza faltas em até 60% com comunicação inteligente. Lembretes, confirmações e acompanhamento automatizados.',
      checks: [
        'Lembretes automáticos de consulta',
        'Confirmação em um clique pelo WhatsApp',
        'Acompanhamento pós-consulta',
      ],
      details: ['Automação', 'Confirmações', 'Relatórios'],
      demoType: 'whatsapp',
      frameLabel: 'whatsapp-clinicaX.mp4',
    },
    {
      icon: '#ic-banknote',
      title: 'Gestão Financeira',
      description: 'Controle financeiro na palma da mão. Saiba exatamente suas receitas, despesas e lucratividade.',
      checks: [
        'Comissões calculadas automaticamente',
        'Fluxo de caixa em tempo real',
        'Relatórios gerados em segundos',
      ],
      details: ['Financeiro', 'Gráficos', 'Exportar PDF'],
      demoType: 'relatorios',
      frameLabel: 'financeiro-clinicaX.mp4',
    },
    {
      icon: '#ic-users',
      title: 'Gestão de Pacientes',
      description: 'Cadastro completo com busca inteligente. Todo o histórico e contatos organizados em um só lugar.',
      checks: [
        'Busca rápida por nome ou telefone',
        'Histórico completo de consultas',
        'Cartão do paciente expansivo',
      ],
      details: ['Busca inteligente', 'Histórico', 'Contatos'],
      demoType: 'pacientes',
      frameLabel: 'pacientes-clinicaX.mp4',
    },
    {
      icon: '#ic-zap',
      title: 'PWA Instalável',
      description: 'Funciona como app nativo. Notificações push, modo offline e instalação sem ocupar espaço no celular.',
      checks: [
        'Notificações push em tempo real',
        'Modo offline para consulta de dados',
        'Instalação direta pelo navegador',
      ],
      details: ['Offline', 'Notificações', 'App nativo'],
      demoType: 'pwa',
      frameLabel: 'pwa-clinicaX.mp4',
    },
  ];
}
