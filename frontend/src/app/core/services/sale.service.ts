import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, SaleRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private base = `${environment.apiUrl}/sales`;
  constructor(private http: HttpClient) {}

  checkout(payload: SaleRequest): Observable<Sale> { return this.http.post<Sale>(`${this.base}/checkout`, payload); }
  get(id: number): Observable<Sale> { return this.http.get<Sale>(`${this.base}/${id}`); }
  byDateRange(from: string, to: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.base, { params: { from, to } });
  }
}
