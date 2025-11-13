import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled"
      [class]="buttonClasses()"
      (click)="onClick.emit($event)"
      [attr.aria-label]="ariaLabel || 'Icon button'"
      [attr.aria-disabled]="disabled"
    >
      <ng-content />
    </button>
  `,
  styles: [],
})
export class IconButtonComponent {
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  onClick = output<MouseEvent>();

  buttonClasses() {
    const base =
      'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100';
    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };
    return `${base} ${sizes[this.size]}`;
  }
}

