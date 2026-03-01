import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <section class="page-header">
        <h1>Contato</h1>
        <p>Entre em contato conosco. Teremos prazer em atendê-lo.</p>
      </section>

      <div class="contact-grid">
        <mat-card class="contact-form-card">
          <mat-card-header>
            <mat-card-title>Envie sua mensagem</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="nome" />
                @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
                  <mat-error>Nome é obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail</mat-label>
                <input matInput formControlName="email" type="email" />
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>E-mail é obrigatório</mat-error>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>E-mail inválido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="telefone" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mensagem</mat-label>
                <textarea matInput formControlName="mensagem" rows="5"></textarea>
                @if (form.get('mensagem')?.hasError('required') && form.get('mensagem')?.touched) {
                  <mat-error>Mensagem é obrigatória</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" class="full-width">
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Enviar Mensagem
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="contact-info">
          <mat-card>
            <mat-card-content>
              <div class="info-item">
                <mat-icon>phone</mat-icon>
                <div>
                  <strong>Telefone</strong>
                  <p>[PLACEHOLDER: (XX) XXXXX-XXXX]</p>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>email</mat-icon>
                <div>
                  <strong>E-mail</strong>
                  <p>[PLACEHOLDER: contato&#64;rosacontabilidade.com.br]</p>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>location_on</mat-icon>
                <div>
                  <strong>Endereço</strong>
                  <p>[PLACEHOLDER: Endereço completo]</p>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <div>
                  <strong>Horário</strong>
                  <p>[PLACEHOLDER: Seg-Sex, 8h às 18h]</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2rem; margin-bottom: 12px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 350px; gap: 24px; }
    .full-width { width: 100%; }
    .contact-form-card { padding: 16px; }
    .info-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
    .info-item mat-icon { color: #e91e63; margin-top: 4px; }
    .info-item p { margin: 4px 0 0; }
    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      mensagem: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.api.createContactLead(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Mensagem enviada com sucesso! Entraremos em contato.', 'OK', { duration: 5000 });
        this.form.reset();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao enviar mensagem. Tente novamente.', 'OK', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
