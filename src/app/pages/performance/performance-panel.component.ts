import {
  Component,
  Input,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartType } from 'chart.js';

import {
  DashboardDataModel,
  DashboardDataRecord,
} from '../dashboard/dashboard-data.model';
import { CardComponent } from '../../shared/components/card.component';
import { ChartWrapperComponent } from '../../shared/components/chart-wrapper.component';
//import { DataTableComponent } from '@app/shared/components';

type PerformanceRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DashboardTableColumn {
  key: keyof DashboardDataRecord;
  label: string;
  type?: 'text' | 'number' | 'date';
  numeric?: boolean;
}

interface EmployeeSummary {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  totalDrops: number;
  averageDropsPerDay: number;
  hireDate: Date | null;
  percentageOfTotal: number;
  trendDirection: 'up' | 'down' | 'flat';
  dailyTotals: Map<string, number>;
  dropTypes: Record<string, number>;
  shifts: string[];
  amount: number;
  averageAmountPerDay: number;
  multiDrops: number;
  heavyDrops: number;
  walkupDrops: number;
  doubleDrops: number;
  records: DashboardDataRecord[];
}

@Component({
  selector: 'app-performance-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ChartWrapperComponent,
   //  DataTableComponent
    ],
  templateUrl: './performance-panel.component.html',
})
export class PerformancePanelComponent {
  private readonly avatarPalette = [
    '#2563eb',
    '#16a34a',
    '#ea580c',
    '#9333ea',
    '#0ea5e9',
    '#f97316',
    '#dc2626',
    '#14b8a6',
  ];

  private recordsSignal = signal<DashboardDataModel>([]);

   tabledata = signal<DashboardDataModel>([]);

  @Input()
  set records(value: DashboardDataModel) {
    this.recordsSignal.set(Array.isArray(value) ? value : []);
        this.tabledata.set( this.filteredTableData() || []);
  }

  performanceRange = signal<PerformanceRange>('month');
  customStart = signal<string | null>(null);
  customEnd = signal<string | null>(null);
  selectedEmployeeId = signal<string | null>(null);

  readonly rangeOptions: { label: string; value: PerformanceRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];



  filteredRecords = computed(() => {
    const records = this.recordsSignal();
    const range = this.performanceRange();
    const customStart = this.customStart();
    const customEnd = this.customEnd();

    const { startDate, endDate } = this.getRangeBounds(
      range,
      customStart,
      customEnd,
    );

    if (!startDate && !endDate) {
      return records;
    }

    var data = records.filter((record) => {
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

    
    return data;
  });

  employeeSummaries = computed<EmployeeSummary[]>(() => {
    const records = this.filteredRecords();
    if (!records.length) {
      return [];
    }

    const aggregates = new Map<
      string,
      {
        id: string;
        name: string;
        initials: string;
        totalDrops: number;
        hireDate: Date | null;
        dailyTotals: Map<string, number>;
        dropTypes: Record<string, number>;
        shifts: Set<string>;
        amount: number;
        multiDrops: number;
        heavyDrops: number;
        walkupDrops: number;
        doubleDrops: number;
        records: DashboardDataRecord[];
      }
    >();

    records.forEach((record) => {
      const id = record.FIN || record.NAME || `employee-${record.Timestamp}`;
      const name = record.NAME?.trim() || 'Unknown';
      const initials = this.getInitials(name);

      const aggregate =
        aggregates.get(id) ||
        {
          id,
          name,
          initials,
          totalDrops: 0,
          hireDate: null,
          dailyTotals: new Map<string, number>(),
          dropTypes: {
            'Multi Drops': 0,
            'Heavy Drops': 0,
            'Walkup Drop Count': 0,
            'Double Drop Count': 0,
          },
          shifts: new Set<string>(),
          amount: 0,
          multiDrops: 0,
          heavyDrops: 0,
          walkupDrops: 0,
          doubleDrops: 0,
          records: [],
        };

      const recordDate = this.parseRecordDate(record);
      if (recordDate) {
        aggregate.hireDate = this.getEarlierDate(aggregate.hireDate, recordDate);
        const key = this.formatDateKey(recordDate);
        const currentValue = aggregate.dailyTotals.get(key) ?? 0;
        aggregate.dailyTotals.set(
          key,
          currentValue + this.ensureNumber(record['Total Drops']),
        );
      }

      aggregate.totalDrops += this.ensureNumber(record['Total Drops']);
      aggregate.amount += this.ensureNumber(record.Amount);
      aggregate.multiDrops += this.ensureNumber(record['Multi Drops']);
      aggregate.heavyDrops += this.ensureNumber(record['Heavy Drops']);
      aggregate.walkupDrops += this.ensureNumber(record['Walkup Drop Count']);
      aggregate.doubleDrops += this.ensureNumber(record['Double Drop Count']);
      aggregate.dropTypes['Multi Drops'] += this.ensureNumber(
        record['Multi Drops'],
      );
      aggregate.dropTypes['Heavy Drops'] += this.ensureNumber(
        record['Heavy Drops'],
      );
      aggregate.dropTypes['Walkup Drop Count'] += this.ensureNumber(
        record['Walkup Drop Count'],
      );
      aggregate.dropTypes['Double Drop Count'] += this.ensureNumber(
        record['Double Drop Count'],
      );
      if (record.Shift) {
        aggregate.shifts.add(record.Shift);
      }
      aggregate.records.push(record);

      aggregates.set(id, aggregate);
    });

    const entries = Array.from(aggregates.values());
    const totalDrops = entries.reduce((sum, item) => sum + item.totalDrops, 0);
    const averageDrops = entries.length ? totalDrops / entries.length : 0;

    return entries
      .map((entry, index) => {
        const daysCovered = entry.dailyTotals.size || 1;
        const averagePerDay = entry.totalDrops / daysCovered;
        const averageAmountPerDay = entry.amount / daysCovered;
        const trendDirection: EmployeeSummary['trendDirection'] =
          entry.totalDrops > averageDrops
            ? 'up'
            : entry.totalDrops < averageDrops
            ? 'down'
            : 'flat';
        return {
          id: entry.id,
          name: entry.name,
          initials: entry.initials,
          avatarColor: this.avatarPalette[index % this.avatarPalette.length],
          totalDrops: entry.totalDrops,
          averageDropsPerDay: averagePerDay,
          averageAmountPerDay: averageAmountPerDay,
          hireDate: entry.hireDate,
          percentageOfTotal: totalDrops ? entry.totalDrops / totalDrops : 0,
          trendDirection,
          dailyTotals: entry.dailyTotals,
          dropTypes: entry.dropTypes,
          shifts: Array.from(entry.shifts),
          amount: entry.amount,
          multiDrops: entry.multiDrops,
          heavyDrops: entry.heavyDrops,
          walkupDrops: entry.walkupDrops,
          doubleDrops: entry.doubleDrops,
          records: entry.records,
        };
      })
      .sort((a, b) => b.totalDrops - a.totalDrops);
  });

  selectedEmployee = computed(() => {
    const selectedId = this.selectedEmployeeId();
    const employees = this.employeeSummaries();

    if (!employees.length) {
      return null;
    }

    if (selectedId) {
      const found = employees.find((employee) => employee.id === selectedId);
      if (found) {
        return found;
      }
    }

    return employees[0];
  });

  employeeTrendChartData = computed<ChartConfiguration['data']>(() => {
    const employee = this.selectedEmployee();
    if (!employee) {
      return this.createLineChartData([], [], 'Daily Drops', {
        background: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 1)',
      });
    }

    const labels = Array.from(employee.dailyTotals.keys()).sort();
    const displayLabels = labels.map((label) =>
      this.formatDisplayDate(label),
    );
    const values = labels.map((label) => employee.dailyTotals.get(label) ?? 0);

    return this.createLineChartData(displayLabels, values, 'Daily Drops', {
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 1)',
    });
  });

  employeeTrendChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.4,
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

  employeeDropTypeChartData = computed<ChartConfiguration['data']>(() => {
    const employee = this.selectedEmployee();
    if (!employee) {
      return this.createPieChartData([], []);
    }

    const entries = Object.entries(employee.dropTypes).filter(
      ([, value]) => this.ensureNumber(value) > 0,
    );

    if (!entries.length) {
      return this.createPieChartData([], []);
    }

    return this.createPieChartData(
      entries.map(([label]) => label),
      entries.map(([, value]) => value),
      [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
    );
  });

  employeeDropTypeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  employeeShiftChartData = computed<ChartConfiguration['data']>(() => {
    const employee = this.selectedEmployee();
    if (!employee) {
      return this.createBarChartData([], [], 'Drops by Shift');
    }

    const shiftTotals = this.groupAndSum(
      employee.records,
      (record) => record.Shift || 'Unassigned',
      'Total Drops',
    );

    return this.createBarChartData(
      shiftTotals.labels,
      shiftTotals.values,
      'Drops by Shift',
      {
        background: 'rgba(22, 163, 74, 0.8)',
        border: 'rgba(22, 163, 74, 1)',
      },
    );
  });

  employeeShiftChartOptions: ChartConfiguration['options'] = {
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

  isCustomRangeValid = computed(() => {
    const start = this.customStart();
    const end = this.customEnd();

    if (!start || !end) {
      return false;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
     startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
    return startDate <= endDate;
  });

  readonly lineChartType: ChartType = 'line';
  readonly pieChartType: ChartType = 'pie';
  readonly barChartType: ChartType = 'bar';

  constructor() {
    effect(() => {
      const employees = this.employeeSummaries();
      const currentId = this.selectedEmployeeId();
      if (!employees.length) {
        if (currentId !== null) {
          this.selectedEmployeeId.set(null);
        }
        return;
      }

      const exists = currentId
        ? employees.some((employee) => employee.id === currentId)
        : false;

      if (!exists) {
        this.selectedEmployeeId.set(employees[0].id);
      }
    });
  }

  setRange(range: PerformanceRange): void {
    this.performanceRange.set(range);
    this.tabledata.set(this.filteredTableData() || []); 
    if (range !== 'custom') {
      this.customStart.set(null);
      this.customEnd.set(null);
    }
  }

  applyCustomRange(): void {
    if (this.isCustomRangeValid()) {
      this.performanceRange.set('custom');
    }
  }

  updateCustomStart(value: string): void {
    this.customStart.set(value || null);
     this.customStart.set(value || null);
    
  }

  updateCustomEnd(value: string): void {
    this.customEnd.set(value || null);
  }

  selectEmployee(id: string): void {
    this.selectedEmployeeId.set(id);
    this.tabledata.set(this.filteredTableData() || []);

  }

  trackByEmployeeId(index: number, employee: EmployeeSummary): string {
    return employee.id;
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

  private getInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private ensureNumber(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private getEarlierDate(current: Date | null, candidate: Date): Date {
    if (!current) {
      return candidate;
    }
    return candidate < current ? candidate : current;
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDisplayDate(key: string): string {
    const date = new Date(key);
    if (Number.isNaN(date.getTime())) {
      return key;
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  private createLineChartData(
    labels: string[],
    data: number[],
    datasetLabel: string,
    color: { background: string; border: string },
  ): ChartConfiguration['data'] {
    return {
      labels,
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
    };
  }

  private createBarChartData(
    labels: string[],
    data: number[],
    datasetLabel: string,
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

  private groupAndSum(
    records: DashboardDataRecord[],
    keySelector: (record: DashboardDataRecord) => string,
    valueKey: keyof DashboardDataRecord,
  ): { labels: string[]; values: number[] } {
    const accumulator = new Map<string, number>();

    records.forEach((record) => {
      const key = keySelector(record) || 'Unknown';
      const current = accumulator.get(key) ?? 0;
      const value = this.ensureNumber(record[valueKey]);
      accumulator.set(key, current + value);
    });

    const labels = Array.from(accumulator.keys());
    const values = labels.map((label) => accumulator.get(label) ?? 0);

    return { labels, values };
  }

  getTrendIcon(direction: 'up' | 'down' | 'flat'): string {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  }

  getTrendClasses(direction: 'up' | 'down' | 'flat'): string {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  }


  //#region  Dattable 
  recordsCount = computed(() => this.filteredRecords().length);
  readonly tableColumns: DashboardTableColumn[] = [
      { key: 'DATE', label: 'Date', type: 'text' },
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

    readonly BydaytableColumns: DashboardTableColumn[] = [
      { key: 'DATE', label: 'Date', type: 'text' },
      { key: 'NAME', label: 'Name', type: 'text' },
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

      return this.selectedEmployee()?.records || [];
      // const filters = this.tableFilters();
      // const sort = this.sortState();
      // const employee = this.selectedEmployee();
      // const records = employee?.records || [];
      
  
      // const filtered = records.filter((record) =>
      //   this.tableColumns.every((column) => {
      //     const filterValue = filters[column.key as string];
      //     if (!filterValue) {
      //       return true;
      //     }
  
      //     const cellValue = record[column.key];
      //     if (cellValue === null || cellValue === undefined) {
      //       return false;
      //     }
  
      //     if (column.type === 'number') {
      //       const numericFilter = Number(filterValue);
      //       if (Number.isNaN(numericFilter)) {
      //         return true;
      //       }
      //       return Number(cellValue) === numericFilter;
      //     }
  
      //     const normalizedCell = String(cellValue).toLowerCase();
      //     return normalizedCell.includes(filterValue.toLowerCase());
      //   }),
      // );
  
      // if (!sort) {
      //   return filtered;
      // }
  
      // const columnMeta = this.tableColumns.find(
      //   (column) => column.key === sort.key,
      // );
  
      // return [...filtered].sort((a, b) => {
      //   const aValue = a[sort.key];
      //   const bValue = b[sort.key];
  
      //   if (columnMeta?.numeric) {
      //     const aNumber = this.ensureNumber(aValue);
      //     const bNumber = this.ensureNumber(bValue);
      //     return sort.direction === 'asc'
      //       ? aNumber - bNumber
      //       : bNumber - aNumber;
      //   }
  
      //   const aString = String(aValue ?? '');
      //   const bString = String(bValue ?? '');
      //   const comparison = aString.localeCompare(bString, undefined, {
      //     sensitivity: 'base',
      //     numeric: true,
      //   });
  
      //   return sort.direction === 'asc' ? comparison : -comparison;
      // });
    });


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
        currency: 'SGD',
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
  //#endregion
}

 
