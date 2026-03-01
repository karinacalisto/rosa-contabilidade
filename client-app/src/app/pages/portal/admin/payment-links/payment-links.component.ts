import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';
import { PaymentLinkDialogComponent } from './payment-link-dialog.component';

@Component({
  selector: 'app-admin-payment-links',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatSelectModule, MatFormFieldModule, MatChipsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Links de Pagamento</h1>
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
            <mat-icon>add</mat-icon> Novo Link
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (items.length === 0) {
              <p class="empty">Nenhum link de pagamento encontrado.</p>
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
                  <ng-container matColumnDef="valor">
                    <th mat-header-cell *matHeaderCellDef>Valor</th>
                    <td mat-cell *matCellDef="let row">R$ {{ row.valor | number:'1.2-2' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="pago">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let row">
                      <mat-chip [class.paid]="row.pago">{{ row.pago ? 'Pago' : 'Pendente' }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="url">
                    <th mat-header-cell *matHeaderCellDef>URL</th>
                    <td mat-cell *matCellDef="let row">
                      <a [href]="row.url" target="_blank" mat-icon-button><mat-icon>open_in_new</mat-icon></a>
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
    .paid { background: #e8f5e9 !important; color: #2e7d32 !important; }
  `]
})
export class AdminPaymentLinksComponent implements OnInit {
  items: any[] = [];
  clients: any[] = [];
  columns = ['descricao', 'cliente', 'valor', 'pago', 'url', 'acoes'];
  loading = true;
  selectedClient = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.api.getClients().subscribe(c => this.clients = c);
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getPaymentLinks(this.selectedClient || undefined).subscribe({
      next: (res) => { this.items = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDialog(item?: any): void {
    const dialogRef = this.dialog.open(PaymentLinkDialogComponent, {
      width: '500px',
      data: { item, clients: this.clients }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  confirmDelete(item: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Link', message: `Deseja excluir "${item.descricao}"?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deletePaymentLink(item.id).subscribe({
          next: () => { this.snackBar.open('Excluído.', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro.', 'OK', { duration: 3000 })
        });
      }
    });
  }
}
