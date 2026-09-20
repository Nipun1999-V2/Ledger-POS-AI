import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'pos', loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent) },
      { path: 'products', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
      { path: 'raw-materials', loadComponent: () => import('./features/raw-materials/raw-materials.component').then(m => m.RawMaterialsComponent) },
      { path: 'suppliers', loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
      { path: 'sales-history', loadComponent: () => import('./features/sales-history/sales-history.component').then(m => m.SalesHistoryComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'stock-alerts', loadComponent: () => import('./features/stock-alerts/stock-alerts.component').then(m => m.StockAlertsComponent) },
      { path: 'users', loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
