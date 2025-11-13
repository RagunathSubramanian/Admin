import { Component, Input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from './table.component';
import { ButtonComponent } from './button.component';
import { FormFieldComponent } from './form-field.component';
import { CardComponent } from './card.component';

export interface DataTableColumn<T = any> extends TableColumn<T> {
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: any }[];
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    FormFieldComponent,
    CardComponent,
  ],
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      @if (showToolbar) {
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            @if (searchable) {
              <div class="w-64">
                <app-form-field>
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="onSearchChange()"
                    placeholder="Search..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </app-form-field>
              </div>
            }
            @if (selectable) {
              <div class="text-sm text-gray-600">
                {{ selectedRows().length }} selected
              </div>
            }
          </div>
          <div class="flex items-center gap-2">
            <ng-content select="[toolbar]" />
          </div>
        </div>
      }

      <!-- Filters -->
      @if (showFilters && filterableColumns().length > 0) {
        <div class="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          @for (column of filterableColumns(); track column.key) {
            <div class="flex-1 min-w-[200px]">
              <app-form-field [label]="column.label">
                @if (column.filterType === 'select' && column.filterOptions) {
                  <select
                    [(ngModel)]="filters()[column.key]"
                    (ngModelChange)="onFilterChange()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All</option>
                    @for (option of column.filterOptions; track option.value) {
                      <option [value]="option.value">{{ option.label }}</option>
                    }
                  </select>
                } @else {
                  <input
                    type="text"
                    [(ngModel)]="filters()[column.key]"
                    (ngModelChange)="onFilterChange()"
                    [placeholder]="'Filter by ' + column.label"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                }
              </app-form-field>
            </div>
          }
        </div>
      }

      <!-- Table -->
      <app-card>
        <app-table
          [columns]="tableColumns()"
          [data]="filteredDataSignal"
          [pagination]="pagination"
          [pageSize]="pageSize"
          [totalItems]="totalItems"
          [emptyMessage]="emptyMessage"
          [ariaLabel]="ariaLabel"
          [trackByFn]="trackByFn"
          (sortChange)="onSortChange($event)"
          (pageChange)="onPageChange($event)"
        />
      </app-card>

      <!-- Actions -->
      @if (actions && actions.length > 0 && selectedRows().length > 0) {
        <div class="flex items-center gap-2 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <span class="text-sm font-medium text-primary-900">
            {{ selectedRows().length }} item(s) selected
          </span>
          <div class="flex gap-2 ml-auto">
            @for (action of actions; track action.label) {
              <app-button
                [variant]="action.variant || 'secondary'"
                size="sm"
                (onClick)="handleAction(action)"
              >
                {{ action.label }}
              </app-button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class DataTableComponent<T = any> {
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() data = signal<T[]>([]);
  @Input() pagination = true;
  @Input() pageSize = signal(10);
  @Input() totalItems = signal(0);
  @Input() emptyMessage = 'No data available';
  @Input() ariaLabel = 'Data table';
  @Input() trackByFn: (index: number, item: T) => any = (index) => index;
  @Input() searchable = true;
  @Input() showToolbar = true;
  @Input() showFilters = false;
  @Input() selectable = false;
  @Input() actions?: DataTableAction<T>[];

  rowSelect = output<T[]>();
  sortChange = output<{ column: string; direction: 'asc' | 'desc' | null }>();
  pageChange = output<number>();

  searchQuery = signal('');
  filters = signal<Record<string, any>>({});
  selectedRows = signal<T[]>([]);

  filterableColumns = computed(() =>
    this.columns.filter((col) => col.filterable)
  );

  tableColumns = computed(() =>
    this.columns.map((col) => ({
      key: col.key,
      label: col.label,
      sortable: col.sortable,
      render: col.render,
    }))
  );

  filteredData = computed(() => {
    let result = this.data();

    // Apply search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter((row) => {
        return this.columns.some((col) => {
          const value = this.getCellValue(row, col);
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply filters
    const activeFilters = this.filters();
    Object.keys(activeFilters).forEach((key) => {
      const filterValue = activeFilters[key];
      if (filterValue) {
        result = result.filter((row) => {
          const cellValue = (row as any)[key];
          return String(cellValue).toLowerCase().includes(
            String(filterValue).toLowerCase()
          );
        });
      }
    });

    return result;
  });

  filteredDataSignal = signal<T[]>([]);

  constructor() {
    // Update filteredDataSignal when filteredData changes
    effect(() => {
      const data = this.filteredData();
      this.filteredDataSignal.set(data);
    });
  }

  onSearchChange() {
    // Triggered by ngModelChange - the effect will handle the update
  }

  onFilterChange() {
    // Triggered by ngModelChange
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' | null }) {
    this.sortChange.emit(event);
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  handleAction(action: DataTableAction<T>) {
    this.selectedRows().forEach((row) => {
      if (!action.show || action.show(row)) {
        action.onClick(row);
      }
    });
  }

  private getCellValue(row: T, column: DataTableColumn<T>): string {
    if (column.render) {
      return column.render(row);
    }
    return (row as any)[column.key] || '';
  }
}

