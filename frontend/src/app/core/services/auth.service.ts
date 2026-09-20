import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'pos_token';
  private userKey = 'pos_user';

  private loggedIn = signal<boolean>(!!localStorage.getItem(this.tokenKey));
  private currentRole = signal<string>(localStorage.getItem(this.userKey)
    ? JSON.parse(localStorage.getItem(this.userKey)!).role
    : '');

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res));
        this.loggedIn.set(true);
        this.currentRole.set(res.role);
      }));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.loggedIn.set(false);
    this.currentRole.set('');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  role(): string {
    return this.currentRole();
  }

  currentUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }
}
