import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective {
  private el = inject(ElementRef<HTMLElement>);

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(this.el.nativeElement, {
      rotateX: -y * 8,
      rotateY: x * 8,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  @HostListener('mouseleave')
  onLeave() {
    gsap.to(this.el.nativeElement, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  }
}
