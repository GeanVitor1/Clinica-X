import { Component, computed, input } from '@angular/core';

const COLORS = [
  '#14b8a6', '#0ea5e9', '#8b5cf6', '#f43f5e',
  '#f59e0b', '#10b981', '#6366f1', '#ec4899',
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="avatar" [style.background]="bgColor()">
      {{ initials() }}
    </div>
  `,
  styles: [`
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--clx-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }
  `],
})
export class AvatarComponent {
  readonly name = input.required<string>();

  protected initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  });

  protected bgColor = computed(() => hashColor(this.name()));
}
