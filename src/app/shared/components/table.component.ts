import { Component, Input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => string;
}

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styles: [],
})
export class TableComponent<T = any> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data = signal<T[]>([]);
  @Input() pagination = false;
  @Input() pageSize = signal(10);
  @Input() totalItems = signal(0);
  @Input() emptyMessage = 'No data available';
  @Input() ariaLabel = 'Data table';
  @Input() trackByFn: (index: number, item: T) => any = (index) => index;

  // Expose Math to template
  Math = Math;

  sortColumn = signal<string | null>(null);
  sortDirection = signal<SortDirection>(null);
  currentPage = signal(1);

  sortChange = output<{ column: string; direction: SortDirection }>();
  pageChange = output<number>();

  totalPages = signal(1);

  constructor() {
    // Calculate total pages when inputs change
    // TODO: Use effect() in Angular 19 to reactively update
    this.updateTotalPages();
  }

  private updateTotalPages() {
    const total = this.totalItems();
    const size = this.pageSize();
    this.totalPages.set(Math.ceil(total / size) || 1);
  }

  handleSort(column: string) {
    if (this.sortColumn() === column) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else if (this.sortDirection() === 'desc') {
        this.sortColumn.set(null);
        this.sortDirection.set(null);
      } else {
        this.sortDirection.set('asc');
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.sortChange.emit({
      column: this.sortColumn() || '',
      direction: this.sortDirection(),
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.pageChange.emit(page);
  }

  getCellValue(row: T, column: TableColumn<T>): string {
    if (column.render) {
      return column.render(row);
    }
    return (row as any)[column.key] || '';
  }
}

