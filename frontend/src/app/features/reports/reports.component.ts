import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { ForecastService } from '../../core/services/forecast.service';
import { AnalyticsReport, ForecastItem } from '../../core/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h1>AI Reports &amp; Forecasting</h1>
        <p class="sub">Auto-generated analyst summaries and next-month demand predictions.</p>
      </div>
      <div class="tabs">
        <button [class.active]="period==='DAILY'" (click)="load('DAILY')">Today</button>
        <button [class.active]="period==='WEEKLY'" (click)="load('WEEKLY')">This week</button>
        <button [class.active]="period==='MONTHLY'" (click)="load('MONTHLY')">This month</button>
      </div>
    </div>

    <div class="two-col" *ngIf="report as r">
      <div class="card">
        <div class="kpis">
          <div><span class="label">Revenue</span><span class="figure big">{{ r.totalRevenue | number:'1.2-2' }}</span></div>
          <div><span class="label">Orders</span><span class="figure big">{{ r.totalOrders }}</span></div>
          <div><span class="label">Items sold</span><span class="figure big">{{ r.totalItemsSold | number:'1.0-0' }}</span></div>
          <div><span class="label">Avg order</span><span class="figure big">{{ r.averageOrderValue | number:'1.2-2' }}</span></div>
        </div>
        <p class="pill" [class.green]="r.revenueChangePct >= 0" [class.red]="r.revenueChangePct < 0">
          {{ r.revenueChangePct >= 0 ? '▲' : '▼' }} {{ r.revenueChangePct | number:'1.1-1' }}% vs previous period
        </p>
        <h4>AI summary</h4>
        <p class="narrative">{{ r.narrative }}</p>

        <div class="split">
          <div>
            <h4>Top sellers</h4>
            <table class="mini"><tr *ngFor="let t of r.topSellingItems"><td>{{ t.itemName }}</td><td class="figure">{{ t.revenue | number:'1.2-2' }}</td></tr></table>
          </div>
          <div>
            <h4>Low performers</h4>
            <table class="mini"><tr *ngFor="let t of r.lowPerformingItems"><td>{{ t.itemName }}</td><td class="figure">{{ t.revenue | number:'1.2-2' }}</td></tr></table>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Next month demand forecast</h3>
        <p class="sub">Predicted units to sell, and how much to reorder now to stay ahead of it.</p>
        <table class="data-table small">
          <thead><tr><th>Item</th><th>Trend</th><th>Predicted qty</th><th>Current stock</th><th>Reorder</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of forecast">
              <td>{{ f.itemName }}</td>
              <td><span class="pill" [ngClass]="{'green': f.trend==='RISING','red': f.trend==='FALLING'}">{{ f.trend }}</span></td>
              <td class="figure">{{ f.predictedNextMonthQty | number:'1.0-0' }}</td>
              <td>{{ f.currentStock | number:'1.0-0' }}</td>
              <td [class.low]="f.suggestedReorderQty > 0">{{ f.suggestedReorderQty > 0 ? (f.suggestedReorderQty | number:'1.0-0') : '—' }}</td>
            </tr>
            <tr *ngIf="!forecast.length"><td colspan="5" class="muted">Not enough sales history to forecast yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 3px; }
    .tabs button { border: none; background: none; padding: 8px 16px; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; }
    .tabs button.active { background: var(--ink); color: #fff; }
    .two-col { display: grid; grid-template-columns: 1.1fr 1fr; gap: 18px; align-items: start; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
    .kpis .label { display: block; font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .figure.big { font-size: 20px; }
    .narrative { font-size: 13.5px; line-height: 1.6; background: var(--canvas); padding: 14px; border-radius: 8px; margin: 8px 0 16px; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .mini { width: 100%; font-size: 12.5px; border-collapse: collapse; }
    .mini td { padding: 5px 0; border-bottom: 1px solid var(--border); }
    .data-table.small td, .data-table.small th { padding: 8px 10px; font-size: 12.5px; }
  `],
  styleUrls: ['../shared/list-page.scss'],
})
export class ReportsComponent implements OnInit {
  report?: AnalyticsReport;
  forecast: ForecastItem[] = [];
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY';

  constructor(private reportService: ReportService, private forecastService: ForecastService) {}

  ngOnInit() {
    this.load('DAILY');
    this.forecastService.all().subscribe((f) => (this.forecast = f));
  }

  load(period: 'DAILY' | 'WEEKLY' | 'MONTHLY') {
    this.period = period;
    const obs = period === 'DAILY' ? this.reportService.today()
      : period === 'WEEKLY' ? this.reportService.thisWeek()
      : this.reportService.thisMonth();
    obs.subscribe((r) => (this.report = r));
  }
}
