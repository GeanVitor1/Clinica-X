import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements OnInit {
  @Input('appAnimateOnScroll') variant: string = 'default';

  private el = inject(ElementRef<HTMLElement>);

  ngOnInit() {
    gsap.registerPlugin(ScrollTrigger);
    const el = this.el.nativeElement;

    switch (this.variant) {
      case 'fadeIn':
        this.fadeIn(el);
        break;
      case 'slideUp':
        this.slideUp(el);
        break;
      case 'scaleIn':
        this.scaleIn(el);
        break;
      case 'stagger':
        this.stagger(el);
        break;
      default:
        this.defaultAnim(el);
    }
  }

  private defaultAnim(el: HTMLElement) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        gsap.fromTo(el,
          { y: 50, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
        );
      },
      once: true,
    });
  }

  private fadeIn(el: HTMLElement) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(el,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
      },
      once: true,
    });
  }

  private slideUp(el: HTMLElement) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out' }
        );
      },
      once: true,
    });
  }

  private scaleIn(el: HTMLElement) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(el,
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.7)' }
        );
      },
      once: true,
    });
  }

  private stagger(el: HTMLElement) {
    const children = el.querySelectorAll<HTMLElement>('.anim-stagger, .fc-item, .fd-tag, .t-card');
    if (children.length === 0) {
      this.defaultAnim(el);
      return;
    }
    gsap.set(children, { y: 30, opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(children, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        });
      },
      once: true,
    });
  }
}
