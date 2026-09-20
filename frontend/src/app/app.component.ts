import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else bare">
      <div class="shell">
        <aside class="nav">
          <div class="brand">
            <span class="brand-mark">◆</span>
            <div>
              <div class="brand-name">Ledger POS</div>
              <div class="brand-sub">{{ auth.role() }}</div>
            </div>
          </div>

          <nav>
            <a routerLink="/dashboard" routerLinkActive="active"><span class="material-icons">Dashboard</span></a>
            <a routerLink="/pos" routerLinkActive="active" class="pos-link"><span class="material-icons">Sell (POS)</span></a>
            <a routerLink="/products" routerLinkActive="active"><span class="material-icons">Products</span></a>
            <a routerLink="/raw-materials" routerLinkActive="active"><span class="material-icons">Raw Materials</span></a>
            <a routerLink="/suppliers" routerLinkActive="active"><span class="material-icons">Suppliers</span></a>
            <a routerLink="/sales-history" routerLinkActive="active"><span class="material-icons">Sales Historyg</span></a>
            <a routerLink="/reports" routerLinkActive="active"><span class="material-icons">AI Reports</span></a>
            <a routerLink="/stock-alerts" routerLinkActive="active"><span class="material-icons">Stock Alerts</span></a>
            <a routerLink="/users" routerLinkActive="active" *ngIf="auth.role() === 'ADMIN'"><span class="material-icons">Users</span></a>
          </nav>

          <button class="logout" (click)="logout()">
            <span class="material-icons">logout</span> Sign out
          </button>
        </aside>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </ng-container>
    <ng-template #bare><router-outlet></router-outlet></ng-template>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .nav {
      width: 232px;
      flex-shrink: 0;
      background: var(--ink);
      color: #C9D3E8;
      display: flex;
      flex-direction: column;
      padding: 20px 14px;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .brand { display: flex; align-items: center; gap: 10px; padding: 6px 8px 22px; }
    .brand-mark { color: var(--amber); font-size: 20px; }
    .brand-name { color: #fff; font-weight: 700; font-size: 15px; }
    .brand-sub { font-size: 11px; color: #8B97B5; letter-spacing: 0.03em; }
    nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    nav a {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 8px; color: #C9D3E8;
      font-size: 13.5px; font-weight: 500;
    }
    nav a .material-icons { font-size: 19px; color: #8B97B5; }
    nav a:hover { background: rgba(255,255,255,0.06); }
    nav a.active { background: var(--cobalt); color: #fff; }
    nav a.active .material-icons { color: #fff; }
    nav a.pos-link { background: var(--amber); color: #1B2333; margin-bottom: 6px; }
    nav a.pos-link .material-icons { color: #1B2333; }
    nav a.pos-link.active { background: var(--amber); }
    .logout {
      display: flex; align-items: center; gap: 10px; background: none; border: none;
      color: #8B97B5; padding: 10px 12px; cursor: pointer; font-size: 13px; border-radius: 8px;
    }
    .logout:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .content { flex: 1; padding: 28px 32px; max-width: 100%; overflow-x: auto; }
  `],
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
