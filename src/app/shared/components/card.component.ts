import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (title) {
        <div class="px-6 py-4 border-b theme-border">
          <h3 class="text-lg font-semibold theme-text-primary">{{ title }}</h3>
          @if (subtitle) {
            <p class="mt-1 text-sm theme-text-secondary">{{ subtitle }}</p>
          }
        </div>
      }
      <div [class]="contentClasses()">
        <ng-content />
      </div>
      @if (footer) {
        <div class="px-6 py-4 border-t theme-border theme-bg-secondary">
          <ng-content select="[footer]" />
        </div>
      }
    </div>
  `,
  styles: [],
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() footer = false;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  cardClasses() {
    return 'theme-card rounded-lg border theme-border shadow-sm overflow-hidden';
  }

  contentClasses() {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    return paddingClasses[this.padding];
  }
}

