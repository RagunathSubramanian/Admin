import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  template: `
    <textarea
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [required]="required"
      [rows]="rows"
      [cols]="cols"
      [attr.maxlength]="maxlength"
      [class]="textareaClasses()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedBy"
    ></textarea>
  `,
  styles: [],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() rows = 4;
  @Input() cols?: number;
  @Input() maxlength?: number;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'error' = 'default';

  value = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur() {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  textareaClasses() {
    const base =
      'w-full border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y';
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

