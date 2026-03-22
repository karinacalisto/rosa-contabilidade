import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Clientes</h1>
        <a mat-raised-button color="primary" routerLink="/app/admin/clientes/novo">
          <mat-icon>add</mat-icon> Novo Cliente
        </a>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (clients.length === 0) {
              <p class="empty">Nenhum cliente cadastrado.</p>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="clients" class="full-width">
                  <ng-container matColumnDef="fullName">
                    <th mat-header-cell *matHeaderCellDef>Nome</th>
                    <td mat-cell *matCellDef="let row">{{ row.fullName }}</td>
                  </ng-container>
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>E-mail</th>
                    <td mat-cell *matCellDef="let row">{{ row.email }}</td>
                  </ng-container>
                  <ng-container matColumnDef="cpfCnpj">
                    <th mat-header-cell *matHeaderCellDef>CPF/CNPJ</th>
                    <td mat-cell *matCellDef="let row">{{ row.cpfCnpj || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="pendencias">
                    <th mat-header-cell *matHeaderCellDef>Pend.</th>
                    <td mat-cell *matCellDef="let row">{{ row.pendenciasCount }}</td>
                  </ng-container>
                  <ng-container matColumnDef="documentos">
                    <th mat-header-cell *matHeaderCellDef>Docs</th>
                    <td mat-cell *matCellDef="let row">{{ row.documentosCount }}</td>
                  </ng-container>
                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let row">
                      <a mat-icon-button color="primary" [routerLink]="['/app/admin/clientes', row.id]">
                        <mat-icon>edit</mat-icon>
                      </a>
                      <button mat-icon-button color="warn" (click)="confirmDelete(row)">
                        <mat-icon>delete</mat-icon>
                      </button>
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
    .loading { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .empty { text-align: center; padding: 40px; color: #999; }
  `]
})
export class AdminClientsComponent implements OnInit {
  clients: any[] = [];
  columns = ['fullName', 'email', 'cpfCnpj', 'pendencias', 'documentos', 'acoes'];
  loading = true;

  constructor(private api: ApiService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.api.getClients().subscribe({
      next: (res) => { this.clients = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirmDelete(client: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Cliente', message: `Deseja excluir o cliente "${client.fullName}"? Esta ação não pode ser desfeita.` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteClient(client.id).subscribe({
          next: () => {
            this.snackBar.open('Cliente excluído.', 'OK', { duration: 3000 });
            this.loadClients();
          },
          error: () => this.snackBar.open('Erro ao excluir.', 'OK', { duration: 3000 })
        });
      }
    });
  }
}
