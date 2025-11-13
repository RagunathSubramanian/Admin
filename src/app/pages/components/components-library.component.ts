import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  AvatarComponent,
  ModalComponent,
  InputComponent,
  SelectComponent,
  TextareaComponent,
  CheckboxComponent,
  RadioGroupComponent,
  TableComponent,
  DataTableComponent,
  ChartWrapperComponent,
  IconButtonComponent,
  FormFieldComponent,
} from '../../shared/components';
import { ChartConfiguration, ChartType } from 'chart.js';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-components-library',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    AvatarComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    CheckboxComponent,
    RadioGroupComponent,
    TableComponent,
    DataTableComponent,
    ChartWrapperComponent,
    IconButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './components-library.component.html',
  styleUrls: ['./components-library.component.css'],
})
export class ComponentsLibraryComponent {
  showModal = signal(false);
  demoForm: FormGroup;

  // Table data
  tableData = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
  ]);

  tableColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  // Select options
  selectOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  // Radio options
  radioOptions = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];

  // Chart data
  chartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      textInput: [''],
      emailInput: [''],
      selectInput: [''],
      textareaInput: [''],
      checkboxInput: [false],
      radioInput: [''],
    });
  }

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    console.log('Form submitted:', this.demoForm.value);
  }
}

