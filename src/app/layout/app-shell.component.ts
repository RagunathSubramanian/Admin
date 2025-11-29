import { Component, signal, effect } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [TopbarComponent, SidebarComponent, RouterOutlet],
  template: `
    <div class="flex h-screen theme-bg-secondary">
      <!-- Mobile Sidebar Overlay -->
      @if (isMobileMenuOpen()) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          (click)="closeMobileMenu()"
          aria-hidden="true"
        ></div>
      }
      
      <!-- Sidebar -->
      <app-sidebar
        [class]="isMobileMenuOpen() ? 'fixed inset-y-0 left-0 z-50 md:flex' : 'hidden md:flex'"
        (menuItemClick)="closeMobileMenu()"
      />
      
      <!-- Main Content Area -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Topbar -->
        <app-topbar 
          [mobileMenuOpen]="isMobileMenuOpen()" 
          (toggleMobileMenu)="toggleMobileMenu()" 
        />
        
        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6 theme-bg-secondary">
          <router-outlet /> 
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class AppShellComponent {
  isMobileMenuOpen = signal(false);

  constructor(private router: Router) {
    // Close mobile menu when route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((val) => !val);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}

