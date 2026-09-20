import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAlertService } from '../../core/services/stock-alert.service';
import { StockAlert } from '../../core/models/models';

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header">
      <div>
        <h1>Stock Alerts</h1>
        <p class="sub">The system checks every stock change instantly, and re-sweeps all stock every 15 minutes.</p>
      </div>
    </div>

    <table class="data-table">
      <thead><tr><th>Item</th><th>Type</th><th>Current stock</th><th>Min level</th><th>Raised</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let a of alerts">
          <td>{{ a.itemName }}</td>
          <td>{{ a.itemType === 'PRODUCT' ? 'Product' : 'Raw material' }}</td>
          <td class="low">{{ a.currentStock | number:'1.0-2' }}</td>
          <td>{{ a.minStockLevel | number:'1.0-2' }}</td>
          <td>{{ a.createdAt | date:'short' }}</td>
          <td class="actions"><button (click)="resolve(a)">Mark resolved</button></td>
        </tr>
        <tr *ngIf="!alerts.length"><td colspan="6" class="muted">No open alerts — all stock is above its minimum level. 🎉</td></tr>
      </tbody>
    </table>
  `,
  styleUrls: ['../shared/list-page.scss'],
})
export class StockAlertsComponent implements OnInit {
  alerts: StockAlert[] = [];

  constructor(private stockAlertService: StockAlertService) {}

  ngOnInit() { this.reload(); }
  reload() { this.stockAlertService.open().subscribe((a) => (this.alerts = a)); }

  resolve(a: StockAlert) {
    this.stockAlertService.resolve(a.id).subscribe(() => this.reload());
  }
}
