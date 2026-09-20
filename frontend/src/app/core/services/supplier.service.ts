import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Supplier } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private base = `${environment.apiUrl}/suppliers`;
  constructor(private http: HttpClient) {}

  list(): Observable<Supplier[]> { return this.http.get<Supplier[]>(this.base); }
  create(payload: Partial<Supplier>): Observable<Supplier> { return this.http.post<Supplier>(this.base, payload); }
  update(id: number, payload: Partial<Supplier>): Observable<Supplier> { return this.http.put<Supplier>(`${this.base}/${id}`, payload); }
}
