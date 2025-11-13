import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconButtonComponent } from '../shared/components/icon-button.component';
import { AvatarComponent } from '../shared/components/avatar.component';
import { ThemeToggleComponent } from '../shared/components/theme-toggle.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconButtonComponent, AvatarComponent, ThemeToggleComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent {
  // TODO: Replace with actual user data from AuthService
  currentUser = signal({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
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

  // TODO: Implement logout
  logout() {
    console.log('Logout clicked');
  }
}

