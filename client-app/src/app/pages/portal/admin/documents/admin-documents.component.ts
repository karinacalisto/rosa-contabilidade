import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatSelectModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Documentos</h1>
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
        </div>
      </div>

      <mat-card class="upload-card">
        <mat-card-header>
          <mat-card-title>Upload de Documento</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="upload-form">
            <mat-form-field appearance="outline" class="client-select">
              <mat-label>Cliente</mat-label>
              <mat-select [(value)]="uploadClientId">
                @for (c of clients; track c.id) {
                  <mat-option [value]="c.id">{{ c.fullName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Descrição</mat-label>
              <input matInput [(ngModel)]="uploadDescricao" />
            </mat-form-field>
            <input type="file" #fileInput (change)="onFileSelected($event)" style="display:none" />
            <button mat-raised-button color="primary" (click)="fileInput.click()" [disabled]="!uploadClientId || uploading">
              <mat-icon>upload_file</mat-icon> {{ uploading ? 'Enviando...' : 'Upload' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (items.length === 0) {
              <p class="empty">Nenhum documento encontrado.</p>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="items" class="full-width">
                  <ng-container matColumnDef="nome">
                    <th mat-header-cell *matHeaderCellDef>Arquivo</th>
                    <td mat-cell *matCellDef="let row">{{ row.nomeOriginal }}</td>
                  </ng-container>
                  <ng-container matColumnDef="cliente">
                    <th mat-header-cell *matHeaderCellDef>Cliente</th>
                    <td mat-cell *matCellDef="let row">{{ row.clienteNome || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="descricao">
                    <th mat-header-cell *matHeaderCellDef>Descrição</th>
                    <td mat-cell *matCellDef="let row">{{ row.descricao || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="data">
                    <th mat-header-cell *matHeaderCellDef>Data</th>
                    <td mat-cell *matCellDef="let row">{{ row.createdAt | date:'dd/MM/yyyy' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="tamanho">
                    <th mat-header-cell *matHeaderCellDef>Tamanho</th>
                    <td mat-cell *matCellDef="let row">{{ formatSize(row.tamanhoBytes) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let row">
                      <button mat-icon-button color="primary" (click)="download(row)"><mat-icon>download</mat-icon></button>
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
    .actions { display: flex; gap: 12px; align-items: center; }
    .filter-field { width: 200px; }
    .client-select { width: 200px; }
    .upload-card { margin-bottom: 24px; }
    .upload-form { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .empty { text-align: center; padding: 40px; color: #999; }
  `]
})
export class AdminDocumentsComponent implements OnInit {
  items: any[] = [];
  clients: any[] = [];
  columns = ['nome', 'cliente', 'descricao', 'data', 'tamanho', 'acoes'];
  loading = true;
  selectedClient = '';
  uploadClientId = '';
  uploadDescricao = '';
  uploading = false;

  constructor(private api: ApiService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.api.getClients().subscribe(c => this.clients = c);
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getDocuments(this.selectedClient || undefined).subscribe({
      next: (res) => { this.items = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    this.api.uploadDocument(file, this.uploadClientId, this.uploadDescricao || undefined).subscribe({
      next: () => {
        this.snackBar.open('Documento enviado!', 'OK', { duration: 3000 });
        this.uploadDescricao = '';
        this.uploading = false;
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Erro ao enviar.', 'OK', { duration: 3000 });
        this.uploading = false;
      }
    });
    input.value = '';
  }

  download(doc: any): void {
    this.api.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nomeOriginal;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erro ao baixar.', 'OK', { duration: 3000 })
    });
  }

  confirmDelete(doc: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Documento', message: `Deseja excluir "${doc.nomeOriginal}"?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteDocument(doc.id).subscribe({
          next: () => { this.snackBar.open('Excluído.', 'OK', { duration: 3000 }); this.loadData(); },
          error: () => this.snackBar.open('Erro.', 'OK', { duration: 3000 })
        });
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
