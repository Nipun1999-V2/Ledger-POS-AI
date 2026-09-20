import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RawMaterialService } from '../../core/services/raw-material.service';
import { CategoryService } from '../../core/services/category.service';
import { SupplierService } from '../../core/services/supplier.service';
import { RawMaterial, Category, Supplier } from '../../core/models/models';

@Component({
  selector: 'app-raw-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h1>Raw Materials</h1>
        <p class="sub">Stock you buy in — set a minimum level so the AI monitor can flag it before you run out.</p>
      </div>
      <button class="cta" (click)="openNew()">+ New raw material</button>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>SKU</th><th>Name</th><th>Unit</th><th>Stock</th><th>Min level</th><th>Sellable directly</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let m of materials">
          <td>{{ m.sku }}</td>
          <td>{{ m.name }}</td>
          <td>{{ m.unit }}</td>
          <td [class.low]="m.currentStock <= m.minStockLevel">{{ m.currentStock | number:'1.0-2' }}</td>
          <td>{{ m.minStockLevel | number:'1.0-2' }}</td>
          <td><span class="pill" [class.green]="m.sellableDirectly">{{ m.sellableDirectly ? 'Yes — on POS' : 'No — internal only' }}</span></td>
          <td class="actions">
            <button (click)="openEdit(m)">Edit</button>
            <button (click)="openRestock(m)">Restock</button>
          </td>
        </tr>
        <tr *ngIf="!materials.length"><td colspan="7" class="muted">No raw materials yet — add your first one.</td></tr>
      </tbody>
    </table>

    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>{{ form.id ? 'Edit raw material' : 'New raw material' }}</h3>
        <div class="grid2">
          <div><label>SKU</label><input [(ngModel)]="form.sku" /></div>
          <div><label>Name</label><input [(ngModel)]="form.name" /></div>
          <div>
            <label>Category</label>
            <select [(ngModel)]="form.categoryId">
              <option [ngValue]="undefined">—</option>
              <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label>Supplier</label>
            <select [(ngModel)]="form.supplierId">
              <option [ngValue]="undefined">—</option>
              <option *ngFor="let s of suppliers" [ngValue]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div><label>Unit</label><input [(ngModel)]="form.unit" placeholder="KG, L, METER…" /></div>
          <div><label>Cost price (per unit)</label><input type="number" [(ngModel)]="form.costPrice" /></div>
          <div><label>Selling price (if sold directly)</label><input type="number" [(ngModel)]="form.sellingPrice" /></div>
          <div *ngIf="!form.id"><label>Opening stock</label><input type="number" [(ngModel)]="form.currentStock" /></div>
          <div><label>Min stock level</label><input type="number" [(ngModel)]="form.minStockLevel" /></div>
          <div><label>Reorder quantity</label><input type="number" [(ngModel)]="form.reorderQuantity" /></div>
        </div>
        <label class="checkbox"><input type="checkbox" [(ngModel)]="form.sellableDirectly" /> Sellable directly at the POS (e.g. sold by weight/length)</label>
        <div class="modal-actions">
          <button (click)="editing=null">Cancel</button>
          <button class="primary" (click)="save()">Save</button>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="restocking" (click)="restocking=null">
      <div class="modal narrow" (click)="$event.stopPropagation()">
        <h3>Restock — {{ restocking.name }}</h3>
        <label>Quantity received</label>
        <input type="number" [(ngModel)]="restockQty" />
        <label>Note</label>
        <input [(ngModel)]="restockNote" placeholder="e.g. Supplier delivery" />
        <div class="modal-actions">
          <button (click)="restocking=null">Cancel</button>
          <button class="primary" (click)="confirmRestock()">Add stock</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../shared/list-page.scss'],
})
export class RawMaterialsComponent implements OnInit {
  materials: RawMaterial[] = [];
  categories: Category[] = [];
  suppliers: Supplier[] = [];

  editing: RawMaterial | null = null;
  form: any = {};

  restocking: RawMaterial | null = null;
  restockQty = 0;
  restockNote = '';

  constructor(
    private rawMaterialService: RawMaterialService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
  ) {}

  ngOnInit() { this.reload(); }

  reload() {
    this.rawMaterialService.list().subscribe((m) => (this.materials = m));
    this.categoryService.list('RAW_MATERIAL').subscribe((c) => (this.categories = c));
    this.supplierService.list().subscribe((s) => (this.suppliers = s));
  }

  openNew() {
    this.form = { unit: 'KG', costPrice: 0, currentStock: 0, minStockLevel: 0, reorderQuantity: 0, sellableDirectly: false };
    this.editing = {} as RawMaterial;
  }

  openEdit(m: RawMaterial) {
    this.form = {
      id: m.id, sku: m.sku, name: m.name, categoryId: m.category?.id, supplierId: m.supplier?.id,
      unit: m.unit, costPrice: m.costPrice, sellingPrice: m.sellingPrice,
      minStockLevel: m.minStockLevel, reorderQuantity: m.reorderQuantity, sellableDirectly: m.sellableDirectly,
    };
    this.editing = m;
  }

  save() {
    const req = { ...this.form };
    const action = this.form.id ? this.rawMaterialService.update(this.form.id, req) : this.rawMaterialService.create(req);
    action.subscribe(() => { this.editing = null; this.reload(); });
  }

  openRestock(m: RawMaterial) { this.restocking = m; this.restockQty = 0; this.restockNote = ''; }

  confirmRestock() {
    if (!this.restocking || !this.restockQty) return;
    this.rawMaterialService.restock(this.restocking.id, this.restockQty, this.restockNote).subscribe(() => {
      this.restocking = null;
      this.reload();
    });
  }
}
