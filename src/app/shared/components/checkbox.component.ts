import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label [class]="labelClasses()">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        [required]="required"
        [class]="checkboxClasses()"
        (change)="onChange($event)"
        (blur)="onBlur()"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedBy"
      />
      @if (label) {
        <span class="ml-2 text-sm text-gray-700">{{ label }}</span>
      }
      <ng-content />
    </label>
  `,
  styles: [],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  checked = false;

  private onChangeFn = (value: boolean) => {};
  private onTouchedFn = () => {};

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChangeFn(this.checked);
  }

  onBlur() {
    this.onTouchedFn();
  }

  writeValue(value: boolean): void {
    this.checked = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  labelClasses() {
    return 'inline-flex items-center cursor-pointer';
  }

  checkboxClasses() {
    const base =
      'rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2';
    const sizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };
    const state = this.disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    return `${base} ${sizes[this.size]} ${state}`;
  }
}

