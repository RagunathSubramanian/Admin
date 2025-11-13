import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="avatarClasses()"
      [attr.aria-label]="'Avatar for ' + name"
      role="img"
    >
      @if (imageUrl) {
        <img [src]="imageUrl" [alt]="name" class="w-full h-full object-cover rounded-full" />
      } @else {
        <span [class]="initialsClasses()">{{ initials() }}</span>
      }
    </div>
  `,
  styles: [],
})
export class AvatarComponent {
  @Input() name = '';
  @Input() imageUrl?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  initials = computed(() => {
    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  });

  avatarClasses() {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };
    const base = 'inline-flex items-center justify-center rounded-full bg-primary-500 text-white font-medium';
    return `${base} ${sizes[this.size]}`;
  }

  initialsClasses() {
    return 'w-full h-full flex items-center justify-center';
  }
}

