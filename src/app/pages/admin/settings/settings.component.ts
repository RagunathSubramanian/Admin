import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field.component';
import { UserConfigService } from '../../../core/services/user-config.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="mt-1 text-sm text-gray-500">Manage your account settings and user configurations.</p>
      </div>

      @if (isAdmin()) {
        <app-card title="User Configuration">
          <p class="mb-4 text-sm text-gray-600">
            Configure admin and user emails. Admin emails have full access to all features. 
            User emails can access Dashboard and Performance pages but only see their own data without Amount fields.
          </p>
          
          <form [formGroup]="userConfigForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Admin Emails
              </label>
              <div formArrayName="adminEmails" class="space-y-2">
                @for (emailControl of adminEmailsArray.controls; track $index) {
                  <div class="flex gap-2">
                    <input
                      type="email"
                      [formControl]="$any(emailControl)"
                      placeholder="admin@example.com"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      (click)="removeAdminEmail($index)"
                      class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                }
              </div>
              <button
                type="button"
                (click)="addAdminEmail()"
                class="mt-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50"
              >
                + Add Admin Email
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                User Emails
              </label>
              <div formArrayName="userEmails" class="space-y-2">
                @for (emailControl of userEmailsArray.controls; track $index) {
                  <div class="flex gap-2">
                    <input
                      type="email"
                      [formControl]="$any(emailControl)"
                      placeholder="user@example.com"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      (click)="removeUserEmail($index)"
                      class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                }
              </div>
              <button
                type="button"
                (click)="addUserEmail()"
                class="mt-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50"
              >
                + Add User Email
              </button>
            </div>

            <div class="flex justify-end gap-3">
              <app-button variant="secondary" (click)="resetConfig()">
                Reset to Default
              </app-button>
              <app-button variant="primary" (click)="saveUserConfig()" [disabled]="isSaving()">
                {{ isSaving() ? 'Saving...' : 'Save Configuration' }}
              </app-button>
            </div>
          </form>
        </app-card>
      }

      <app-card title="Profile Settings">
        <form [formGroup]="profileForm" class="space-y-6">
          <app-form-field label="Name" inputId="name">
            <input
              id="name"
              type="text"
              formControlName="name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field label="Email" inputId="email">
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <div class="flex justify-end">
            <app-button variant="primary" (click)="saveProfile()">
              Save Changes
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  styles: [],
})
export class SettingsComponent {
  private readonly userConfigService = inject(UserConfigService);
  private readonly authService = inject(AuthService);
  
  profileForm: FormGroup;
  userConfigForm: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  
  isAdmin = computed(() => this.authService.isAdmin());
  
  get adminEmailsArray(): FormArray {
    return this.userConfigForm.get('adminEmails') as FormArray;
  }
  
  get userEmailsArray(): FormArray {
    return this.userConfigForm.get('userEmails') as FormArray;
  }

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['John Doe'],
      email: ['john@example.com'],
    });

    // Initialize user config form
    this.userConfigForm = this.fb.group({
      adminEmails: this.fb.array([]),
      userEmails: this.fb.array([]),
    });

    // Load current configuration
    effect(() => {
      const config = this.userConfigService.config();
      this.loadConfigIntoForm(config);
    });
  }

  private loadConfigIntoForm(config: { adminEmails: string[]; userEmails: string[] }): void {
    // Clear existing arrays
    while (this.adminEmailsArray.length) {
      this.adminEmailsArray.removeAt(0);
    }
    while (this.userEmailsArray.length) {
      this.userEmailsArray.removeAt(0);
    }

    // Add admin emails
    config.adminEmails.forEach(email => {
      this.adminEmailsArray.push(this.fb.control(email, [Validators.required, Validators.email]));
    });

    // Add user emails
    config.userEmails.forEach(email => {
      this.userEmailsArray.push(this.fb.control(email, [Validators.required, Validators.email]));
    });

    // Ensure at least one admin email
    if (this.adminEmailsArray.length === 0) {
      this.addAdminEmail();
    }
  }

  addAdminEmail(): void {
    this.adminEmailsArray.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  removeAdminEmail(index: number): void {
    if (this.adminEmailsArray.length > 1) {
      this.adminEmailsArray.removeAt(index);
    }
  }

  addUserEmail(): void {
    this.userEmailsArray.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  removeUserEmail(index: number): void {
    this.userEmailsArray.removeAt(index);
  }

  saveUserConfig(): void {
    if (this.userConfigForm.valid) {
      this.isSaving.set(true);
      
      const adminEmails = this.adminEmailsArray.controls
        .map(control => control.value?.trim().toLowerCase())
        .filter(email => email);
      
      const userEmails = this.userEmailsArray.controls
        .map(control => control.value?.trim().toLowerCase())
        .filter(email => email);

      this.userConfigService.saveConfig({
        adminEmails,
        userEmails,
      });

      // Reload the form to reflect saved state
      setTimeout(() => {
        this.isSaving.set(false);
        alert('Configuration saved successfully!');
      }, 500);
    } else {
      this.userConfigForm.markAllAsTouched();
    }
  }

  resetConfig(): void {
    if (confirm('Are you sure you want to reset to default configuration? This will remove all custom admin and user emails.')) {
      this.userConfigService.resetToDefault();
    }
  }

  saveProfile() {
    // TODO: Save profile settings
    console.log('Saving profile:', this.profileForm.value);
  }
}

