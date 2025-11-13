import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block group">
      <ng-content />
      <div
        class="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none whitespace-nowrap"
        [class.bottom-full]="position === 'top'"
        [class.top-full]="position === 'bottom'"
        [class.left-0]="position === 'top' || position === 'bottom'"
        [class.right-0]="position === 'right'"
        [class.mb-1]="position === 'top'"
        [class.mt-1]="position === 'bottom'"
        [class.ml-1]="position === 'right'"
        [class.mr-1]="position === 'left'"
        role="tooltip"
        [attr.aria-label]="text"
      >
        {{ text }}
      </div>
    </div>
  `,
  styles: [],
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
}

