import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { FormFieldComponent } from '../../shared/components/form-field.component';

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
        <p class="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>

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

      <app-card title="Preferences">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p class="text-sm text-gray-500">Receive email notifications about your account activity.</p>
            </div>
            <input
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [],
})
export class SettingsComponent {
  profileForm: FormGroup;
  isLoading = signal(false);

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['John Doe'],
      email: ['john@example.com'],
    });
  }

  saveProfile() {
    // TODO: Save profile settings
    console.log('Saving profile:', this.profileForm.value);
  }
}

