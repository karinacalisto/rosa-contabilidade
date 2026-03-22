import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { SendLeadDialogComponent } from './send-lead-dialog.component';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule, MatDialogModule],
  template: `
    <div class="page-container">
      <section class="page-header">
        <h1>Calculadora de Impostos</h1>
        <p>Simule de forma educativa a estimativa de impostos para PF ou PJ</p>
        <p class="disclaimer"><mat-icon>info</mat-icon> Esta é uma simulação educativa e não substitui a orientação de um contador profissional.</p>
      </section>

      <div class="calc-grid">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Dados da Simulação</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="calcular()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tipo de Pessoa</mat-label>
                <mat-select formControlName="tipoPessoa">
                  <mat-option value="PF">Pessoa Física (PF)</mat-option>
                  <mat-option value="PJ">Pessoa Jurídica (PJ)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Receita Mensal (R$)</mat-label>
                <input matInput formControlName="receitaMensal" type="number" min="0" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Despesas Dedutíveis (R$) - opcional</mat-label>
                <input matInput formControlName="despesasDedutiveis" type="number" min="0" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Alíquota Estimada (%) - opcional</mat-label>
                <input matInput formControlName="aliquotaEstimadaPct" type="number" min="0" max="100" />
                <mat-hint>Deixe em branco para cálculo automático</mat-hint>
              </mat-form-field>

              @if (form.get('tipoPessoa')?.value === 'PJ') {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Regime Tributário</mat-label>
                  <mat-select formControlName="opcaoRegime">
                    <mat-option value="simples">Simples Nacional</mat-option>
                    <mat-option value="geral">Lucro Presumido</mat-option>
                  </mat-select>
                </mat-form-field>
              }

              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" class="full-width">
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Calcular
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        @if (resultado) {
          <mat-card class="result-card">
            <mat-card-header>
              <mat-card-title>Resultado da Simulação</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="result-main">
                <div class="result-item big">
                  <span class="label">Imposto Estimado Mensal</span>
                  <span class="value">R$ {{ resultado.impostoEstimadoMensal | number:'1.2-2' }}</span>
                </div>
                <div class="result-item">
                  <span class="label">% Efetiva sobre Receita</span>
                  <span class="value">{{ resultado.percentualEfetivo * 100 | number:'1.2-2' }}%</span>
                </div>
                <div class="result-item">
                  <span class="label">Base de Cálculo</span>
                  <span class="value">R$ {{ resultado.baseCalculo | number:'1.2-2' }}</span>
                </div>
                <div class="result-item">
                  <span class="label">Tipo</span>
                  <span class="value">{{ resultado.tipoPessoa }} - {{ resultado.regime }}</span>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="details">
                <h4>Detalhes</h4>
                @for (detalhe of resultado.detalhes; track detalhe) {
                  <p>• {{ detalhe }}</p>
                }
              </div>

              <div class="warning">
                <mat-icon>warning</mat-icon>
                <p>{{ resultado.aviso }}</p>
              </div>

              <button mat-raised-button color="accent" (click)="enviarParaContabilidade()" class="full-width send-btn">
                <mat-icon>send</mat-icon> Enviar resultado para a contabilidade
              </button>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2rem; margin-bottom: 12px; }
    .disclaimer { display: flex; align-items: center; justify-content: center; gap: 8px; color: #ff9800; font-size: 0.9rem; }
    .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
    .full-width { width: 100%; }
    .form-card { padding: 16px; }
    .result-card { padding: 16px; }
    .result-main { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
    .result-item { display: flex; justify-content: space-between; align-items: center; }
    .result-item.big .value { font-size: 1.5rem; font-weight: 700; color: #e91e63; }
    .result-item .label { font-weight: 500; }
    .details { margin: 16px 0; }
    .details h4 { margin-bottom: 8px; }
    .warning { display: flex; align-items: flex-start; gap: 8px; background: #fff3e0; padding: 12px; border-radius: 8px; margin: 16px 0; }
    :host-context(.dark-theme) .warning { background: #3e2723; }
    .warning mat-icon { color: #ff9800; flex-shrink: 0; }
    .send-btn { margin-top: 16px; }
    @media (max-width: 768px) {
      .calc-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CalculatorComponent {
  form: FormGroup;
  loading = false;
  resultado: any = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      tipoPessoa: ['PJ', Validators.required],
      receitaMensal: [null, [Validators.required, Validators.min(0)]],
      despesasDedutiveis: [null],
      aliquotaEstimadaPct: [null],
      opcaoRegime: ['simples']
    });
  }

  calcular(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    const payload = {
      tipoPessoa: val.tipoPessoa,
      receitaMensal: val.receitaMensal,
      despesasDedutiveis: val.despesasDedutiveis || 0,
      aliquotaEstimada: val.aliquotaEstimadaPct ? val.aliquotaEstimadaPct / 100 : null,
      opcaoRegime: val.opcaoRegime
    };
    this.api.calculate(payload).subscribe({
      next: (res) => { this.resultado = res; this.loading = false; },
      error: () => { this.snackBar.open('Erro ao calcular.', 'OK', { duration: 3000 }); this.loading = false; }
    });
  }

  enviarParaContabilidade(): void {
    const dialogRef = this.dialog.open(SendLeadDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        const val = this.form.value;
        const payload = {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          tipoPessoa: val.tipoPessoa,
          receitaMensal: val.receitaMensal,
          despesasDedutiveis: val.despesasDedutiveis || 0,
          aliquotaEstimada: val.aliquotaEstimadaPct ? val.aliquotaEstimadaPct / 100 : null,
          opcaoRegime: val.opcaoRegime,
          impostoEstimado: this.resultado.impostoEstimadoMensal,
          percentualEfetivo: this.resultado.percentualEfetivo
        };
        this.api.createCalculatorLead(payload).subscribe({
          next: () => this.snackBar.open('Resultado enviado! Entraremos em contato.', 'OK', { duration: 5000 }),
          error: () => this.snackBar.open('Erro ao enviar. Tente novamente.', 'OK', { duration: 5000 })
        });
      }
    });
  }
}
