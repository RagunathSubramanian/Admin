import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card.component';
import { ChartWrapperComponent } from '../../shared/components/chart-wrapper.component';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table.component';
import { ChartConfiguration, ChartType } from 'chart.js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import {
  DashboardDataModel,
  DashboardDataRecord,
} from '../admin/dashboard/dashboard-data.model';
import {
  DashboardQueryParams,
  DashboardService,
} from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

type NumericDashboardKey =
  | 'Total Drops'
  | 'Multi Drops'
  | 'Heavy Drops'
  | 'Walkup Drop Count'
  | 'Double Drop Count';

interface DashboardTableColumn {
  key: keyof DashboardDataRecord;
  label: string;
  type?: 'text' | 'number' | 'date';
  numeric?: boolean;
}
type PerformanceRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface GroupedDashboardRecord {
  DATE: string;
  'Total Drops': number;
  'Multi Drops': number;
  'Heavy Drops': number;
  'Walkup Drop Count': number;
  'Double Drop Count': number;
  DropCount: number;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ChartWrapperComponent,
    DataTableComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  isLoading = signal(false);
  error = signal<string | null>(null);
  dashboardData = signal<DashboardDataModel>([]);

  // Get current user email for filtering
  currentUserEmail = computed(() => this.authService.getCurrentUserEmail());

  readonly tableColumns: DashboardTableColumn[] = [
    { key: 'Timestamp', label: 'Timestamp', type: 'text' },
    { key: 'NAME', label: 'Name', type: 'text' },
    { key: 'Shift', label: 'Shift', type: 'text' },
    { key: 'Total Drops', label: 'Total Drops', type: 'number', numeric: true },
    { key: 'Multi Drops', label: 'Multi Drops', type: 'number', numeric: true },
    { key: 'Heavy Drops', label: 'Heavy Drops', type: 'number', numeric: true },
    {
      key: 'Walkup Drop Count',
      label: 'Walkup Drops',
      type: 'number',
      numeric: true,
    },
    {
      key: 'Double Drop Count',
      label: 'Double Drops',
      type: 'number',
      numeric: true,
    },
    // Note: Amount column is intentionally excluded for users
  ];

  tableFilters = signal<Record<string, string>>(
    this.tableColumns.reduce((acc, column) => {
      acc[column.key as string] = '';
      return acc;
    }, {} as Record<string, string>),
  );
  sortState = signal<{
    key: DashboardTableColumn['key'];
    direction: 'asc' | 'desc';
  } | null>(null);

  filteredTableData = computed(() => {
    const filters = this.tableFilters();
    const sort = this.sortState();
    const records = this.filteredRecords();

    const filtered = records.filter((record) =>
      this.tableColumns.every((column) => {
        const filterValue = filters[column.key as string];
        if (!filterValue) {
          return true;
        }

        const cellValue = record[column.key];
        if (cellValue === null || cellValue === undefined) {
          return false;
        }

        if (column.type === 'number') {
          const numericFilter = Number(filterValue);
          if (Number.isNaN(numericFilter)) {
            return true;
          }
          return Number(cellValue) === numericFilter;
        }

        const normalizedCell = String(cellValue).toLowerCase();
        return normalizedCell.includes(filterValue.toLowerCase());
      }),
    );

    if (!sort) {
      return filtered;
    }

    const columnMeta = this.tableColumns.find(
      (column) => column.key === sort.key,
    );

    return [...filtered].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];

      if (columnMeta?.numeric) {
        const aNumber = this.ensureNumber(aValue);
        const bNumber = this.ensureNumber(bValue);
        return sort.direction === 'asc'
          ? aNumber - bNumber
          : bNumber - aNumber;
      }

      const aString = String(aValue ?? '');
      const bString = String(bValue ?? '');
      const comparison = aString.localeCompare(bString, undefined, {
        sensitivity: 'base',
        numeric: true,
      });

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  });

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  public lineChartType: ChartType = 'line';

  public lineChartData = computed(() => {
    const records = this.filteredRecords();
    if (!records.length) {
      return this.createLineChartData([], []);
    }

    const monthlyTotals = this.groupAndSum(records, (record) =>
      record.Month || this.tryGetMonthFromDate(record.DATE),
    );

    return this.createLineChartData(
      monthlyTotals.labels,
      monthlyTotals.values,
    );
  });

  public dailyTrendsChartData = computed(() => {
    const records = this.filteredRecords();
    if (!records.length) {
      return this.createLineChartData([], [], 'Daily Drops', {
        background: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 1)',
      });
    }

    const dailyMap = new Map<string, { date: Date; value: number }>();
    
    records.forEach((record) => {
      const dateStr = record.DATE;
      if (!dateStr) return;
      
      const dateObj = this.parseRecordDate({ DATE: dateStr } as DashboardDataRecord);
      if (!dateObj) return;
      
      const dateKey = dateObj.toISOString().split('T')[0];
      
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.value += this.ensureNumber(record['Total Drops']);
      } else {
        dailyMap.set(dateKey, {
          date: dateObj,
          value: this.ensureNumber(record['Total Drops']),
        });
      }
    });

    const sortedDaily = Array.from(dailyMap.entries())
      .map(([key, data]) => ({
        label: data.date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        value: data.value,
        date: data.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return this.createLineChartData(
      sortedDaily.map((item) => item.label),
      sortedDaily.map((item) => item.value),
      'Daily Drops',
      {
        background: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 1)',
      },
    );
  });

  public dailyTrendsChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  public dailyTrendsChartType: ChartType = 'line';

  public dropTypeChartData = computed(() => {
    const records = this.filteredRecords();
    if (!records.length) {
      return this.createPieChartData([], []);
    }

    const dropTypeTotals = [
      {
        label: 'Multi Drops',
        value: this.sumNumeric(records, 'Multi Drops'),
      },
      {
        label: 'Heavy Drops',
        value: this.sumNumeric(records, 'Heavy Drops'),
      },
      {
        label: 'Walkup Drops',
        value: this.sumNumeric(records, 'Walkup Drop Count'),
      },
      {
        label: 'Double Drops',
        value: this.sumNumeric(records, 'Double Drop Count'),
      },
      {
        label: 'Single Drops',
        value: this.sumNumeric(records, 'Total Drops') -
               this.sumNumeric(records, 'Multi Drops') -
               this.sumNumeric(records, 'Heavy Drops') -
               this.sumNumeric(records, 'Walkup Drop Count') -
               this.sumNumeric(records, 'Double Drop Count'),
      },
    ];

    return this.createPieChartData(
      dropTypeTotals.map((item) => item.label),
      dropTypeTotals.map((item) => item.value),
      [
        'rgba(59, 130, 246, 0.8)',
        'rgba(126, 156, 146, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(27, 244, 172, 0.9)',
      ],
    );
  });

  public dropTypeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };
  public dropTypeChartType: ChartType = 'pie';

  totalDrops = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Total Drops'),
  );
  multiDrops = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Multi Drops'),
  );
  heavyDrops = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Heavy Drops'),
  );
  walkupDropCount = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Walkup Drop Count'),
  );
  doubleDropCount = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Double Drop Count'),
  );
  dailyTotals = computed(() => {
    const uniqueRecords = new Set(this.filteredRecords().map((record) => record.DATE));
    return uniqueRecords.size || 1;
  });
  recordsCount = computed(() => this.filteredRecords().length);

  performanceRange = signal<PerformanceRange>('month');
  customStart = signal<string | null>(null);
  customEnd = signal<string | null>(null);

  readonly rangeOptions: { label: string; value: PerformanceRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  filteredRecords = computed(() => {
    const records = this.dashboardData();
    const range = this.performanceRange();
    const customStart = this.customStart();
    const customEnd = this.customEnd();
    const userEmail = this.currentUserEmail();

    // Filter by user email
    let filteredByUser = records;
    if (userEmail) {
      const lowerUserEmail = userEmail.toLowerCase().trim();
      filteredByUser = records.filter((record) => {
        const recordEmail = (record['Email Address'] || '').toLowerCase().trim();
        const matches = recordEmail === lowerUserEmail;
        if (!matches && records.length > 0 && records.indexOf(record) === 0) {
          console.log('User Dashboard - Email mismatch:', {
            userEmail: lowerUserEmail,
            recordEmail: recordEmail,
            record: record
          });
        }
        return matches;
      });
      console.log('User Dashboard - Filtered records:', filteredByUser.length, 'out of', records.length);
    } else {
      console.warn('User Dashboard - No user email found, showing all records');
    }

    const { startDate, endDate } = this.getRangeBounds(range, customStart, customEnd);

    if (!startDate && !endDate) {
      return filteredByUser;
    }

    return filteredByUser.filter((record) => {
      const recordDate = this.parseRecordDate(record);

      if (!recordDate) {
        return false;
      }

      if (startDate && recordDate < startDate) {
        return false;
      }
      if (endDate && recordDate > endDate) {
        return false;
      }

      return true;
    });
  });

  groupedData = computed(() => {
    const records = this.filteredRecords();
    const groupedMap = new Map<string, GroupedDashboardRecord>();

    records.forEach((record) => {
      const date = record.DATE || 'Unknown';
      const key = date;

      const existing = groupedMap.get(key);
      if (existing) {
        existing['Total Drops'] += this.ensureNumber(record['Total Drops']);
        existing['Multi Drops'] += this.ensureNumber(record['Multi Drops']);
        existing['Heavy Drops'] += this.ensureNumber(record['Heavy Drops']);
        existing['Walkup Drop Count'] += this.ensureNumber(record['Walkup Drop Count']);
        existing['Double Drop Count'] += this.ensureNumber(record['Double Drop Count']);
        existing.DropCount += this.ensureNumber(record.DropCount || 0);
      } else {
        groupedMap.set(key, {
          DATE: date,
          'Total Drops': this.ensureNumber(record['Total Drops']),
          'Multi Drops': this.ensureNumber(record['Multi Drops']),
          'Heavy Drops': this.ensureNumber(record['Heavy Drops']),
          'Walkup Drop Count': this.ensureNumber(record['Walkup Drop Count']),
          'Double Drop Count': this.ensureNumber(record['Double Drop Count']),
          DropCount: this.ensureNumber(record.DropCount || 0),
        });
      }
    });

    const groupedArray = Array.from(groupedMap.values());
    
    return groupedArray.sort((a, b) => {
      const dateA = this.parseRecordDate({ DATE: a.DATE } as DashboardDataRecord);
      const dateB = this.parseRecordDate({ DATE: b.DATE } as DashboardDataRecord);
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateB.getTime() - dateA.getTime();
    });
  });

  groupedDataSignal = signal<GroupedDashboardRecord[]>([]);
  groupedTablePageSize = signal(10);

  groupedTableColumns: DataTableColumn<GroupedDashboardRecord>[] = [
    { key: 'DATE', label: 'Date', sortable: true, filterable: true },
    { 
      key: 'Total Drops', 
      label: 'Total Drops', 
      sortable: true,
      render: (row) => row['Total Drops'].toLocaleString()
    },
    { 
      key: 'Multi Drops', 
      label: 'Multi Drops', 
      sortable: true,
      render: (row) => row['Multi Drops'].toLocaleString()
    },
    { 
      key: 'Heavy Drops', 
      label: 'Heavy Drops', 
      sortable: true,
      render: (row) => row['Heavy Drops'].toLocaleString()
    },
    { 
      key: 'Walkup Drop Count', 
      label: 'Walkup Drops', 
      sortable: true,
      render: (row) => row['Walkup Drop Count'].toLocaleString()
    },
    { 
      key: 'Double Drop Count', 
      label: 'Double Drops', 
      sortable: true,
      render: (row) => row['Double Drop Count'].toLocaleString()
    },
    // Note: Amount column is intentionally excluded for users
    { 
      key: 'DropCount', 
      label: 'Drop Count', 
      sortable: true,
      render: (row) => row.DropCount.toLocaleString()
    },
  ];

  constructor() {
    // Update groupedDataSignal when groupedData changes
    effect(() => {
      const data = this.groupedData();
      this.groupedDataSignal.set(data);
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData(params?: DashboardQueryParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService
      .getDashboardData(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          console.log('User Dashboard - Data loaded:', data.length, 'records');
          console.log('User Dashboard - Current user email:', this.currentUserEmail());
          if (data.length > 0) {
            console.log('User Dashboard - Sample record email field:', data[0]['Email Address']);
            console.log('User Dashboard - All unique emails in data:', 
              [...new Set(data.map(r => r['Email Address']).filter(Boolean))]);
          }
          this.dashboardData.set(data);
        },
        error: (err) => {
          this.error.set(this.extractErrorMessage(err));
          this.dashboardData.set([]);
        },
      });
  }

  private createLineChartData(
    labels: string[],
    data: number[],
    datasetLabel = 'Total Drops',
    color: { background: string; border: string } = {
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 1)',
    },
  ): ChartConfiguration['data'] {
    return {
      datasets: [
        {
          data,
          label: datasetLabel,
          backgroundColor: color.background,
          borderColor: color.border,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color.border,
          fill: 'origin',
        },
      ],
      labels,
    };
  }

  private createPieChartData(
    labels: string[],
    data: number[],
    backgroundColors: string[] = [],
  ): ChartConfiguration['data'] {
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor:
            backgroundColors.length > 0
              ? backgroundColors
              : [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                ],
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  }

  private sumNumeric(
    records: DashboardDataModel,
    key: NumericDashboardKey,
  ): number {
    return records.reduce((total, record) => {
      const value = record[key];
      const numeric = this.ensureNumber(value);
      return total + numeric;
    }, 0);
  }

  private groupAndSum(
    records: DashboardDataModel,
    keySelector: (record: DashboardDataRecord) => string | undefined,
    valueKey: NumericDashboardKey = 'Total Drops',
  ): { labels: string[]; values: number[] } {
    const accumulator = new Map<string, number>();

    records.forEach((record) => {
      const key = keySelector(record) || 'Unknown';
      const current = accumulator.get(key) ?? 0;
      const nextValue = current + this.ensureNumber(record[valueKey]);
      accumulator.set(key, nextValue);
    });

    const labels = Array.from(accumulator.keys());
    const values = labels.map((label) => accumulator.get(label) ?? 0);

    return { labels, values };
  }

  private ensureNumber(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return 0;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private tryGetMonthFromDate(dateValue?: string): string {
    if (!dateValue) {
      return 'Unknown';
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  }

  private formatTimestamp(timestamp?: string): string {
    if (!timestamp) {
      return 'Unknown time';
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
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

    return 'Unable to load dashboard data. Please try again later.';
  }

  private getRangeBounds(
    range: PerformanceRange,
    customStart: string | null,
    customEnd: string | null,
  ): { startDate: Date | null; endDate: Date | null } {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return {
          startDate: todayStart,
          endDate: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      case 'week': {
        const start = new Date(todayStart);
        start.setDate(start.getDate() - 6);
        return { startDate: start, endDate: now };
      }
      case 'month':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: now,
        };
      case 'year':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: now,
        };
      case 'custom': {
       const startDate = customStart ? new Date(new Date(customStart).setHours(0, 0, 0, 0)) : null;
        const endDate = customEnd ? new Date(new Date(customEnd).setHours(0, 0, 0, 0)) : null;
        return { startDate, endDate };
    }
      default:
        return { startDate: null, endDate: null };
    }
  }

  private parseRecordDate(record: DashboardDataRecord): Date | null {
    const source = record.DATE || record.Timestamp;
    if (!source) {
      return null;
    }
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  applyCustomRange(): void {
    if (this.isCustomRangeValid()) {
      this.performanceRange.set('custom');
    }
  }

  isCustomRangeValid = computed(() => {
    const start = this.customStart();
    const end = this.customEnd();

    if (!start || !end) {
      return false;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate <= endDate;
  });

  setRange(range: PerformanceRange): void {
    this.performanceRange.set(range);
    if (range !== 'custom') {
      this.customStart.set(null);
      this.customEnd.set(null);
    }
  }

  updateCustomStart(value: string): void {
    this.customStart.set(value || null);
  }

  updateCustomEnd(value: string): void {
    this.customEnd.set(value || null);
  }

  updateFilter(columnKey: DashboardTableColumn['key'], value: string): void {
    this.tableFilters.update((filters) => ({
      ...filters,
      [columnKey as string]: value,
    }));
  }

  clearFilters(): void {
    this.tableFilters.set(
      this.tableColumns.reduce((acc, column) => {
        acc[column.key as string] = '';
        return acc;
      }, {} as Record<string, string>),
    );
  }

  toggleSort(columnKey: DashboardTableColumn['key']): void {
    this.sortState.update((current) => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }

      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }

      return null;
    });
  }

  getSortDirection(columnKey: DashboardTableColumn['key']): 'asc' | 'desc' | null {
    return this.sortState()?.key === columnKey ? this.sortState()!.direction : null;
  }

  getFilterValue(columnKey: DashboardTableColumn['key']): string {
    return this.tableFilters()[columnKey as string] ?? '';
  }

  formatCellValue(
    record: DashboardDataRecord,
    column: DashboardTableColumn,
  ): string {
    const value = record[column.key];
    if (value === null || value === undefined) {
      return '—';
    }

    if (column.key === 'Timestamp') {
      return this.formatTimestamp(String(value));
    }

    return String(value);
  }

  trackByRecord = (index: number, record: DashboardDataRecord) =>
    record.Timestamp || record.FIN || index;
}

