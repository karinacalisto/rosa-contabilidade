import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
        <a mat-button routerLink="/app/admin/clientes">
          <mat-icon>arrow_back</mat-icon> Voltar
        </a>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card class="form-card">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSave()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome Completo</mat-label>
                <input matInput formControlName="fullName" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail</mat-label>
                <input matInput formControlName="email" type="email" [readonly]="isEdit" />
              </mat-form-field>

              @if (!isEdit) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Senha</mat-label>
                  <input matInput formControlName="password" type="password" />
                </mat-form-field>
              }

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>CPF/CNPJ</mat-label>
                <input matInput formControlName="cpfCnpj" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="phoneNumber" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Regime / Observações</mat-label>
                <textarea matInput formControlName="regimeObservacoes" rows="3"></textarea>
              </mat-form-field>

              <div class="actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                  {{ saving ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Cliente') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 600px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .form-card { padding: 16px; }
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; }
  `]
})
export class ClientFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  clientId = '';
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cpfCnpj: [''],
      phoneNumber: [''],
      regimeObservacoes: ['']
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId && this.clientId !== 'novo') {
      this.isEdit = true;
      this.loading = true;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.api.getClient(this.clientId).subscribe({
        next: (client: any) => {
          this.form.patchValue({
            fullName: client.fullName,
            email: client.email,
            cpfCnpj: client.cpfCnpj,
            phoneNumber: client.phoneNumber,
            regimeObservacoes: client.regimeObservacoes
          });
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving = true;

    if (this.isEdit) {
      const { fullName, cpfCnpj, phoneNumber, regimeObservacoes } = this.form.value;
      this.api.updateClient(this.clientId, { fullName, cpfCnpj, phoneNumber, regimeObservacoes }).subscribe({
        next: () => {
          this.snackBar.open('Cliente atualizado!', 'OK', { duration: 3000 });
          this.saving = false;
          this.router.navigate(['/app/admin/clientes']);
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar.', 'OK', { duration: 3000 });
          this.saving = false;
        }
      });
    } else {
      this.api.createClient(this.form.value).subscribe({
        next: () => {
          this.snackBar.open('Cliente criado!', 'OK', { duration: 3000 });
          this.saving = false;
          this.router.navigate(['/app/admin/clientes']);
        },
        error: (err) => {
          this.snackBar.open(err.error?.title || 'Erro ao criar.', 'OK', { duration: 5000 });
          this.saving = false;
        }
      });
    }
  }
}
