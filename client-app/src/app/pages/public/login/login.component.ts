import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="brand-icon">account_balance</mat-icon>
          <mat-card-title>Rosa Contabilidade</mat-card-title>
          <mat-card-subtitle>Acesse seu portal</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group [(selectedIndex)]="tabIndex" animationDuration="200ms">
            <mat-tab label="Entrar">
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="form-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>E-mail</mat-label>
                  <input matInput formControlName="email" type="email" />
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Senha</mat-label>
                  <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" />
                  <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>

                @if (loginError) {
                  <p class="error-msg">{{ loginError }}</p>
                }

                <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading" class="full-width">
                  @if (loading) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Entrar
                  }
                </button>

                <button mat-button type="button" (click)="tabIndex = 1" class="forgot-btn">Esqueci minha senha</button>
              </form>
            </mat-tab>

            <mat-tab label="Recuperar Senha">
              <form [formGroup]="forgotForm" (ngSubmit)="onForgotPassword()" class="form-content">
                <p>Informe seu e-mail para receber o token de redefinição.</p>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>E-mail</mat-label>
                  <input matInput formControlName="email" type="email" />
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" [disabled]="forgotForm.invalid || loading" class="full-width">
                  Enviar Token
                </button>

                @if (resetToken) {
                  <div class="token-display">
                    <p><strong>Token de redefinição (DEV):</strong></p>
                    <code>{{ resetToken }}</code>
                  </div>
                }

                @if (resetToken) {
                  <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()" class="form-content">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Token</mat-label>
                      <input matInput formControlName="token" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nova Senha</mat-label>
                      <input matInput formControlName="newPassword" type="password" />
                    </mat-form-field>
                    <button mat-raised-button color="accent" type="submit" [disabled]="resetForm.invalid" class="full-width">
                      Redefinir Senha
                    </button>
                  </form>
                }

                <button mat-button type="button" (click)="tabIndex = 0">Voltar ao login</button>
              </form>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px - 250px);
      padding: 40px 20px;
    }
    .login-card { max-width: 450px; width: 100%; padding: 16px; }
    .brand-icon { font-size: 40px !important; width: 40px !important; height: 40px !important; color: #e91e63; }
    .form-content { padding-top: 24px; }
    .full-width { width: 100%; }
    .error-msg { color: #f44336; margin-bottom: 16px; font-size: 0.9rem; }
    .forgot-btn { margin-top: 8px; }
    .token-display {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 8px;
      margin: 16px 0;
      word-break: break-all;
    }
    :host-context(.dark-theme) .token-display { background: #1a237e; }
    .token-display code { font-size: 0.85rem; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  forgotForm: FormGroup;
  resetForm: FormGroup;
  hidePassword = true;
  loading = false;
  loginError = '';
  resetToken = '';
  tabIndex = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (this.auth.isLoggedIn) {
      this.redirectUser();
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.loginError = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.redirectUser();
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err.error?.title || 'Erro ao fazer login. Verifique suas credenciais.';
      }
    });
  }

  onForgotPassword(): void {
    this.loading = true;
    this.auth.forgotPassword(this.forgotForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.resetToken = res.devToken || '';
        this.resetForm.patchValue({ token: this.resetToken });
        this.snackBar.open('Token gerado com sucesso.', 'OK', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao gerar token.', 'OK', { duration: 3000 });
      }
    });
  }

  onResetPassword(): void {
    const payload = {
      email: this.forgotForm.value.email,
      token: this.resetForm.value.token,
      newPassword: this.resetForm.value.newPassword
    };
    this.auth.resetPassword(payload).subscribe({
      next: () => {
        this.snackBar.open('Senha redefinida com sucesso! Faça login.', 'OK', { duration: 5000 });
        this.tabIndex = 0;
        this.resetToken = '';
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Erro ao redefinir senha.', 'OK', { duration: 5000 });
      }
    });
  }

  private redirectUser(): void {
    if (this.auth.isAdmin) {
      this.router.navigate(['/app/admin/clientes']);
    } else {
      this.router.navigate(['/app/dashboard']);
    }
  }
}
