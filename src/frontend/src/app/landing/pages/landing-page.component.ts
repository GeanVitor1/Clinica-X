import { Component, OnInit, OnDestroy } from '@angular/core';
import Lenis from 'lenis';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { HeroComponent } from '../components/hero/hero.component';
import { HowItWorksComponent } from '../components/how-it-works/how-it-works.component';
import { FeaturesComponent } from '../components/features/features.component';
import { AllInOneComponent } from '../components/all-in-one/all-in-one.component';
import { TestimonialsComponent } from '../components/testimonials/testimonials.component';
import { WhyChooseComponent } from '../components/why-choose/why-choose.component';
import { FaqComponent } from '../components/faq/faq.component';
import { PricingComponent } from '../components/pricing/pricing.component';
import { CtaComponent } from '../components/cta/cta.component';
import { DemoAccessComponent } from '../components/demo-access/demo-access.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    HowItWorksComponent,
    FeaturesComponent,
    AllInOneComponent,
    TestimonialsComponent,
    WhyChooseComponent,
    FaqComponent,
    PricingComponent,
    CtaComponent,
    DemoAccessComponent,
    FooterComponent,
  ],
  template: `
    <div class="landing-shell">
      <div class="landing-medical-bg" aria-hidden="true">
        <div class="mbg-layer mbg-layer--dna"></div>
        <div class="mbg-layer mbg-layer--ecg"></div>
        <div class="mbg-layer mbg-layer--cross"></div>
        <div class="mbg-glow mbg-glow--1"></div>
        <div class="mbg-glow mbg-glow--2"></div>
        <div class="mbg-glow mbg-glow--3"></div>
      </div>

      <div class="landing-content">
        <app-navbar />
        <app-hero />
        <div class="surface surface--soft">
          <app-how-it-works />
        </div>
        <div class="surface surface--base">
          <app-features />
        </div>
        <div class="surface surface--elevated">
          <app-all-in-one />
        </div>
        <app-testimonials />
        <div class="surface surface--base">
          <app-why-choose />
        </div>
        <div class="surface surface--soft">
          <app-faq />
        </div>
        <div class="surface surface--base">
          <app-pricing />
        </div>
        <app-cta />
        <div class="surface surface--soft">
          <app-demo-access />
        </div>
        <app-footer />
      </div>
    </div>
  `,
  styles: [`
    /*
      Landing palette: soft blue (not pure white).
      Scoped tokens so dark-theme black cards don't appear on the light shell.
    */
    .landing-shell {
      position: relative;
      isolation: isolate;
      min-height: 100%;

      /* Inherit mid-blue global tokens; keep shell slightly deeper */
      background: var(--clx-page-bg);
      color: var(--clx-text);
    }

    .landing-medical-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      background:
        radial-gradient(ellipse 85% 55% at 8% 5%, rgba(35, 75, 160, 0.2) 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 92% 12%, rgba(45, 95, 175, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 55% 45% at 75% 78%, rgba(25, 65, 140, 0.14) 0%, transparent 55%),
        radial-gradient(ellipse 50% 40% at 18% 68%, rgba(60, 110, 180, 0.14) 0%, transparent 50%),
        linear-gradient(180deg, rgba(150, 180, 215, 0.12) 0%, transparent 35%, rgba(120, 155, 195, 0.16) 100%);
    }

    .mbg-layer {
      position: absolute;
      inset: -10%;
      opacity: 0.05;
      filter: blur(0.3px);
    }

    .mbg-layer--dna {
      background-image: url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%233b6ef5' stroke-width='1.1' opacity='0.85'%3E%3Cpath d='M30 10c20 20 20 40 0 60s-20 40 0 60 20 40 0 60'/%3E%3Cpath d='M50 10c-20 20-20 40 0 60s20 40 0 60-20 40 0 60'/%3E%3Cpath d='M32 30h16M28 50h24M32 70h16M28 90h24M32 110h16'/%3E%3Ccircle cx='120' cy='40' r='3' fill='%233b6ef5' stroke='none'/%3E%3Ccircle cx='140' cy='55' r='2.2' fill='%2360a5fa' stroke='none'/%3E%3Ccircle cx='130' cy='70' r='2.5' fill='%233b6ef5' stroke='none'/%3E%3Cpath d='M120 40l20 15M140 55l-10 15'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 220px 220px;
      animation: mbgDrift 80s linear infinite;
    }

    .mbg-layer--ecg {
      opacity: 0.045;
      background-image: url("data:image/svg+xml,%3Csvg width='240' height='80' viewBox='0 0 240 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40h40l8-18 10 36 8-28 6 14h30l8-16 10 32 8-24 6 12H240' fill='none' stroke='%233b82f6' stroke-width='1.4' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-size: 280px 90px;
      background-position: 0 30%;
      animation: mbgDrift 100s linear infinite reverse;
    }

    .mbg-layer--cross {
      opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2360a5fa' stroke-width='1.2'%3E%3Cpath d='M30 20h12v12h12v12H42v12H30V44H18V32h12z'/%3E%3Cpath d='M110 90c18 0 30 12 30 28s-12 28-30 28-18-6-18-6'/%3E%3Ccircle cx='92' cy='140' r='6'/%3E%3Cpath d='M100 90V70c0-10 8-18 18-18h8'/%3E%3Ccircle cx='130' cy='40' r='10'/%3E%3Cpath d='M130 34v12M124 40h12'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 200px 200px;
      animation: mbgDrift 120s linear infinite;
    }

    .mbg-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
    }
    .mbg-glow--1 {
      width: 55vw;
      height: 55vw;
      max-width: 700px;
      max-height: 700px;
      background: radial-gradient(circle, rgba(59, 110, 245, 0.22) 0%, rgba(96, 165, 250, 0.12) 40%, transparent 70%);
      top: -5%;
      left: -12%;
    }
    .mbg-glow--2 {
      width: 45vw;
      height: 45vw;
      max-width: 560px;
      max-height: 560px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(147, 197, 253, 0.14) 45%, transparent 70%);
      top: 40%;
      right: -10%;
    }
    .mbg-glow--3 {
      width: 40vw;
      height: 40vw;
      max-width: 480px;
      max-height: 480px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, rgba(191, 219, 254, 0.18) 50%, transparent 70%);
      bottom: 0%;
      left: 25%;
    }

    @keyframes mbgDrift {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(-40px, -24px, 0); }
    }

    .landing-content {
      position: relative;
      z-index: 1;
    }

    .surface {
      position: relative;
    }
    .surface--base {
      background: transparent;
    }
    .surface--soft {
      background:
        linear-gradient(180deg, rgba(140, 170, 210, 0.45) 0%, rgba(125, 158, 200, 0.4) 50%, rgba(145, 175, 212, 0.42) 100%);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        inset 0 -1px 0 rgba(20, 42, 85, 0.12);
    }
    .surface--elevated {
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(40, 80, 160, 0.14) 0%, transparent 55%),
        linear-gradient(180deg, rgba(130, 162, 200, 0.42) 0%, rgba(115, 150, 190, 0.38) 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
    }

    @media (prefers-reduced-motion: reduce) {
      .mbg-layer--dna,
      .mbg-layer--ecg,
      .mbg-layer--cross {
        animation: none;
      }
    }
  `],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private lenis: Lenis | null = null;

  ngOnInit() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      this.lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1 - Math.pow(1 - t, 3)) });
      const raf = (time: number) => {
        this.lenis?.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  ngOnDestroy() {
    this.lenis?.destroy();
  }
}
