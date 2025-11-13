import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <select
      [value]="value"
      [disabled]="disabled"
      [required]="required"
      [class]="selectClasses()"
      (change)="onChange($event)"
      (blur)="onBlur()"
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedBy"
    >
      @if (placeholder) {
        <option [value]="null" disabled>{{ placeholder }}</option>
      }
      @for (option of options; track option.value) {
        <option [value]="option.value" [disabled]="option.disabled">
          {{ option.label }}
        </option>
      }
    </select>
  `,
  styles: [],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'error' = 'default';

  value: any = null;

  private onChangeFn = (value: any) => {};
  private onTouchedFn = () => {};

  onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChangeFn(this.value);
  }

  onBlur() {
    this.onTouchedFn();
  }

  writeValue(value: any): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  selectClasses() {
    const base =
      'w-full border rounded-lg focus:outline-none focus:ring-2 transition-colors';
    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };
    const variants = {
      default:
        'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
      error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
    };
    const state = this.disabled
      ? 'bg-gray-100 cursor-not-allowed opacity-50'
      : 'bg-white';

    return `${base} ${sizes[this.size]} ${variants[this.variant]} ${state}`;
  }
}

