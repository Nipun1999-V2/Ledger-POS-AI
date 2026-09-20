import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CatalogType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private base = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) {}

  list(type?: CatalogType): Observable<Category[]> {
    return this.http.get<Category[]>(this.base, { params: type ? { type } : {} });
  }
  create(payload: Partial<Category>): Observable<Category> { return this.http.post<Category>(this.base, payload); }
}
