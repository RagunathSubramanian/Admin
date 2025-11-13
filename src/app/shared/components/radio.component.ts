import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface RadioOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-radio-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="groupClasses()" role="radiogroup" [attr.aria-label]="ariaLabel">
      @for (option of options; track option.value) {
        <label [class]="labelClasses()">
          <input
            type="radio"
            [name]="name"
            [value]="option.value"
            [checked]="value === option.value"
            [disabled]="disabled || option.disabled"
            [required]="required"
            [class]="radioClasses()"
            (change)="onChange(option.value)"
            (blur)="onBlur()"
            [attr.aria-label]="option.label"
          />
          <span class="ml-2 text-sm text-gray-700">{{ option.label }}</span>
        </label>
      }
    </div>
  `,
  styles: [],
})
export class RadioGroupComponent implements ControlValueAccessor {
  @Input() options: RadioOption[] = [];
  @Input() name = `radio-${Math.random().toString(36).substr(2, 9)}`;
  @Input() disabled = false;
  @Input() required = false;
  @Input() ariaLabel?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';

  value: any = null;

  private onChangeFn = (value: any) => {};
  private onTouchedFn = () => {};

  onChange(value: any) {
    this.value = value;
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

  groupClasses() {
    const direction =
      this.direction === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col gap-2';
    return direction;
  }

  labelClasses() {
    return 'inline-flex items-center cursor-pointer';
  }

  radioClasses() {
    const base =
      'border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2';
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

