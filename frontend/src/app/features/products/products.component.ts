import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { RawMaterialService } from '../../core/services/raw-material.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, RawMaterial, Category } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h1>Products</h1>
        <p class="sub">Finished / sellable goods. A product can optionally consume raw materials via a recipe.</p>
      </div>
      <button class="cta" (click)="openNew()">+ New product</button>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>SKU</th><th>Name</th><th>Price</th><th>Stock</th><th>Min level</th><th>Recipe</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of products">
          <td>{{ p.sku }}</td>
          <td>{{ p.name }}</td>
          <td class="figure">{{ p.sellingPrice | number:'1.2-2' }}</td>
          <td [class.low]="p.currentStock <= p.minStockLevel">{{ p.currentStock | number:'1.0-2' }} {{ p.unit }}</td>
          <td>{{ p.minStockLevel | number:'1.0-2' }}</td>
          <td><span class="pill" [class.green]="p.hasRecipe">{{ p.hasRecipe ? 'BOM linked' : 'Direct stock' }}</span></td>
          <td class="actions">
            <button (click)="openEdit(p)">Edit</button>
            <button (click)="openRestock(p)">Restock</button>
          </td>
        </tr>
        <tr *ngIf="!products.length"><td colspan="7" class="muted">No products yet — add one to get started.</td></tr>
      </tbody>
    </table>

    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>{{ form.id ? 'Edit product' : 'New product' }}</h3>

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
          <div><label>Unit</label><input [(ngModel)]="form.unit" placeholder="PCS, KG, BOX…" /></div>
          <div><label>Cost price</label><input type="number" [(ngModel)]="form.costPrice" /></div>
          <div><label>Selling price</label><input type="number" [(ngModel)]="form.sellingPrice" /></div>
          <div *ngIf="!form.id"><label>Opening stock</label><input type="number" [(ngModel)]="form.currentStock" /></div>
          <div><label>Min stock level</label><input type="number" [(ngModel)]="form.minStockLevel" /></div>
          <div><label>Reorder quantity</label><input type="number" [(ngModel)]="form.reorderQuantity" /></div>
        </div>

        <label class="checkbox"><input type="checkbox" [(ngModel)]="form.hasRecipe" /> Made from raw materials (recipe/BOM)</label>

        <div *ngIf="form.hasRecipe" class="recipe-builder">
          <div class="recipe-row" *ngFor="let ri of form.recipeItems; let i = index">
            <select [(ngModel)]="ri.rawMaterialId">
              <option [ngValue]="undefined">Select raw material…</option>
              <option *ngFor="let rm of rawMaterials" [ngValue]="rm.id">{{ rm.name }} ({{ rm.unit }})</option>
            </select>
            <input type="number" [(ngModel)]="ri.quantityRequired" placeholder="Qty per unit" />
            <button class="remove" (click)="form.recipeItems.splice(i,1)">✕</button>
          </div>
          <button class="add-line" (click)="form.recipeItems.push({quantityRequired: 1})">+ Add ingredient</button>
        </div>

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
        <input [(ngModel)]="restockNote" placeholder="e.g. PO-1042 delivery" />
        <div class="modal-actions">
          <button (click)="restocking=null">Cancel</button>
          <button class="primary" (click)="confirmRestock()">Add stock</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../shared/list-page.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  rawMaterials: RawMaterial[] = [];
  categories: Category[] = [];

  editing: Product | null = null;
  form: any = {};

  restocking: Product | null = null;
  restockQty = 0;
  restockNote = '';

  constructor(
    private productService: ProductService,
    private rawMaterialService: RawMaterialService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit() { this.reload(); }

  reload() {
    this.productService.list().subscribe((p) => (this.products = p));
    this.rawMaterialService.list().subscribe((r) => (this.rawMaterials = r.filter((x) => x.active)));
    this.categoryService.list('PRODUCT').subscribe((c) => (this.categories = c));
  }

  openNew() {
    this.form = { unit: 'PCS', costPrice: 0, sellingPrice: 0, currentStock: 0, minStockLevel: 0, reorderQuantity: 0, hasRecipe: false, recipeItems: [] };
    this.editing = {} as Product;
  }

  openEdit(p: Product) {
    this.form = {
      id: p.id, sku: p.sku, name: p.name, categoryId: p.category?.id, unit: p.unit,
      costPrice: p.costPrice, sellingPrice: p.sellingPrice, minStockLevel: p.minStockLevel,
      reorderQuantity: p.reorderQuantity, hasRecipe: p.hasRecipe,
      recipeItems: (p.recipeItems ?? []).map((ri) => ({ rawMaterialId: ri.rawMaterial?.id, quantityRequired: ri.quantityRequired })),
    };
    this.editing = p;
  }

  save() {
    const req = { ...this.form };
    const action = this.form.id ? this.productService.update(this.form.id, req) : this.productService.create(req);
    action.subscribe(() => { this.editing = null; this.reload(); });
  }

  openRestock(p: Product) { this.restocking = p; this.restockQty = 0; this.restockNote = ''; }

  confirmRestock() {
    if (!this.restocking || !this.restockQty) return;
    this.productService.restock(this.restocking.id, this.restockQty, this.restockNote).subscribe(() => {
      this.restocking = null;
      this.reload();
    });
  }
}
