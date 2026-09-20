import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="summary as s">
      <div class="header">
        <div>
          <h1>Dashboard</h1>
          <p class="sub">Today's performance and what the AI expects next.</p>
        </div>
        <a routerLink="/pos" class="cta">New sale</a>
      </div>

      <div class="kpi-grid">
        <div class="card kpi">
          <span class="label">Revenue today</span>
          <span class="figure big">{{ s.today.totalRevenue | number:'1.2-2' }}</span>
          <span class="pill" [class.green]="s.today.revenueChangePct >= 0" [class.red]="s.today.revenueChangePct < 0">
            {{ s.today.revenueChangePct >= 0 ? '▲' : '▼' }} {{ s.today.revenueChangePct | number:'1.1-1' }}% vs yesterday
          </span>
        </div>
        <div class="card kpi">
          <span class="label">Orders today</span>
          <span class="figure big">{{ s.today.totalOrders }}</span>
          <span class="muted">Avg order {{ s.today.averageOrderValue | number:'1.2-2' }}</span>
        </div>
        <div class="card kpi">
          <span class="label">Active products</span>
          <span class="figure big">{{ s.totalActiveProducts }}</span>
          <span class="muted">{{ s.totalActiveRawMaterials }} raw materials</span>
        </div>
        <div class="card kpi">
          <span class="label">Open stock alerts</span>
          <span class="figure big" [class.alert]="s.openStockAlerts.length > 0">{{ s.openStockAlerts.length }}</span>
          <a routerLink="/stock-alerts" class="muted-link">Review alerts →</a>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <h3>AI forecast — predicted best sellers next month</h3>
          <p class="sub">Based on a trend model over recent monthly sales.</p>
          <div class="bar-row" *ngFor="let f of s.topPredictedSellers">
            <div class="bar-label">
              <span>{{ f.itemName }}</span>
              <span class="pill" [ngClass]="{'green': f.trend==='RISING','red': f.trend==='FALLING'}">{{ f.trend }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="barWidth(f.predictedNextMonthQty)"></div>
            </div>
            <div class="bar-meta">
              ~{{ f.predictedNextMonthQty | number:'1.0-0' }} units next month
              · stock {{ f.currentStock | number:'1.0-0' }}
              <span *ngIf="f.suggestedReorderQty > 0" class="pill amber">reorder {{ f.suggestedReorderQty | number:'1.0-0' }}</span>
            </div>
          </div>
          <p *ngIf="!s.topPredictedSellers.length" class="muted">Not enough sales history yet to forecast — make a few sales first.</p>
        </div>

        <div class="card">
          <h3>Today's AI summary</h3>
          <p class="narrative">{{ s.today.narrative }}</p>
          <h4>Top sellers today</h4>
          <table class="mini-table">
            <tr *ngFor="let t of s.today.topSellingItems">
              <td>{{ t.itemName }}</td>
              <td>{{ t.quantitySold | number:'1.0-2' }}</td>
              <td>{{ t.revenue | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="!s.today.topSellingItems.length"><td class="muted">No sales recorded yet today.</td></tr>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .sub { color: var(--text-muted); font-size: 13px; }
    .cta { background: var(--cobalt); color: #fff; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
    .kpi { display: flex; flex-direction: column; gap: 6px; }
    .label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .figure.big { font-size: 28px; color: var(--ink); }
    .figure.big.alert { color: var(--alert-red); }
    .muted { color: var(--text-muted); font-size: 12.5px; }
    .muted-link { color: var(--cobalt); font-size: 12.5px; font-weight: 600; }
    .two-col { display: grid; grid-template-columns: 1.2fr 1fr; gap: 18px; align-items: start; }
    .bar-row { margin: 14px 0; }
    .bar-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .bar-track { height: 8px; background: var(--canvas); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--cobalt); border-radius: 4px; }
    .bar-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: flex; gap: 8px; align-items: center; }
    .narrative { font-size: 13.5px; line-height: 1.6; background: var(--canvas); padding: 14px; border-radius: 8px; }
    .mini-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .mini-table td { padding: 6px 0; border-bottom: 1px solid var(--border); }
  `],
})
export class DashboardComponent implements OnInit {
  summary?: DashboardSummary;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.summary().subscribe((s) => (this.summary = s));
  }

  barWidth(qty: number): number {
    const max = Math.max(...(this.summary?.topPredictedSellers.map((f) => f.predictedNextMonthQty) ?? [1]), 1);
    return Math.max(6, (qty / max) * 100);
  }
}
