import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ForecastItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private base = `${environment.apiUrl}/ai/forecast`;
  constructor(private http: HttpClient) {}

  all(): Observable<ForecastItem[]> { return this.http.get<ForecastItem[]>(this.base); }
  topSellers(limit = 5): Observable<ForecastItem[]> {
    return this.http.get<ForecastItem[]>(`${this.base}/top-sellers`, { params: { limit } });
  }
}
