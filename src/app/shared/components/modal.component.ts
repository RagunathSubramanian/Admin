import {
  Component,
  Input,
  output,
  effect,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="onBackdropClick()"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="descriptionId"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            aria-hidden="true"
          ></div>

          <!-- Modal Panel -->
          <div
            #modalPanel
            class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 transform transition-all"
            (click)="$event.stopPropagation()"
            role="document"
          >
            <!-- Header -->
            @if (title) {
              <div class="mb-4">
                <h2 [id]="titleId" class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </h2>
                @if (description) {
                  <p [id]="descriptionId" class="mt-1 text-sm text-gray-500">
                    {{ description }}
                  </p>
                }
              </div>
            }

            <!-- Content -->
            <div class="mb-4">
              <ng-content />
            </div>

            <!-- Footer -->
            @if (showFooter) {
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  (click)="onCancel()"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  (click)="onConfirm()"
                >
                  {{ confirmText }}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() description?: string;
  @Input() showFooter = true;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() closeOnBackdrop = true;

  @ViewChild('modalPanel') modalPanel?: ElementRef<HTMLDivElement>;

  close = output<void>();
  confirm = output<void>();

  titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;

  private previousActiveElement?: HTMLElement;
  private focusableElements: HTMLElement[] = [];

  constructor() {
    effect(() => {
      if (this.isOpen) {
        this.trapFocus();
      } else {
        this.releaseFocus();
      }
    });
  }

  ngAfterViewInit() {
    if (this.isOpen) {
      this.trapFocus();
    }
  }

  ngOnDestroy() {
    this.releaseFocus();
  }

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }

  private trapFocus() {
    // Store previous active element
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Get all focusable elements within modal
    if (this.modalPanel?.nativeElement) {
      const focusableSelectors =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      this.focusableElements = Array.from(
        this.modalPanel.nativeElement.querySelectorAll<HTMLElement>(
          focusableSelectors
        )
      );

      // Focus first element
      if (this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      }

      // Trap keyboard navigation
      this.modalPanel.nativeElement.addEventListener('keydown', this.handleKeyDown);
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  private releaseFocus() {
    // Remove keyboard trap
    if (this.modalPanel?.nativeElement) {
      this.modalPanel.nativeElement.removeEventListener('keydown', this.handleKeyDown);
    }

    // Restore previous focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    } else if (event.key === 'Escape') {
      this.close.emit();
    }
  };
}

