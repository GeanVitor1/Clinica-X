import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appMagnetic]',
  standalone: true,
})
export class MagneticDirective {
  private el = inject(ElementRef<HTMLElement>);

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const max = 15;
    gsap.to(this.el.nativeElement, {
      x: Math.max(-max, Math.min(max, x * 0.3)),
      y: Math.max(-max, Math.min(max, y * 0.3)),
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  @HostListener('mouseleave')
  onLeave() {
    gsap.to(this.el.nativeElement, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
  }
}
