import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockAlert } from '../models/models';

@Injectable({ providedIn: 'root' })
export class StockAlertService {
  private base = `${environment.apiUrl}/stock-alerts`;
  constructor(private http: HttpClient) {}

  open(): Observable<StockAlert[]> { return this.http.get<StockAlert[]>(this.base); }
  history(): Observable<StockAlert[]> { return this.http.get<StockAlert[]>(`${this.base}/history`); }
  resolve(id: number): Observable<StockAlert> { return this.http.post<StockAlert>(`${this.base}/${id}/resolve`, {}); }
}
