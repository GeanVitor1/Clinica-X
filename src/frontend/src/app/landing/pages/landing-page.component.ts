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
    <app-navbar />
    <app-hero />
    <app-how-it-works />
    <app-features />
    <app-all-in-one />
    <app-testimonials />
    <app-why-choose />
    <app-faq />
    <app-pricing />
    <app-cta />
    <app-demo-access />
    <app-footer />
  `,
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
