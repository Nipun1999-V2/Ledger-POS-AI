import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AppUser } from '../../core/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h1>Users</h1>
        <p class="sub">Cashiers, managers and admins who can sign in to the POS.</p>
      </div>
      <button class="cta" (click)="openNew()">+ New user</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Username</th><th>Full name</th><th>Role</th><th>Status</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let u of users">
          <td>{{ u.username }}</td>
          <td>{{ u.fullName }}</td>
          <td><span class="pill" [class.green]="u.role==='ADMIN'">{{ u.role }}</span></td>
          <td><span class="pill" [class.green]="u.active" [class.red]="!u.active">{{ u.active ? 'Active' : 'Inactive' }}</span></td>
          <td class="actions"><button *ngIf="u.active" (click)="deactivate(u)">Deactivate</button></td>
        </tr>
        <tr *ngIf="!users.length"><td colspan="5" class="muted">No users found.</td></tr>
      </tbody>
    </table>

    <div class="modal-backdrop" *ngIf="editing" (click)="editing=false">
      <div class="modal narrow" (click)="$event.stopPropagation()">
        <h3>New user</h3>
        <label>Username</label><input [(ngModel)]="form.username" />
        <label>Full name</label><input [(ngModel)]="form.fullName" />
        <label>Email</label><input [(ngModel)]="form.email" />
        <label>Password</label><input type="password" [(ngModel)]="form.password" />
        <label>Role</label>
        <select [(ngModel)]="form.role">
          <option value="CASHIER">Cashier</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
        <div class="modal-actions">
          <button (click)="editing=false">Cancel</button>
          <button class="primary" (click)="save()">Create</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../shared/list-page.scss'],
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  editing = false;
  form: any = { role: 'CASHIER' };

  constructor(private userService: UserService) {}

  ngOnInit() { this.reload(); }
  reload() { this.userService.list().subscribe((u) => (this.users = u)); }

  openNew() { this.form = { role: 'CASHIER' }; this.editing = true; }

  save() {
    this.userService.create(this.form).subscribe(() => { this.editing = false; this.reload(); });
  }

  deactivate(u: AppUser) {
    this.userService.deactivate(u.id).subscribe(() => this.reload());
  }
}
