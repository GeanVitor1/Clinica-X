import { Directive, ElementRef, AfterViewInit, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appSplitText]',
  standalone: true,
})
export class SplitTextDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit() {
    const words = this.el.nativeElement.innerText.split(' ');
    this.el.nativeElement.innerHTML = words
      .map((w: string) => `<span class="split-word">${w}</span>`)
      .join(' ');

    gsap.fromTo(
      this.el.nativeElement.querySelectorAll('.split-word'),
      { opacity: 0, y: 40, rotateX: 10 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.22,
        stagger: 0.018,
        ease: 'power2.out',
      }
    );
  }
}
