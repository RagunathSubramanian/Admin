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
import { PerformancePanelComponent } from './performance-panel.component';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, PerformancePanelComponent],
  templateUrl: './performance.component.html',
})
export class PerformanceComponent implements OnInit {
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
          this.performanceData.set(this.convertSheetToJson(data));
        },
        error: (err) => {
          this.error.set(this.extractErrorMessage(err));
          this.performanceData.set([]);
        },
      });
  }
convertSheetToJson(sheetData: any): any[] {
  const values: any[][] = sheetData && Array.isArray(sheetData.values) ? sheetData.values : [];
  if (values.length === 0) return [];

  const headers = values[0].map(h => h ? String(h).trim() : '');
  const dataRows = values.slice(1); // skip headers

  // Map each row to an object using headers
  return dataRows.map(row => {
    const obj: any = {};
    headers.forEach((key, i) => {
      if(row[i] !== undefined && row[i] !== null && String(row[i]).trim() !== '') {
      obj[key || `col_${i+1}`] = row[i] !== undefined ? row[i] : '';
      }
    });
    
    return obj;
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


