import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { RawMaterialService } from '../../core/services/raw-material.service';
import { SaleService } from '../../core/services/sale.service';
import { CatalogType, PaymentMethod, Product, RawMaterial, Sale, SaleLine } from '../../core/models/models';

interface CartLine {
  itemType: CatalogType;
  itemId: number;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pos-layout">
      <section class="catalog">
        <div class="toolbar">
          <input class="search" placeholder="Search products or raw materials…" [(ngModel)]="query" />
          <div class="tabs">
            <button [class.active]="tab==='ALL'" (click)="tab='ALL'">All</button>
            <button [class.active]="tab==='PRODUCT'" (click)="tab='PRODUCT'">Products</button>
            <button [class.active]="tab==='RAW_MATERIAL'" (click)="tab='RAW_MATERIAL'">Raw materials</button>
          </div>
        </div>

        <div class="grid">
          <button class="item-tile" *ngFor="let item of filteredItems()"
                  [disabled]="item.currentStock <= 0"
                  (click)="addToCart(item)">
            <span class="name">{{ item.name }}</span>
            <span class="price figure">{{ item.sellingPrice ?? item.costPrice | number:'1.2-2' }}</span>
            <span class="stock" [class.low]="item.currentStock <= item.minStockLevel">
              {{ item.currentStock | number:'1.0-2' }} {{ item.unit }} left
            </span>
            <span class="type-badge">{{ item.itemType === 'PRODUCT' ? 'Product' : 'Raw material' }}</span>
          </button>
          <p *ngIf="!filteredItems().length" class="muted">No sellable items match.</p>
        </div>
      </section>

      <aside class="cart">
        <h3>Current sale</h3>
        <div class="cart-lines">
          <div class="cart-line" *ngFor="let line of cart">
            <div class="cl-name">{{ line.name }}</div>
            <div class="cl-qty">
              <button (click)="changeQty(line, -1)">−</button>
              <span>{{ line.quantity }}</span>
              <button (click)="changeQty(line, 1)">+</button>
            </div>
            <div class="cl-total figure">{{ line.unitPrice * line.quantity | number:'1.2-2' }}</div>
            <button class="remove" (click)="removeLine(line)">✕</button>
          </div>
          <p *ngIf="!cart.length" class="muted">Tap an item to add it to the sale.</p>
        </div>

        <div class="totals">
          <div class="row"><span>Subtotal</span><span class="figure">{{ subtotal() | number:'1.2-2' }}</span></div>
          <div class="row">
            <span>Discount</span>
            <input type="number" min="0" [(ngModel)]="discount" class="mini-input" />
          </div>
          <div class="row">
            <span>Tax rate %</span>
            <input type="number" min="0" [(ngModel)]="taxRatePct" class="mini-input" />
          </div>
          <div class="row total"><span>Total</span><span class="figure">{{ total() | number:'1.2-2' }}</span></div>
        </div>

        <label class="pm-label">Payment method</label>
        <select [(ngModel)]="paymentMethod">
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="MOBILE_WALLET">Mobile wallet</option>
          <option value="BANK_TRANSFER">Bank transfer</option>
        </select>

        <input class="cust" placeholder="Customer name (optional)" [(ngModel)]="customerName" />

        <button class="checkout" [disabled]="!cart.length || submitting" (click)="checkout()">
          {{ submitting ? 'Processing…' : 'Complete sale — ' + (total() | number:'1.2-2') }}
        </button>

        <div class="receipt" *ngIf="lastSale as r">
          ✓ Sale {{ r.invoiceNumber }} completed — total {{ r.total | number:'1.2-2' }}
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
      </aside>
    </div>
  `,
  styles: [`
    .pos-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; height: calc(100vh - 56px); }
    .catalog { display: flex; flex-direction: column; min-height: 0; }
    .toolbar { display: flex; gap: 12px; margin-bottom: 14px; }
    .search { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; }
    .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 3px; }
    .tabs button { border: none; background: none; padding: 7px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; }
    .tabs button.active { background: var(--ink); color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; overflow-y: auto; padding-bottom: 20px; align-content: start; }
    .item-tile {
      text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
      padding: 14px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; position: relative;
    }
    .item-tile:hover:not(:disabled) { border-color: var(--cobalt); box-shadow: var(--shadow-1); }
    .item-tile:disabled { opacity: 0.45; cursor: not-allowed; }
    .item-tile .name { font-weight: 600; font-size: 13.5px; }
    .item-tile .price { color: var(--ledger-green); font-size: 15px; }
    .item-tile .stock { font-size: 11.5px; color: var(--text-muted); }
    .item-tile .stock.low { color: var(--amber); font-weight: 600; }
    .type-badge { position: absolute; top: 10px; right: 10px; font-size: 9.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted); }
    .cart { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; }
    .cart-lines { flex: 1; overflow-y: auto; margin: 10px 0; }
    .cart-line { display: grid; grid-template-columns: 1fr auto auto auto; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .cl-name { font-size: 13px; font-weight: 500; }
    .cl-qty { display: flex; align-items: center; gap: 6px; }
    .cl-qty button { width: 22px; height: 22px; border-radius: 5px; border: 1px solid var(--border); background: var(--canvas); cursor: pointer; }
    .remove { border: none; background: none; color: var(--text-muted); cursor: pointer; }
    .totals { border-top: 1px dashed var(--border); padding-top: 10px; }
    .totals .row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 13px; }
    .totals .row.total { font-size: 17px; font-weight: 700; color: var(--ink); border-top: 1px solid var(--border); margin-top: 6px; padding-top: 10px; }
    .mini-input { width: 70px; padding: 4px 6px; border: 1px solid var(--border); border-radius: 6px; text-align: right; }
    .pm-label { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-top: 12px; }
    select, .cust { margin-top: 6px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
    .checkout { margin-top: 14px; background: var(--ledger-green); color: #fff; border: none; padding: 13px; border-radius: 9px; font-weight: 700; cursor: pointer; font-size: 14px; }
    .checkout:disabled { opacity: 0.5; cursor: default; }
    .receipt { margin-top: 10px; font-size: 12.5px; color: var(--ledger-green); }
    .error { margin-top: 10px; font-size: 12.5px; color: var(--alert-red); }
    .muted { color: var(--text-muted); grid-column: 1 / -1; }
  `],
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  rawMaterials: RawMaterial[] = [];
  cart: CartLine[] = [];

  query = '';
  tab: 'ALL' | CatalogType = 'ALL';
  discount = 0;
  taxRatePct = 0;
  paymentMethod: PaymentMethod = 'CASH';
  customerName = '';
  submitting = false;
  error = '';
  lastSale?: Sale;

  constructor(
    private productService: ProductService,
    private rawMaterialService: RawMaterialService,
    private saleService: SaleService,
  ) {}

  ngOnInit() {
    this.productService.list().subscribe((p) => (this.products = p.filter((x) => x.active)));
    this.rawMaterialService.list().subscribe((r) => (this.rawMaterials = r.filter((x) => x.active && x.sellableDirectly)));
  }

  private sellableItems(): Array<any> {
    const products = this.products.map((p) => ({ ...p, itemType: 'PRODUCT' as CatalogType }));
    const materials = this.rawMaterials.map((r) => ({ ...r, itemType: 'RAW_MATERIAL' as CatalogType }));
    return [...products, ...materials];
  }

  filteredItems() {
    let items = this.sellableItems();
    if (this.tab !== 'ALL') items = items.filter((i) => i.itemType === this.tab);
    if (this.query.trim()) {
      const q = this.query.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));
    }
    return items;
  }

  addToCart(item: any) {
    const existing = this.cart.find((c) => c.itemType === item.itemType && c.itemId === item.id);
    if (existing) {
      if (existing.quantity < item.currentStock) existing.quantity++;
      return;
    }
    this.cart.push({
      itemType: item.itemType,
      itemId: item.id,
      name: item.name,
      unit: item.unit,
      unitPrice: item.sellingPrice ?? item.costPrice,
      quantity: 1,
      maxStock: item.currentStock,
    });
  }

  changeQty(line: CartLine, delta: number) {
    const next = line.quantity + delta;
    if (next <= 0) { this.removeLine(line); return; }
    if (next > line.maxStock) return;
    line.quantity = next;
  }

  removeLine(line: CartLine) {
    this.cart = this.cart.filter((c) => c !== line);
  }

  subtotal(): number {
    return this.cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  }

  total(): number {
    const afterDiscount = Math.max(0, this.subtotal() - (this.discount || 0));
    return afterDiscount * (1 + (this.taxRatePct || 0) / 100);
  }

  checkout() {
    this.error = '';
    this.submitting = true;
    const items: SaleLine[] = this.cart.map((l) => ({ itemType: l.itemType, itemId: l.itemId, quantity: l.quantity }));

    this.saleService.checkout({
      customerName: this.customerName || undefined,
      discount: this.discount || 0,
      taxRate: (this.taxRatePct || 0) / 100,
      paymentMethod: this.paymentMethod,
      items,
    }).subscribe({
      next: (sale) => {
        this.lastSale = sale;
        this.cart = [];
        this.discount = 0;
        this.customerName = '';
        this.submitting = false;
        this.ngOnInit(); // refresh stock levels
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Checkout failed — please check stock availability.';
      },
    });
  }
}
