import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../core/services/sale.service';
import { Sale } from '../../core/models/models';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h1>Sales History</h1>
        <p class="sub">Every completed transaction.</p>
      </div>
      <div class="filters">
        <input type="date" [(ngModel)]="from" />
        <span>to</span>
        <input type="date" [(ngModel)]="to" />
        <button class="cta" (click)="load()">Filter</button>
      </div>
    </div>

    <table class="data-table">
      <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Payment</th><th>Total</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let s of sales">
          <td>{{ s.invoiceNumber }}</td>
          <td>{{ s.saleDate | date:'short' }}</td>
          <td>{{ s.customerName || '—' }}</td>
          <td>{{ s.paymentMethod }}</td>
          <td class="figure">{{ s.total | number:'1.2-2' }}</td>
          <td class="actions"><button (click)="viewing = s">View</button></td>
        </tr>
        <tr *ngIf="!sales.length"><td colspan="6" class="muted">No sales in this period.</td></tr>
      </tbody>
    </table>

    <div class="modal-backdrop" *ngIf="viewing" (click)="viewing=null">
      <div class="modal narrow" (click)="$event.stopPropagation()">
        <h3>Invoice {{ viewing.invoiceNumber }}</h3>
        <p class="sub">{{ viewing.saleDate | date:'medium' }} · {{ viewing.paymentMethod }}</p>
        <table class="mini">
          <tr *ngFor="let i of viewing.items">
            <td>{{ i.itemName }}</td>
            <td>{{ i.quantity }} × {{ i.unitPrice | number:'1.2-2' }}</td>
            <td class="figure">{{ i.lineTotal | number:'1.2-2' }}</td>
          </tr>
        </table>
        <div class="summary-row"><span>Subtotal</span><span>{{ viewing.subtotal | number:'1.2-2' }}</span></div>
        <div class="summary-row"><span>Discount</span><span>-{{ viewing.discount | number:'1.2-2' }}</span></div>
        <div class="summary-row"><span>Tax</span><span>{{ viewing.tax | number:'1.2-2' }}</span></div>
        <div class="summary-row total"><span>Total</span><span>{{ viewing.total | number:'1.2-2' }}</span></div>
        <div class="modal-actions"><button (click)="viewing=null">Close</button></div>
      </div>
    </div>
  `,
  styles: [`
    .filters { display: flex; align-items: center; gap: 8px; }
    .filters input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; }
    .mini { width: 100%; margin: 12px 0; font-size: 13px; border-collapse: collapse; }
    .mini td { padding: 6px 0; border-bottom: 1px solid var(--border); }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
    .summary-row.total { font-weight: 700; font-size: 15px; border-top: 1px solid var(--border); margin-top: 6px; padding-top: 8px; }
  `],
  styleUrls: ['../shared/list-page.scss'],
})
export class SalesHistoryComponent implements OnInit {
  sales: Sale[] = [];
  viewing: Sale | null = null;
  from = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  to = new Date().toISOString().slice(0, 10);

  constructor(private saleService: SaleService) {}

  ngOnInit() { this.load(); }

  load() {
    this.saleService.byDateRange(this.from, this.to).subscribe((s) => {
      this.sales = s.sort((a, b) => (a.saleDate < b.saleDate ? 1 : -1));
    });
  }
}
