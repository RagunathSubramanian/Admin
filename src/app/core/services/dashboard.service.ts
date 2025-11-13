import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardDataModel } from '../../pages/dashboard/dashboard-data.model';
import { ApiService } from './api.service';
import { GoogleSheetService } from './GooleSheet.service'; 

export interface DashboardQueryParams {
  month?: string;
  shift?: string;
  startDate?: string;
  endDate?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);
    private readonly googleSheetService = inject(GoogleSheetService);
  private readonly endpoint = '/dashboard/data';
  

  getDashboardData(params?: DashboardQueryParams): Observable<any[]> {
    // return this.api.get<any[]>(this.endpoint, params);

    return this.googleSheetService.get<any[]>("data");
  }
}

