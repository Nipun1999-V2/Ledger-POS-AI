import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../core/services/supplier.service';
import { Supplier } from '../../core/models/models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h1>Suppliers</h1>
        <p class="sub">Who you buy raw materials from.</p>
      </div>
      <button class="cta" (click)="openNew()">+ New supplier</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Name</th><th>Contact person</th><th>Phone</th><th>Email</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let s of suppliers">
          <td>{{ s.name }}</td>
          <td>{{ s.contactPerson }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.email }}</td>
          <td class="actions"><button (click)="openEdit(s)">Edit</button></td>
        </tr>
        <tr *ngIf="!suppliers.length"><td colspan="5" class="muted">No suppliers yet.</td></tr>
      </tbody>
    </table>

    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal narrow" (click)="$event.stopPropagation()">
        <h3>{{ form.id ? 'Edit supplier' : 'New supplier' }}</h3>
        <label>Name</label><input [(ngModel)]="form.name" />
        <label>Contact person</label><input [(ngModel)]="form.contactPerson" />
        <label>Phone</label><input [(ngModel)]="form.phone" />
        <label>Email</label><input [(ngModel)]="form.email" />
        <label>Address</label><input [(ngModel)]="form.address" />
        <div class="modal-actions">
          <button (click)="editing=null">Cancel</button>
          <button class="primary" (click)="save()">Save</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../shared/list-page.scss'],
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  editing: Supplier | null = null;
  form: any = {};

  constructor(private supplierService: SupplierService) {}

  ngOnInit() { this.reload(); }
  reload() { this.supplierService.list().subscribe((s) => (this.suppliers = s)); }

  openNew() { this.form = {}; this.editing = {} as Supplier; }
  openEdit(s: Supplier) { this.form = { ...s }; this.editing = s; }

  save() {
    const action = this.form.id ? this.supplierService.update(this.form.id, this.form) : this.supplierService.create(this.form);
    action.subscribe(() => { this.editing = null; this.reload(); });
  }
}
