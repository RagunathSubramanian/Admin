import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardDataModel } from '../dashboard/dashboard-data.model';
import { UserPerformancePanelComponent } from './user-performance-panel.component';

@Component({
  selector: 'app-user-performance',
  standalone: true,
  imports: [CommonModule, UserPerformancePanelComponent],
  templateUrl: './user-performance.component.html',
})
export class UserPerformanceComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  error = signal<string | null>(null);
  performanceData = signal<DashboardDataModel>([]);

  ngOnInit(): void {
    this.loadPerformanceData();
  }

  private loadPerformanceData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService
      .getDashboardData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          console.log('User Performance - Data loaded:', data.length, 'records');
          if (data.length > 0) {
            console.log('User Performance - Sample record email field:', data[0]['Email Address']);
            console.log('User Performance - All unique emails in data:', 
              [...new Set(data.map(r => r['Email Address']).filter(Boolean))]);
          }
          this.performanceData.set(data);
        },
        error: (err) => {
          this.error.set(this.extractErrorMessage(err));
          this.performanceData.set([]);
        },
      });
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }
    return 'Unable to load performance data. Please try again later.';
  }
}

