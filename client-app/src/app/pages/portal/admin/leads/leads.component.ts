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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatSelectModule, MatFormFieldModule, MatChipsModule, MatTooltipModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Leads</h1>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filtrar por origem</mat-label>
          <mat-select [(value)]="selectedOrigem" (selectionChange)="loadData()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="contato">Contato</mat-option>
            <mat-option value="calculadora">Calculadora</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (items.length === 0) {
              <p class="empty">Nenhum lead encontrado.</p>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="items" class="full-width">
                  <ng-container matColumnDef="nome">
                    <th mat-header-cell *matHeaderCellDef>Nome</th>
                    <td mat-cell *matCellDef="let row">{{ row.nome }}</td>
                  </ng-container>
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>E-mail</th>
                    <td mat-cell *matCellDef="let row">{{ row.email }}</td>
                  </ng-container>
                  <ng-container matColumnDef="telefone">
                    <th mat-header-cell *matHeaderCellDef>Telefone</th>
                    <td mat-cell *matCellDef="let row">{{ row.telefone || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="origem">
                    <th mat-header-cell *matHeaderCellDef>Origem</th>
                    <td mat-cell *matCellDef="let row">
                      <mat-chip [class.calc]="row.origem === 'calculadora'">{{ row.origem }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="data">
                    <th mat-header-cell *matHeaderCellDef>Data</th>
                    <td mat-cell *matCellDef="let row">{{ row.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="detalhes">
                    <th mat-header-cell *matHeaderCellDef>Detalhes</th>
                    <td mat-cell *matCellDef="let row">
                      @if (row.origem === 'calculadora') {
                        <span [matTooltip]="'Receita: R$' + row.receitaMensal + ' | Imposto: R$' + row.impostoEstimado + ' | ' + row.tipoPessoa + ' - ' + row.opcaoRegime">
                          <mat-icon>info</mat-icon>
                        </span>
                      } @else {
                        <span [matTooltip]="row.mensagem || 'Sem mensagem'"><mat-icon>message</mat-icon></span>
                      }
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let row">
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
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .filter-field { width: 200px; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .empty { text-align: center; padding: 40px; color: #999; }
    .calc { background: #e3f2fd !important; color: #1565c0 !important; }
  `]
})
export class AdminLeadsComponent implements OnInit {
  items: any[] = [];
  columns = ['nome', 'email', 'telefone', 'origem', 'data', 'detalhes', 'acoes'];
  loading = true;
  selectedOrigem = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getLeads(this.selectedOrigem || undefined).subscribe({
      next: (res) => { this.items = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirmDelete(item: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Lead', message: `Deseja excluir o lead de "${item.nome}"?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteLead(item.id).subscribe({
          next: () => { this.snackBar.open('Excluído.', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro.', 'OK', { duration: 3000 })
        });
      }
    });
  }
}
