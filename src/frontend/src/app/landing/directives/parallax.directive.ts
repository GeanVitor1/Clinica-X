import { Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Directive({
  selector: '[appParallax]',
  standalone: true,
})
export class ParallaxDirective implements OnInit {
  private el = inject(ElementRef<HTMLElement>);
  readonly appParallax = input(0.3);

  ngOnInit() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(this.el.nativeElement,
      { y: 0 },
      {
        y: () => -this.el.nativeElement.offsetHeight * this.appParallax(),
        ease: 'none',
        scrollTrigger: {
          trigger: this.el.nativeElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  }
}
