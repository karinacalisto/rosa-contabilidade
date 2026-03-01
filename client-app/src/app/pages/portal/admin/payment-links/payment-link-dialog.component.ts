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
  selector: 'app-payment-link-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar Link de Pagamento' : 'Novo Link de Pagamento' }}</h2>
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
          <mat-label>URL do Pagamento</mat-label>
          <input matInput formControlName="url" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor (R$)</mat-label>
          <input matInput formControlName="valor" type="number" />
        </mat-form-field>

        <mat-checkbox formControlName="pago">Pago</mat-checkbox>
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
export class PaymentLinkDialogComponent {
  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PaymentLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any; clients: any[] }
  ) {
    this.form = this.fb.group({
      descricao: [data.item?.descricao || '', Validators.required],
      clienteId: [data.item?.clienteId || '', data.item ? [] : Validators.required],
      url: [data.item?.url || '', Validators.required],
      valor: [data.item?.valor || null],
      pago: [data.item?.pago || false]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const obs = this.data.item
      ? this.api.updatePaymentLink(this.data.item.id, this.form.value)
      : this.api.createPaymentLink(this.form.value);

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
