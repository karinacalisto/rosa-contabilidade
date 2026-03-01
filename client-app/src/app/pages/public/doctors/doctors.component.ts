import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <section class="page-header">
        <h1>Para Médicos</h1>
        <p>[PLACEHOLDER: Por que médicos precisam de contabilidade especializada]</p>
      </section>

      <section class="benefits">
        <h2>Benefícios Exclusivos</h2>
        <div class="benefits-grid">
          @for (item of benefits; track item.title) {
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>{{ item.icon }}</mat-icon>
                <mat-card-title>{{ item.title }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>{{ item.description }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>

      <section class="regime-section">
        <h2>PF ou PJ? Entenda a melhor opção</h2>
        <div class="regime-grid">
          <mat-card>
            <mat-card-header><mat-card-title>Pessoa Física</mat-card-title></mat-card-header>
            <mat-card-content>
              <p>[PLACEHOLDER: Vantagens e desvantagens de atuar como PF]</p>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>Pessoa Jurídica</mat-card-title></mat-card-header>
            <mat-card-content>
              <p>[PLACEHOLDER: Vantagens e desvantagens de abrir PJ médica]</p>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="cta-center">
          <a mat-raised-button color="accent" routerLink="/calculadora">Simule seus impostos</a>
        </div>
      </section>

      <section class="cta-section">
        <h2>Agende uma consultoria gratuita</h2>
        <p>[PLACEHOLDER: Chamada para médicos entrarem em contato]</p>
        <a mat-raised-button color="primary" routerLink="/contato">Agendar Agora</a>
      </section>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2rem; margin-bottom: 12px; }
    .benefits { margin-bottom: 40px; }
    .benefits h2 { text-align: center; margin-bottom: 24px; }
    .benefits-grid, .regime-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    .benefits-grid mat-icon[mat-card-avatar] { font-size: 36px; width: 36px; height: 36px; color: #e91e63; }
    .regime-section { margin-bottom: 40px; }
    .regime-section h2 { text-align: center; margin-bottom: 24px; }
    .cta-center { text-align: center; margin-top: 24px; }
    .cta-section { text-align: center; padding: 40px 0; }
    .cta-section h2 { margin-bottom: 16px; }
    .cta-section p { margin-bottom: 24px; }
  `]
})
export class DoctorsComponent {
  benefits = [
    { icon: 'medical_services', title: 'Especialistas em Saúde', description: '[PLACEHOLDER: Entendemos as particularidades da área médica]' },
    { icon: 'trending_down', title: 'Redução de Impostos', description: '[PLACEHOLDER: Estratégias legais para pagar menos impostos]' },
    { icon: 'schedule', title: 'Sem Burocracia', description: '[PLACEHOLDER: Cuidamos de toda a parte contábil para você focar no que importa]' },
    { icon: 'shield', title: 'Conformidade Total', description: '[PLACEHOLDER: Segurança com todas as obrigações em dia]' },
  ];
}
