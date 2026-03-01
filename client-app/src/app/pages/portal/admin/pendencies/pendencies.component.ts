import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';
import { PendencyDialogComponent } from './pendency-dialog.component';

@Component({
  selector: 'app-admin-pendencies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatChipsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Pendências</h1>
        <div class="actions">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrar por cliente</mat-label>
            <mat-select [(value)]="selectedClient" (selectionChange)="loadData()">
              <mat-option value="">Todos</mat-option>
              @for (c of clients; track c.id) {
                <mat-option [value]="c.id">{{ c.fullName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Nova Pendência
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (items.length === 0) {
              <p class="empty">Nenhuma pendência encontrada.</p>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="items" class="full-width">
                  <ng-container matColumnDef="descricao">
                    <th mat-header-cell *matHeaderCellDef>Descrição</th>
                    <td mat-cell *matCellDef="let row">{{ row.descricao }}</td>
                  </ng-container>
                  <ng-container matColumnDef="cliente">
                    <th mat-header-cell *matHeaderCellDef>Cliente</th>
                    <td mat-cell *matCellDef="let row">{{ row.clienteNome || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dataLimite">
                    <th mat-header-cell *matHeaderCellDef>Prazo</th>
                    <td mat-cell *matCellDef="let row">{{ row.dataLimite ? (row.dataLimite | date:'dd/MM/yyyy') : '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="resolvida">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let row">
                      <mat-chip [class.resolved]="row.resolvida">{{ row.resolvida ? 'Resolvida' : 'Pendente' }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let row">
                      <button mat-icon-button color="primary" (click)="openDialog(row)"><mat-icon>edit</mat-icon></button>
                      <button mat-icon-button color="warn" (click)="confirmDelete(row)"><mat-icon>delete</mat-icon></button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="columns"></tr>
                  <tr mat-row *matRowDef="let row; columns: columns"></tr>
                </table>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .filter-field { width: 200px; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .empty { text-align: center; padding: 40px; color: #999; }
    .resolved { background: #e8f5e9 !important; color: #2e7d32 !important; }
  `]
})
export class AdminPendenciesComponent implements OnInit {
  items: any[] = [];
  clients: any[] = [];
  columns = ['descricao', 'cliente', 'dataLimite', 'resolvida', 'acoes'];
  loading = true;
  selectedClient = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.api.getClients().subscribe(c => this.clients = c);
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getPendencies(this.selectedClient || undefined).subscribe({
      next: (res) => { this.items = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDialog(item?: any): void {
    const dialogRef = this.dialog.open(PendencyDialogComponent, {
      width: '500px',
      data: { item, clients: this.clients }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  confirmDelete(item: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Pendência', message: `Deseja excluir "${item.descricao}"?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deletePendency(item.id).subscribe({
          next: () => { this.snackBar.open('Excluído.', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro.', 'OK', { duration: 3000 })
        });
      }
    });
  }
}
