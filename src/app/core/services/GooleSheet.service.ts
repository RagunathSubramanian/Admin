import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GoogleSheetService {
    private apiKey = 'AIzaSyCwUWaiG1pYHF1qu_gnF1cyY1FswgEO2mE';
    private spreadsheetId = '1KY3faotBq8hZo6QgV21CcvNm10uabSa2eKzoFgGFVGA';
    private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

    constructor(private http: HttpClient) {}

    getSheetData<T>(sheetName: string): Observable<T[]> {
        const range = `${sheetName}`;
        const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;

        return this.http.get<{ values: T[] }>(url).pipe(
            map(response => response.values || [])
        );
    }

    getSheetDataByRange(sheetName: string, range: string): Observable<any[]> {
        const fullRange = `${sheetName}!${range}`;
        const url = `${this.baseUrl}/${this.spreadsheetId}/values/${fullRange}?key=${this.apiKey}`;

        return this.http.get<any>(url).pipe(
            map(response => response.values || [])
        );
    }

 get<T>(sheetName: string, params?: Record<string, any>): Observable<T> {
     const range = `${sheetName}`;
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
     return this.http
       .get<T>(url)
       .pipe(catchError(this.handleError));
   }

   private handleError(error: any) {
     return throwError(() => error);
   }
}