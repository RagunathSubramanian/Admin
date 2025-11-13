import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [TopbarComponent, SidebarComponent, RouterOutlet],
  template: `
    <div class="flex h-screen theme-bg-secondary">
      <!-- Sidebar -->
      <app-sidebar class="hidden md:flex" />
      
      <!-- Main Content Area -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Topbar -->
        <app-topbar />
        
        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6 theme-bg-secondary">
          <router-outlet /> 
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class AppShellComponent {}

