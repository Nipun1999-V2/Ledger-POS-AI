import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalyticsReport } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/ai/reports`;
  constructor(private http: HttpClient) {}

  today(): Observable<AnalyticsReport> { return this.http.get<AnalyticsReport>(`${this.base}/today`); }
  thisWeek(): Observable<AnalyticsReport> { return this.http.get<AnalyticsReport>(`${this.base}/this-week`); }
  thisMonth(): Observable<AnalyticsReport> { return this.http.get<AnalyticsReport>(`${this.base}/this-month`); }
  custom(start: string, end: string): Observable<AnalyticsReport> {
    return this.http.get<AnalyticsReport>(`${this.base}/custom`, { params: { start, end } });
  }
}
