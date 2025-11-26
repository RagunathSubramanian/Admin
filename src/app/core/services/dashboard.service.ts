import { inject, Injectable } from '@angular/core';
import { map, Observable, pipe } from 'rxjs';

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
  

  getDashboardData(params?: DashboardQueryParams): Observable<DashboardDataModel> {
    return this.googleSheetService.get<any[][]>('data').pipe(
      map((sheetData) => this.mapSheetDataToDashboardDataModel(sheetData))
    );
  }

private mapSheetDataToDashboardDataModel(sheetData: any): DashboardDataModel {
  // Normalize input: sheetData can be an array of arrays or an object with a 'values' array
  const values: any[][] = Array.isArray(sheetData)
    ? sheetData
    : (sheetData && Array.isArray(sheetData.values) ? sheetData.values : []);

  if (!values || values.length === 0) return [] as unknown as DashboardDataModel;
  const [headers, ...rows] = values;
  return rows.map((row) => {
    const mappedRow: any = {};
    headers.forEach((key: string, index: number) => {
      mappedRow[key] = row[index] || null;
    });
    return mappedRow as DashboardDataModel[number]; // Use the correct type for individual records
  }) as unknown as DashboardDataModel;
}
}

