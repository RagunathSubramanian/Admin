import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card.component';
import { ChartWrapperComponent } from '../../shared/components/chart-wrapper.component';
import { ChartConfiguration, ChartType } from 'chart.js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import {
  DashboardDataModel,
  DashboardDataRecord,
} from './dashboard-data.model';
import {
  DashboardQueryParams,
  DashboardService,
} from '../../core/services/dashboard.service';

type NumericDashboardKey =
  | 'Total Drops'
  | 'Multi Drops'
  | 'Heavy Drops'
  | 'Walkup Drop Count'
  | 'Double Drop Count'
  | 'Amount';

interface DashboardTableColumn {
  key: keyof DashboardDataRecord;
  label: string;
  type?: 'text' | 'number' | 'date';
  numeric?: boolean;
}
type PerformanceRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface EmployeeAggregate {
  totalDrops: number;
  multiDrops: number;
  heavyDrops: number;
  walkupDrops: number;
  amount: number;
  count: number;
  shifts: Set<string>;
  latestRecord: DashboardDataRecord;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ChartWrapperComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  isLoading = signal(false);
  error = signal<string | null>(null);
  dashboardData = signal<DashboardDataModel>([]);
  readonly underperformerThreshold = 80;

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
    { key: 'Amount', label: 'Amount', type: 'number', numeric: true },
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

  public lineChartData: ChartConfiguration['data'] = this.createLineChartData(
    [],
    [],
  );

  public barChartData: ChartConfiguration['data'] = this.createBarChartData(
    [],
    [],
  );

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  public barChartType: ChartType = 'bar';

  public dropsPerEmployeeChartData: ChartConfiguration['data'] =
    this.createBarChartData([], [], 'Drops per Employee', {
      background: 'rgba(147, 51, 234, 0.8)',
      border: 'rgba(147, 51, 234, 1)',
    });
  public dropsPerEmployeeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  public dropsPerEmployeeChartType: ChartType = 'bar';

  public dropTypeChartData: ChartConfiguration['data'] = this.createPieChartData(
    [],
    [],
  );
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

  public averageDropsTrendChartData: ChartConfiguration['data'] =
    this.createLineChartData([], [], 'Average Drops per Employee');
  public averageDropsTrendChartOptions: ChartConfiguration['options'];
  public averageDropsTrendChartType: ChartType = 'line';

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
  totalAmount = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Amount'),
  );
  doubleDropCount = computed(() =>
    this.sumNumeric(this.filteredRecords(), 'Double Drop Count'),
  );
  activeEmployee = computed(() =>{
    const uniqueRecords = new Set(this.filteredRecords().map((record) => record.NAME)); // Use a unique field like 'NAME'
    return uniqueRecords.size;
});
dailyTotals = computed(() =>{
    const uniqueRecords = new Set(this.filteredRecords().map((record) => record.DATE)); // Use a unique field like 'NAME'
    return uniqueRecords.size;
});
  recordsCount = computed(() => this.filteredRecords().length);

  recentActivities = computed(() => {
    const records = this.filteredRecords();
    return records.slice(0, 5).map((record, index) => ({
      id:
        record.Timestamp ||
        record.FIN ||
        record['Email Address'] ||
        `${index}`,
      user: record.NAME?.trim() || 'Unknown driver',
      action: `${this.ensureNumber(record['Total Drops'])} drops • Shift ${record.Shift || 'N/A'}`,
      time: this.formatTimestamp(record.Timestamp || record.DATE),
    }));
  });

  constructor() {
    this.averageDropsTrendChartOptions = {
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
  }

  topPerformer = computed(() => {
    const records = this.filteredRecords();
    if (!records.length) {
      return null;
    }

    const aggregates = Array.from(
      this.aggregateByEmployee(records).entries(),
    );
    if (!aggregates.length) {
      return null;
    }

    const [name, stats] = aggregates.reduce(
      (best, current) =>
        current[1].totalDrops > best[1].totalDrops ? current : best,
      aggregates[0],
    );

    const average = stats.count > 0 ? stats.totalDrops / stats.count : 0;

    return {
      name,
      totalDrops: stats.totalDrops,
      averageDrops: average,
      shifts: Array.from(stats.shifts),
      latest: stats.latestRecord,
    };
  });

  underperformingEmployees = computed(() => {
    const records = this.filteredRecords();
    if (!records.length) {
      return [];
    }

    const aggregates = this.aggregateByEmployee(records);
    return Array.from(aggregates.entries())
      .map(([name, stats]) => {
        const average =
          stats.count > 0 ? stats.totalDrops / stats.count : 0;
        return {
          name,
          averageDrops: average,
          totalDrops: stats.totalDrops,
          shifts: Array.from(stats.shifts),
        };
      })
      .filter((item) => item.averageDrops < this.underperformerThreshold)
      .sort((a, b) => a.averageDrops - b.averageDrops);
  });

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
          this.dashboardData.set(data);
         
          this.updateCharts(this.dashboardData());
        },
        error: (err) => {
          this.error.set(this.extractErrorMessage(err));
          this.dashboardData.set([]);
          this.updateCharts([]);
        },
      });
  }

  private updateCharts(records: DashboardDataModel): void {
    if (!records.length) {
      this.lineChartData = this.createLineChartData([], []);
      this.barChartData = this.createBarChartData([], []);
      return;
    }

    const monthlyTotals = this.groupAndSum(records, (record) =>
      record.Month || this.tryGetMonthFromDate(record.DATE),
    );

    this.lineChartData = this.createLineChartData(
      monthlyTotals.labels,
      monthlyTotals.values,
    );

    const shiftTotals = this.groupAndSum(
      records,
      (record) => record.Shift || 'Unassigned',
      'Walkup Drop Count',
    );

    this.barChartData = this.createBarChartData(
      shiftTotals.labels,
      shiftTotals.values,
      'Walkup Drops',
      {
        background: 'rgba(59, 130, 246, 0.8)',
        border: 'rgba(59, 130, 246, 1)',
      },
    );

    this.updateOperationsCharts(records);
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

  private createBarChartData(
    labels: string[],
    data: number[],
    datasetLabel = 'Walkup Drops',
    color: { background: string; border: string } = {
      background: 'rgba(59, 130, 246, 0.8)',
      border: 'rgba(59, 130, 246, 1)',
    },
  ): ChartConfiguration['data'] {
    return {
      labels,
      datasets: [
        {
          data,
          label: datasetLabel,
          backgroundColor: color.background,
          borderColor: color.border,
          borderWidth: 1,
        },
      ],
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

    if (column.key === 'Amount') {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(this.ensureNumber(value));
    }

    if (column.key === 'Timestamp') {
      return this.formatTimestamp(String(value));
    }

    return String(value);
  }

  trackByRecord = (index: number, record: DashboardDataRecord) =>
    record.Timestamp || record.FIN || index;

  private updateOperationsCharts(records: DashboardDataModel): void {
    if (!records.length) {
      this.dropsPerEmployeeChartData = this.createBarChartData([], [], 'Drops per Employee', {
        background: 'rgba(147, 51, 234, 0.8)',
        border: 'rgba(147, 51, 234, 1)',
      });
      this.dropTypeChartData = this.createPieChartData([], []);
      this.averageDropsTrendChartData = this.createLineChartData(
        [],
        [],
        'Average Drops per Employee',
      );
      return;
    }

    const employeeTotals = this.groupAndSum(
      records,
      (record) => record.NAME?.trim() || 'Unknown',
      'Total Drops',
    );

    this.dropsPerEmployeeChartData = this.createBarChartData(
      employeeTotals.labels,
      employeeTotals.values,
      'Drops per Employee',
      {
        background: 'rgba(147, 51, 234, 0.8)',
        border: 'rgba(147, 51, 234, 1)',
      },
    );

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

    this.dropTypeChartData = this.createPieChartData(
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

    const monthlyAverages = this.groupMonthlyAverages(records);
    this.averageDropsTrendChartData = this.createLineChartData(
      monthlyAverages.labels,
      monthlyAverages.values,
      'Average Drops per Employee',
      {
        background: 'rgba(34, 197, 94, 0.15)',
        border: 'rgba(34, 197, 94, 1)',
      },
    );
  }

  private groupMonthlyAverages(
    records: DashboardDataModel,
  ): { labels: string[]; values: number[] } {
    const accumulator = new Map<
      string,
      { totalDrops: number; employees: Set<string> }
    >();

    records.forEach((record) => {
      const label = record.Month || this.tryGetMonthFromDate(record.DATE);
      const key = label || 'Unknown';
      const entry =
        accumulator.get(key) ?? {
          totalDrops: 0,
          employees: new Set<string>(),
        };

      entry.totalDrops += this.ensureNumber(record['Total Drops']);
      entry.employees.add(record.NAME?.trim() || 'Unknown');
      accumulator.set(key, entry);
    });

    const labels = Array.from(accumulator.keys());
    const values = labels.map((label) => {
      const entry = accumulator.get(label);
      if (!entry) {
        return 0;
      }

      const employeeCount = entry.employees.size || 1;
      return entry.totalDrops / employeeCount;
    });

    return { labels, values };
  }

  private aggregateByEmployee(
    records: DashboardDataModel,
  ): Map<string, EmployeeAggregate> {
    const map = new Map<string, EmployeeAggregate>();

    records.forEach((record) => {
      const name = record.NAME?.trim() || 'Unknown';
      const entry =
        map.get(name) ?? {
          totalDrops: 0,
          multiDrops: 0,
          heavyDrops: 0,
          walkupDrops: 0,
          amount: 0,
          count: 0,
          shifts: new Set<string>(),
          latestRecord: record,
        };

      entry.totalDrops += this.ensureNumber(record['Total Drops']);
      entry.multiDrops += this.ensureNumber(record['Multi Drops']);
      entry.heavyDrops += this.ensureNumber(record['Heavy Drops']);
      entry.walkupDrops += this.ensureNumber(record['Walkup Drop Count']);
      entry.amount += this.ensureNumber(record.Amount);
      entry.count += 1;
      if (record.Shift) {
        entry.shifts.add(record.Shift);
      }
      entry.latestRecord = record;

      map.set(name, entry);
    });

    return map;
  }

 //#region Performance Filter
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

  const { startDate, endDate } = this.getRangeBounds(range, customStart, customEnd);

  if (!startDate && !endDate) {
    return records;
  }

  return records.filter((record) => {
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
//#endregion

}

