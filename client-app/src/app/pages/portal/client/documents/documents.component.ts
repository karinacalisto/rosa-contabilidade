import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <h1>Meus Documentos</h1>

      <mat-card class="upload-card">
        <mat-card-header>
          <mat-card-title>Enviar Documento</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="upload-form">
            <mat-form-field appearance="outline">
              <mat-label>Descrição (opcional)</mat-label>
              <input matInput [(ngModel)]="descricao" />
            </mat-form-field>
            <input type="file" #fileInput (change)="onFileSelected($event)" style="display:none" />
            <button mat-raised-button color="primary" (click)="fileInput.click()" [disabled]="uploading">
              <mat-icon>upload_file</mat-icon> {{ uploading ? 'Enviando...' : 'Selecionar e Enviar' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            @if (documents.length === 0) {
              <p class="empty">Nenhum documento disponível.</p>
            } @else {
              <table mat-table [dataSource]="documents" class="full-width">
                <ng-container matColumnDef="nome">
                  <th mat-header-cell *matHeaderCellDef>Arquivo</th>
                  <td mat-cell *matCellDef="let row">{{ row.nomeOriginal }}</td>
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
                    <button mat-icon-button color="primary" (click)="download(row)">
                      <mat-icon>download</mat-icon>
                    </button>
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
    .upload-card { margin-bottom: 24px; }
    .upload-form { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 40px; color: #999; }
  `]
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];
  columns = ['nome', 'descricao', 'data', 'tamanho', 'acoes'];
  loading = true;
  uploading = false;
  descricao = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.api.getMyDocuments().subscribe({
      next: (res) => { this.documents = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    this.api.uploadMyDocument(file, this.descricao || undefined).subscribe({
      next: () => {
        this.snackBar.open('Documento enviado!', 'OK', { duration: 3000 });
        this.descricao = '';
        this.uploading = false;
        this.loadDocuments();
      },
      error: () => {
        this.snackBar.open('Erro ao enviar documento.', 'OK', { duration: 3000 });
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

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
