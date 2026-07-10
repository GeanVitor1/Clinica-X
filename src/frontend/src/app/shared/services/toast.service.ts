import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  progress: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(type: Toast['type'], message: string, duration = 5000) {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, duration, progress: 100 };
    this.toasts.update(list => [...list, toast]);

    const interval = setInterval(() => {
      this.toasts.update(list =>
        list.map(t => t.id === id ? { ...t, progress: Math.max(0, t.progress - 100 / (duration / 50)) } : t)
      );
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      this.dismiss(id);
    }, duration);
  }

  dismiss(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
