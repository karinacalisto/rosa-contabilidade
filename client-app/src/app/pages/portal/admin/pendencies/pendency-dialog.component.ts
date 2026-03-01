import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-pendency-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar Pendência' : 'Nova Pendência' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="descricao" />
        </mat-form-field>

        @if (!data.item) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cliente</mat-label>
            <mat-select formControlName="clienteId">
              @for (c of data.clients; track c.id) {
                <mat-option [value]="c.id">{{ c.fullName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data Limite</mat-label>
          <input matInput formControlName="dataLimite" type="date" />
        </mat-form-field>

        <mat-checkbox formControlName="resolvida">Resolvida</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || saving" (click)="save()">
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; }`]
})
export class PendencyDialogComponent {
  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PendencyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any; clients: any[] }
  ) {
    this.form = this.fb.group({
      descricao: [data.item?.descricao || '', Validators.required],
      clienteId: [data.item?.clienteId || '', data.item ? [] : Validators.required],
      dataLimite: [data.item?.dataLimite ? data.item.dataLimite.split('T')[0] : ''],
      resolvida: [data.item?.resolvida || false]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const val = this.form.value;
    if (val.dataLimite) val.dataLimite = new Date(val.dataLimite).toISOString();
    else val.dataLimite = null;

    const obs = this.data.item
      ? this.api.updatePendency(this.data.item.id, val)
      : this.api.createPendency(val);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Salvo!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar.', 'OK', { duration: 3000 });
        this.saving = false;
      }
    });
  }
}
