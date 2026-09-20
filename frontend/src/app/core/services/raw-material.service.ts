import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RawMaterial } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RawMaterialService {
  private base = `${environment.apiUrl}/raw-materials`;
  constructor(private http: HttpClient) {}

  list(): Observable<RawMaterial[]> { return this.http.get<RawMaterial[]>(this.base); }
  get(id: number): Observable<RawMaterial> { return this.http.get<RawMaterial>(`${this.base}/${id}`); }
  create(payload: any): Observable<RawMaterial> { return this.http.post<RawMaterial>(this.base, payload); }
  update(id: number, payload: any): Observable<RawMaterial> { return this.http.put<RawMaterial>(`${this.base}/${id}`, payload); }
  restock(id: number, quantity: number, note?: string): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(`${this.base}/${id}/restock`, { quantity, note });
  }
  adjust(id: number, quantity: number, note?: string): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(`${this.base}/${id}/adjust`, { quantity, note });
  }
  deactivate(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
