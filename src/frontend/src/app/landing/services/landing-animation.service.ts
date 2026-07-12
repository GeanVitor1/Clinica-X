import { Injectable, inject, Renderer2, RendererFactory2 } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({ providedIn: 'root' })
export class LandingAnimationService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    gsap.registerPlugin(ScrollTrigger);
  }

  countUp(el: HTMLElement, target: number) {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        el.innerText = Math.round(obj.val).toString();
      },
    });
  }

  staggerCards(cards: NodeListOf<Element>, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) {
    ScrollTrigger.batch(cards as any, {
      start: 'top 94%',
      onEnter: (batch) =>
        gsap.fromTo(batch, fromVars, {
          duration: 0.15,
          ease: 'power2.out',
          ...toVars,
          stagger: 0.015,
        }),
      once: true,
    });
  }

  toggleDark() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.renderer.setAttribute(html, 'data-theme', next);
    try {
      localStorage.setItem('clx-theme', next);
    } catch {}
  }
}
