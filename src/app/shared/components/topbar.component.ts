import { Component, Input, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconButtonComponent } from './icon-button.component';
import { AvatarComponent } from './avatar.component';

export interface TopbarUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface TopbarNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

@Component({
  selector: 'app-shared-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconButtonComponent, AvatarComponent],
  template: `
    <header
      [class]="headerClasses()"
      role="banner"
      [attr.aria-label]="ariaLabel"
    >
      <div class="flex items-center justify-between">
        <!-- Left Section -->
        <div class="flex items-center gap-4">
          @if (showMenuToggle) {
            <button
              type="button"
              (click)="menuToggle.emit()"
              class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              [attr.aria-label]="'Toggle menu'"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          }
          @if (title) {
            <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
          }
          <ng-content select="[left]" />
        </div>

        <!-- Center Section -->
        @if (showSearch) {
          <div class="flex-1 max-w-md mx-4">
            <div class="relative">
              <input
                type="text"
                [placeholder]="searchPlaceholder"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg
                class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        }

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <ng-content select="[right]" />

          @if (showNotifications) {
            <div class="relative">
              <div class="relative">
                <app-icon-button
                  (onClick)="toggleNotifications()"
                  ariaLabel="Notifications"
                >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                @if (notificationsCount() > 0) {
                  <span
                    class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                    [attr.aria-label]="notificationsCount() + ' notifications'"
                  >
                    {{ notificationsCount() }}
                  </span>
                }
              </app-icon-button>
              </div>

              @if (showNotificationsDropdown()) {
                <div
                  class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  role="menu"
                >
                  <div class="p-4 border-b border-gray-200">
                    <h3 class="text-sm font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    @if (notifications().length === 0) {
                      <div class="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    } @else {
                      @for (
                        notification of notifications();
                        track notification.id
                      ) {
                        <div
                          class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          (click)="onNotificationClick(notification)"
                        >
                          <p class="text-sm font-medium text-gray-900">
                            {{ notification.title }}
                          </p>
                          <p class="text-sm text-gray-500 mt-1">
                            {{ notification.message }}
                          </p>
                          <p class="text-xs text-gray-400 mt-1">
                            {{ notification.time }}
                          </p>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          }

          @if (currentUser()) {
            <div class="relative">
              <button
                type="button"
                (click)="toggleUserMenu()"
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                [attr.aria-label]="'User menu'"
              >
                <app-avatar
                  [imageUrl]="currentUser()?.avatar"
                  [name]="currentUser()?.name || ''"
                  size="sm"
                />
                <span class="text-sm font-medium text-gray-700 hidden md:block">
                  {{ currentUser()?.name }}
                </span>
              </button>

              @if (showUserMenuDropdown()) {
                <div
                  class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  role="menu"
                >
                  <div class="p-2">
                    <div class="px-3 py-2 border-b border-gray-200">
                      <p class="text-sm font-medium text-gray-900">
                        {{ currentUser()?.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ currentUser()?.email }}
                      </p>
                    </div>
                    <ng-content select="[user-menu]" />
                    <button
                      type="button"
                      (click)="onLogout()"
                      class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class SharedTopbarComponent {
  @Input() title?: string;
  @Input() currentUser = signal<TopbarUser | null>(null);
  @Input() notifications = signal<TopbarNotification[]>([]);
  @Input() showSearch = false;
  @Input() showNotifications = true;
  @Input() showMenuToggle = false;
  @Input() searchPlaceholder = 'Search...';
  @Input() ariaLabel = 'Top navigation bar';

  notificationsCount = computed(() =>
    this.notifications().filter((n) => !n.read).length
  );
  showNotificationsDropdown = signal(false);
  showUserMenuDropdown = signal(false);

  searchQuery = '';
  search = output<string>();
  menuToggle = output<void>();
  logout = output<void>();
  notificationClick = output<TopbarNotification>();

  toggleNotifications() {
    this.showNotificationsDropdown.update((val) => !val);
    this.showUserMenuDropdown.set(false);
  }

  toggleUserMenu() {
    this.showUserMenuDropdown.update((val) => !val);
    this.showNotificationsDropdown.set(false);
  }

  onSearchChange() {
    this.search.emit(this.searchQuery);
  }

  onNotificationClick(notification: TopbarNotification) {
    this.notificationClick.emit(notification);
    this.showNotificationsDropdown.set(false);
  }

  onLogout() {
    this.logout.emit();
    this.showUserMenuDropdown.set(false);
  }

  headerClasses() {
    return 'bg-white border-b border-gray-200 px-6 py-4';
  }
}

