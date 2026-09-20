import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <div class="panel">
        <div class="mark">◆</div>
        <h1>Ledger POS</h1>
        <p class="sub">Online point-of-sale &amp; raw material inventory</p>

        <form (ngSubmit)="submit()">
          <label>Username</label>
          <input [(ngModel)]="username" name="username" autocomplete="username" />

          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" />

          <div class="error" *ngIf="error">{{ error }}</div>

          <button type="submit" [disabled]="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
        </form>

        <p class="hint">Default admin: <b>admin</b> / <b>Admin&#64;123</b></p>
      </div>
    </div>
  `,
  styles: [`
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--ink); }
    .panel { width: 360px; background: var(--surface); border-radius: 14px; padding: 36px 32px; box-shadow: var(--shadow-2); }
    .mark { color: var(--amber); font-size: 26px; margin-bottom: 4px; }
    h1 { font-size: 20px; }
    .sub { color: var(--text-muted); font-size: 13px; margin: 0 0 24px; }
    label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin: 14px 0 6px; }
    input {
      width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
      font-size: 14px; font-family: inherit;
    }
    input:focus { outline: 2px solid var(--cobalt); outline-offset: 1px; }
    button {
      margin-top: 22px; width: 100%; padding: 11px; background: var(--cobalt); color: #fff;
      border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;
    }
    button:disabled { opacity: 0.6; cursor: default; }
    .error { color: var(--alert-red); font-size: 13px; margin-top: 12px; }
    .hint { margin-top: 18px; font-size: 12px; color: var(--text-muted); text-align: center; }
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.username || !this.password) { return; }
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: () => { this.loading = false; this.error = 'Invalid username or password.'; },
    });
  }
}
