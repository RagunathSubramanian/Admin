import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../shared/components/card.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { TableComponent, TableColumn } from '../../shared/components/table.component';
import { ApiService } from '../../core/services/api.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    TableComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  pageSize = signal(10);
  totalItems = signal(0);

  columns: TableColumn<User>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) => user.status,
    },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      const userData: User[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          status: 'active' as const,
          createdAt: '2024-01-15',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'User',
          status: 'active' as const,
          createdAt: '2024-01-20',
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'User',
          status: 'inactive' as const,
          createdAt: '2024-02-01',
        },
      ];
      this.users.set(userData);
      this.totalItems.set(userData.length);
      this.loading.set(false);
    }, 500);
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' | null }) {
    // TODO: Implement sorting
    console.log('Sort:', event);
  }

  trackByUserId(index: number, user: User) {
    return user.id;
  }
}

