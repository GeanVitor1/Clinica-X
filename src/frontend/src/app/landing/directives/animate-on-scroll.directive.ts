import { Directive, ElementRef, OnDestroy, OnInit, inject, Input } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeRevealOnScroll } from '../../shared/utils/safe-reveal';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input('appAnimateOnScroll') variant: string = 'default';

  private el = inject(ElementRef<HTMLElement>);
  private triggers: ScrollTrigger[] = [];
  private safetyTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    gsap.registerPlugin(ScrollTrigger);
    const el = this.el.nativeElement;

    switch (this.variant) {
      case 'fadeIn':
        this.animate(el, { y: 0, duration: 0.14 });
        break;
      case 'slideUp':
        this.animate(el, { y: 16, duration: 0.18 });
        break;
      case 'scaleIn':
        this.scaleIn(el);
        break;
      case 'stagger':
        this.stagger(el);
        break;
      default:
        this.animate(el, { y: 12, duration: 0.16 });
    }
  }

  ngOnDestroy() {
    if (this.safetyTimer) clearTimeout(this.safetyTimer);
    this.triggers.forEach((t) => t.kill());
    // Nunca deixar o host invisível ao destruir
    gsap.set(this.el.nativeElement, { clearProps: 'opacity,transform' });
    const children = this.el.nativeElement.querySelectorAll(
      '.anim-stagger, .fc-item, .fd-tag, .t-card'
    ) as NodeListOf<HTMLElement>;
    children.forEach((c: HTMLElement) => gsap.set(c, { clearProps: 'opacity,transform' }));
  }

  private animate(el: HTMLElement, opts: { y: number; duration: number }) {
    const st = safeRevealOnScroll(el, {
      y: opts.y,
      duration: opts.duration,
      start: 'top 90%',
    });
    if (st) this.triggers.push(st);
  }

  private scaleIn(el: HTMLElement) {
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      gsap.fromTo(
        el,
        { scale: 0.96, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => gsap.set(el, { clearProps: 'transform,opacity' }),
        }
      );
    };

    gsap.set(el, { opacity: 0, scale: 0.97 });
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94) {
      reveal();
      return;
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 94%',
      once: true,
      onEnter: reveal,
      onRefresh: (self) => {
        if (self.isActive || self.progress > 0) reveal();
      },
    });
    this.triggers.push(st);
    this.safetyTimer = setTimeout(() => reveal(), 1200);
  }

  private stagger(el: HTMLElement) {
    const children = el.querySelectorAll<HTMLElement>('.anim-stagger, .fc-item, .fd-tag, .t-card');
    if (children.length === 0) {
      this.animate(el, { y: 10, duration: 0.15 });
      return;
    }
    const st = safeRevealOnScroll(children, {
      y: 8,
      duration: 0.15,
      stagger: 0.012,
      start: 'top 94%',
    });
    if (st) this.triggers.push(st);
  }
}
