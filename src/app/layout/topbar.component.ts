import { Component, signal, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconButtonComponent } from '../shared/components/icon-button.component';
import { AvatarComponent } from '../shared/components/avatar.component';
import { ThemeToggleComponent } from '../shared/components/theme-toggle.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconButtonComponent, AvatarComponent, ThemeToggleComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);
  
  @Input() mobileMenuOpen: boolean = false;
  @Output() toggleMobileMenu = new EventEmitter<void>();

  // Get current user from AuthService
  currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      return {
        name: user.name,
        email: user.email,
        avatar: '',
      };
    }
    return {
      name: 'Guest',
      email: '',
      avatar: '',
    };
  });

  notificationsCount = signal(3);
  showNotifications = signal(false);
  showUserMenu = signal(false);

  toggleNotifications() {
    this.showNotifications.update((val) => !val);
    this.showUserMenu.set(false);
  }

  toggleUserMenu() {
    this.showUserMenu.update((val) => !val);
    this.showNotifications.set(false);
  }

  onMobileMenuClick(): void {
    this.toggleMobileMenu.emit();
  }

  logout() {
    this.authService.logout();
    this.showUserMenu.set(false);
  }
}

