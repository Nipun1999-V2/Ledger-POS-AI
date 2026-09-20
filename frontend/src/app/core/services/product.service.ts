import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/products`;
  constructor(private http: HttpClient) {}

  list(): Observable<Product[]> { return this.http.get<Product[]>(this.base); }
  get(id: number): Observable<Product> { return this.http.get<Product>(`${this.base}/${id}`); }
  create(payload: any): Observable<Product> { return this.http.post<Product>(this.base, payload); }
  update(id: number, payload: any): Observable<Product> { return this.http.put<Product>(`${this.base}/${id}`, payload); }
  restock(id: number, quantity: number, note?: string): Observable<Product> {
    return this.http.post<Product>(`${this.base}/${id}/restock`, { quantity, note });
  }
  adjust(id: number, quantity: number, note?: string): Observable<Product> {
    return this.http.post<Product>(`${this.base}/${id}/adjust`, { quantity, note });
  }
  deactivate(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
