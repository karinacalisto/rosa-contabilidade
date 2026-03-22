import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <h1>Meus Pagamentos</h1>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (payments.length === 0) {
              <p class="empty">Nenhum link de pagamento disponível.</p>
            } @else {
              <table mat-table [dataSource]="payments" class="full-width">
                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef>Descrição</th>
                  <td mat-cell *matCellDef="let row">{{ row.descricao }}</td>
                </ng-container>
                <ng-container matColumnDef="valor">
                  <th mat-header-cell *matHeaderCellDef>Valor</th>
                  <td mat-cell *matCellDef="let row">R$ {{ row.valor | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip [class.paid]="row.pago">
                      {{ row.pago ? 'Pago' : 'Pendente' }}
                    </mat-chip>
                  </td>
                </ng-container>
                <ng-container matColumnDef="acoes">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let row">
                    @if (!row.pago) {
                      <a mat-raised-button color="primary" [href]="row.url" target="_blank">
                        <mat-icon>payment</mat-icon> Pagar
                      </a>
                    }
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page h1 { margin-bottom: 24px; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 40px; color: #999; }
    .paid { background: #e8f5e9 !important; color: #2e7d32 !important; }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: any[] = [];
  columns = ['descricao', 'valor', 'status', 'acoes'];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getMyPaymentLinks().subscribe({
      next: (res) => { this.payments = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
