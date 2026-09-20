import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  list(): Observable<AppUser[]> { return this.http.get<AppUser[]>(this.base); }
  create(payload: any): Observable<AppUser> { return this.http.post<AppUser>(this.base, payload); }
  deactivate(id: number): Observable<void> { return this.http.put<void>(`${this.base}/${id}/deactivate`, {}); }
}
