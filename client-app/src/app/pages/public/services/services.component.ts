import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <section class="page-header">
        <h1>Nossos Serviços</h1>
        <p>Oferecemos soluções contábeis completas para empresas e profissionais da saúde, com foco em economia tributária e conformidade fiscal.</p>
      </section>

      <div class="services-grid">
        @for (service of services; track service.title) {
          <mat-card class="service-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ service.icon }}</mat-icon>
              <mat-card-title>{{ service.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ service.description }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <section class="cta-section">
        <h2>Precisa de algo específico?</h2>
        <a mat-raised-button color="primary" routerLink="/contato">Fale Conosco</a>
      </section>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2rem; margin-bottom: 12px; }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .service-card mat-icon[mat-card-avatar] { font-size: 36px; width: 36px; height: 36px; color: #e91e63; }
    .cta-section { text-align: center; padding: 40px 0; }
    .cta-section h2 { margin-bottom: 16px; }
  `]
})
export class ServicesComponent {
  services = [
    { icon: 'account_balance', title: 'Contabilidade Geral', description: 'Cuidamos de toda a contabilidade da sua empresa, garantindo organização financeira e cumprimento das obrigações fiscais.' },
    { icon: 'receipt_long', title: 'Imposto de Renda PF', description: 'Declaração completa do IRPF para profissionais de saúde, incluindo rendimentos de plantões, consultórios e participações societárias, garantindo todas as deduções legais.' },
    { icon: 'business', title: 'Abertura de Empresa', description: 'Abertura e regularização de PJ médica (clínicas, consultórios e sociedades), com escolha do melhor regime tributário e enquadramento no CNAE correto para sua atividade.' },
    { icon: 'calculate', title: 'Planejamento Tributário', description: 'Análise personalizada para identificar o regime tributário mais vantajoso — Simples Nacional, Lucro Presumido ou Lucro Real — reduzindo legalmente a carga de impostos.' },
    { icon: 'description', title: 'Obrigações Acessórias', description: 'Entrega pontual de DMED, DIRF, SPED, EFD-Contribuições e demais obrigações fiscais, evitando multas e mantendo sua empresa em dia com o fisco.' },
    { icon: 'gavel', title: 'Consultoria Fiscal', description: 'Consultoria especializada para médicos e profissionais de saúde sobre questões fiscais, societárias e trabalhistas, com orientação estratégica para cada fase do seu negócio.' },
  ];
}
