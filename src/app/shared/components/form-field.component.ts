import { Component, Input, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4">
      @if (label) {
        <label
          [for]="inputId"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {{ label }}
          @if (required) {
            <span class="text-red-500" aria-label="required">*</span>
          }
        </label>
      }
      <div class="relative">
        <ng-content />
      </div>
      @if (hint) {
        <p class="mt-1 text-sm text-gray-500" [id]="hintId">{{ hint }}</p>
      }
      @if (error) {
        <p class="mt-1 text-sm text-red-600" [id]="errorId" role="alert">
          {{ error }}
        </p>
      }
    </div>
  `,
  styles: [],
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() required = false;
  @Input() inputId?: string;

  @ContentChild(NgControl) control?: NgControl;

  hintId = `hint-${Math.random().toString(36).substr(2, 9)}`;
  errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
}

