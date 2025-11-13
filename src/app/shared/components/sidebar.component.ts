import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: SidebarNavItem[];
}

@Component({
  selector: 'app-shared-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      [class]="sidebarClasses()"
      role="navigation"
      [attr.aria-label]="ariaLabel"
    >
      <!-- Logo/Brand -->
      @if (logo || brand) {
        <div [class]="logoClasses()">
          @if (logo) {
            <img [src]="logo" [alt]="brand || 'Logo'" class="h-8" />
          } @else {
            <h1 [class]="brandClasses()">{{ brand }}</h1>
          }
        </div>
      }

      <!-- Navigation Items -->
      <nav [class]="navClasses()" [attr.aria-label]="navAriaLabel">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            [routerLinkActive]="activeLinkClasses"
            [routerLinkActiveOptions]="{ exact: exactMatch }"
            [class]="linkClasses()"
            [attr.aria-current]="isActive(item.route) ? 'page' : null"
          >
            <svg
              class="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              [attr.aria-hidden]="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="item.icon"
              />
            </svg>
            <span class="font-medium">{{ item.label }}</span>
            @if (item.badge && item.badge > 0) {
              <span
                class="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700"
                [attr.aria-label]="item.badge + ' notifications'"
              >
                {{ item.badge }}
              </span>
            }
          </a>
        }
      </nav>

      <!-- Footer -->
      @if (footer) {
        <div [class]="footerClasses()">
          <ng-content select="[footer]" />
        </div>
      }
    </aside>
  `,
  styles: [],
})
export class SharedSidebarComponent {
  @Input() navItems: SidebarNavItem[] = [];
  @Input() logo?: string;
  @Input() brand?: string;
  @Input() footer = false;
  @Input() width = 'w-64';
  @Input() ariaLabel = 'Main navigation';
  @Input() navAriaLabel = 'Main navigation';
  @Input() exactMatch = false;
  @Input() activeLinkClasses = 'bg-primary-50 text-primary-700 border-primary-500';

  activeRoute = signal<string>('');

  constructor(private router: Router) {
    // Track active route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.activeRoute.set(navEnd.urlAfterRedirects);
      });
  }

  isActive(route: string): boolean {
    return this.activeRoute().startsWith(route);
  }

  sidebarClasses() {
    return `${this.width} bg-white border-r border-gray-200 flex flex-col`;
  }

  logoClasses() {
    return 'p-6 border-b border-gray-200';
  }

  brandClasses() {
    return 'text-xl font-bold text-gray-900';
  }

  navClasses() {
    return 'flex-1 p-4 space-y-1';
  }

  linkClasses() {
    return 'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors border-l-4 border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
  }

  footerClasses() {
    return 'p-4 border-t border-gray-200';
  }
}

