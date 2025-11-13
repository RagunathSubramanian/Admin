import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

/**
 * API Service with mock adapter
 * TODO: Replace mock implementation with actual HTTP calls
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = signal<string>('/api'); // TODO: Configure from environment
  private useMock = signal<boolean>(true); // Toggle to switch between mock and real API

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    if (this.useMock()) {
      return this.mockGet<T>(endpoint, params);
    }

    const httpParams = this.buildParams(params);
    return this.http
      .get<T>(`${this.baseUrl()}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    if (this.useMock()) {
      return this.mockPost<T>(endpoint, body);
    }

    return this.http
      .post<T>(`${this.baseUrl()}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    if (this.useMock()) {
      return this.mockPut<T>(endpoint, body);
    }

    return this.http
      .put<T>(`${this.baseUrl()}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    if (this.useMock()) {
      return this.mockDelete<T>(endpoint);
    }

    return this.http
      .delete<T>(`${this.baseUrl()}${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Mock GET implementation
   */
  private mockGet<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    console.log('Mock GET:', endpoint, params);
    const payload = this.resolveMockGet(endpoint, params);

    return of((payload ?? ({} as T)) as T).pipe(delay(300));
  }

  /**
   * Mock POST implementation
   */
  private mockPost<T>(endpoint: string, body: any): Observable<T> {
    console.log('Mock POST:', endpoint, body);
    return of(body as T).pipe(delay(300));
  }

  /**
   * Mock PUT implementation
   */
  private mockPut<T>(endpoint: string, body: any): Observable<T> {
    console.log('Mock PUT:', endpoint, body);
    return of(body as T).pipe(delay(300));
  }

  /**
   * Mock DELETE implementation
   */
  private mockDelete<T>(endpoint: string): Observable<T> {
    console.log('Mock DELETE:', endpoint);
    return of({} as T).pipe(delay(300));
  }

  private resolveMockGet(endpoint: string, params?: Record<string, unknown>): unknown {
    switch (endpoint) {
      case '/dashboard/data':
        return this.getDashboardDataMock(params);
      default:
        return {};
    }
  }

  private getDashboardDataMock(params?: Record<string, unknown>) {
    const data = [
      {
        Timestamp: '2025-01-15T08:30:00Z',
        NAME: 'Alice Johnson',
        FIN: 'FIN001',
        DATE: '2025-01-15',
        'Total Drops': 45,
        'Multi Drops': 12,
        'Heavy Drops': 6,
        'Upload Way Sheet Photo': 'https://example.com/waybills/FIN001.jpg',
        Shift: 'Morning',
        'Walkup Drop Count': 10,
        'Double Drop Count': 4,
        'Email Address': 'alice.johnson@example.com',
        TotalDrops: 45,
        Amount: 3250,
        Month: 'Jan 2025',
      },
      {
        Timestamp: '2025-01-22T16:45:00Z',
        NAME: 'Brian Lee',
        FIN: 'FIN002',
        DATE: '2025-01-22',
        'Total Drops': 52,
        'Multi Drops': 18,
        'Heavy Drops': 9,
        'Upload Way Sheet Photo': 'https://example.com/waybills/FIN002.jpg',
        Shift: 'Evening',
        'Walkup Drop Count': 14,
        'Double Drop Count': 6,
        'Email Address': 'brian.lee@example.com',
        TotalDrops: 52,
        Amount: 4120,
        Month: 'Jan 2025',
      },
      {
        Timestamp: '2025-02-10T09:15:00Z',
        NAME: 'Carla Mendes',
        FIN: 'FIN003',
        DATE: '2025-02-10',
        'Total Drops': 48,
        'Multi Drops': 15,
        'Heavy Drops': 7,
        'Upload Way Sheet Photo': 'https://example.com/waybills/FIN003.jpg',
        Shift: 'Morning',
        'Walkup Drop Count': 11,
        'Double Drop Count': 5,
        'Email Address': 'carla.mendes@example.com',
        TotalDrops: 48,
        Amount: 3585,
        Month: 'Feb 2025',
      },
      {
        Timestamp: '2025-02-18T13:20:00Z',
        NAME: 'Dev Patel',
        FIN: 'FIN004',
        DATE: '2025-02-18',
        'Total Drops': 55,
        'Multi Drops': 20,
        'Heavy Drops': 11,
        'Upload Way Sheet Photo': 'https://example.com/waybills/FIN004.jpg',
        Shift: 'Afternoon',
        'Walkup Drop Count': 16,
        'Double Drop Count': 7,
        'Email Address': 'dev.patel@example.com',
        TotalDrops: 55,
        Amount: 4390,
        Month: 'Feb 2025',
      },
      {
        Timestamp: '2025-03-05T07:50:00Z',
        NAME: 'Ella Martinez',
        FIN: 'FIN005',
        DATE: '2025-03-05',
        'Total Drops': 61,
        'Multi Drops': 22,
        'Heavy Drops': 13,
        'Upload Way Sheet Photo': 'https://example.com/waybills/FIN005.jpg',
        Shift: 'Morning',
        'Walkup Drop Count': 18,
        'Double Drop Count': 8,
        'Email Address': 'ella.martinez@example.com',
        TotalDrops: 61,
        Amount: 4685,
        Month: 'Mar 2025',
      },
    ];

    return this.filterDashboardDataMock(data, params);
  }

  private filterDashboardDataMock(
    data: Array<Record<string, any>>,
    params?: Record<string, unknown>,
  ) {
    if (!params) {
      return data;
    }

    let filtered = [...data];

    const month = params['month'];
    if (month) {
      const monthQuery = String(month).toLowerCase();
      filtered = filtered.filter((record) =>
        String(record['Month']).toLowerCase().includes(monthQuery),
      );
    }

    const shift = params['shift'];
    if (shift) {
      const shiftQuery = String(shift).toLowerCase();
      filtered = filtered.filter((record) =>
        String(record['Shift']).toLowerCase() === shiftQuery,
      );
    }

    const email = params['email'];
    if (email) {
      const emailQuery = String(email).toLowerCase();
      filtered = filtered.filter((record) =>
        String(record['Email Address']).toLowerCase().includes(emailQuery),
      );
    }

    const startDate = params['startDate']
      ? new Date(String(params['startDate']))
      : null;
    const endDate = params['endDate']
      ? new Date(String(params['endDate']))
      : null;

    if (startDate || endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record['DATE']);
        if (Number.isNaN(recordDate.getTime())) {
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
    }

    return filtered;
  }

  /**
   * Build HTTP params from object
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  /**
   * Get default headers
   */
  private getHeaders(): HttpHeaders {
    // TODO: Add auth token if available
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    // TODO: Implement proper error handling
    return throwError(() => error);
  };
}

