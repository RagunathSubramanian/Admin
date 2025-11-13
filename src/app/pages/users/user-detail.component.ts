import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    AvatarComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <app-button variant="ghost" routerLink="/users">
            ← Back
          </app-button>
          <h1 class="text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <app-button variant="primary">Edit User</app-button>
      </div>

      @if (loading()) {
        <div class="text-center py-8">
          <p class="text-gray-500">Loading user...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <app-card>
            <div class="text-center">
              <app-avatar [name]="user()?.name || ''" [size]="'xl'" />
              <h2 class="mt-4 text-xl font-semibold text-gray-900">
                {{ user()?.name }}
              </h2>
              <p class="text-sm text-gray-500">{{ user()?.email }}</p>
              <div class="mt-4">
                <app-badge
                  [variant]="user()?.status === 'active' ? 'success' : 'default'"
                >
                  {{ user()?.status }}
                </app-badge>
              </div>
            </div>
          </app-card>

          <div class="lg:col-span-2 space-y-6">
            <app-card title="Information">
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">ID</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ user()?.id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Role</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ user()?.role }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Status</dt>
                  <dd class="mt-1">
                    <app-badge
                      [variant]="user()?.status === 'active' ? 'success' : 'default'"
                    >
                      {{ user()?.status }}
                    </app-badge>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ user()?.createdAt }}
                  </dd>
                </div>
              </dl>
            </app-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class UserDetailComponent implements OnInit {
  user = signal<any>(null);
  loading = signal(true);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // TODO: Load user from API
    setTimeout(() => {
      this.user.set({
        id: id,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
        createdAt: '2024-01-15',
      });
      this.loading.set(false);
    }, 500);
  }
}

