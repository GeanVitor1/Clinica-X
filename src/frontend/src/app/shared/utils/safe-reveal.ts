import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Revela elementos no scroll sem deixar opacity:0 “presos”
 * (bug comum com Lenis + ScrollTrigger).
 */
export function safeRevealOnScroll(
  elements: Element | Element[] | NodeListOf<Element>,
  options?: {
    start?: string;
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
  }
): ScrollTrigger | null {
  gsap.registerPlugin(ScrollTrigger);

  const list = Array.from(
    elements instanceof Element
      ? [elements]
      : (elements as NodeListOf<Element> | Element[])
  ).filter(Boolean) as HTMLElement[];

  if (!list.length) return null;

  const start = options?.start ?? 'top 94%';
  const y = options?.y ?? 8;
  const duration = options?.duration ?? 0.15;
  const stagger = options?.stagger ?? 0.012;

  // Estado inicial suave
  gsap.set(list, { opacity: 0, y, force3D: true });

  let done = false;
  const reveal = () => {
    if (done) return;
    done = true;
    gsap.to(list, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => {
        gsap.set(list, { clearProps: 'transform,opacity' });
      },
    });
  };

  // Já visível no viewport? Revela na hora (evita ficar invisível)
  const alreadyVisible = list.some((el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  });
  if (alreadyVisible) {
    reveal();
    return null;
  }

  const st = ScrollTrigger.create({
    trigger: list[0],
    start,
    once: true,
    onEnter: reveal,
    // Se o refresh recalcular e já estiver na tela
    onRefresh: (self) => {
      if (self.progress > 0 || self.isActive) reveal();
    },
  });

  // Rede de segurança: se por algum motivo o trigger não disparar, mostra tudo
  window.setTimeout(() => {
    if (!done) reveal();
  }, 1200);

  return st;
}

/** Garante que elementos com style inline de opacity:0 voltem a aparecer. */
export function forceVisible(selector: string, root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const op = getComputedStyle(el).opacity;
    if (op === '0' || el.style.opacity === '0') {
      gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
    }
  });
}
