import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-my-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
    <div class="page">
      <h1>Meus Dados</h1>

      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Dados Pessoais</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSave()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome Completo</mat-label>
                <input matInput formControlName="fullName" />
              </mat-form-field>
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
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-divider class="divider"></mat-divider>

        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Alterar Senha</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Senha Atual</mat-label>
                <input matInput formControlName="currentPassword" type="password" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nova Senha</mat-label>
                <input matInput formControlName="newPassword" type="password" />
              </mat-form-field>
              <button mat-raised-button color="accent" type="submit" [disabled]="passwordForm.invalid || savingPw">
                {{ savingPw ? 'Salvando...' : 'Alterar Senha' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 600px; }
    .page h1 { margin-bottom: 24px; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .form-card { padding: 16px; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .divider { margin: 24px 0; }
  `]
})
export class MyDataComponent implements OnInit {
  form: FormGroup;
  passwordForm: FormGroup;
  loading = true;
  saving = false;
  savingPw = false;
  userId = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      cpfCnpj: [''],
      phoneNumber: [''],
      regimeObservacoes: ['']
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.auth.getMe().subscribe({
      next: (user: any) => {
        this.userId = user.id;
        this.form.patchValue({
          fullName: user.fullName,
          cpfCnpj: user.cpfCnpj,
          phoneNumber: user.phoneNumber,
          regimeObservacoes: user.regimeObservacoes
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.updateClient(this.userId, this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Dados atualizados!', 'OK', { duration: 3000 });
        this.saving = false;
      },
      error: () => {
        this.snackBar.open('Erro ao salvar.', 'OK', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPw = true;
    this.auth.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.snackBar.open('Senha alterada!', 'OK', { duration: 3000 });
        this.passwordForm.reset();
        this.savingPw = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Erro ao alterar senha.', 'OK', { duration: 5000 });
        this.savingPw = false;
      }
    });
  }
}
