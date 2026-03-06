import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Contabilidade Especializada para Profissionais da Saúde</h1>
        <p>Soluções contábeis inteligentes para quem dedica a vida a cuidar de pessoas.</p>
        <div class="hero-actions">
          <a mat-raised-button color="primary" routerLink="/contato" class="cta-btn">Fale Conosco</a>
          <a mat-raised-button color="accent" routerLink="/calculadora" class="cta-btn">Simular Impostos</a>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Por que escolher a Rosa Contabilidade?</h2>
      <div class="features-grid">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>medical_services</mat-icon>
            <mat-card-title>Especialistas em Saúde</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>A Rosa Contabilidade une tecnologia, organização e atendimento humano para simplificar a gestão financeira do seu negócio. Cuidamos da parte contábil com responsabilidade e transparência para que você possa focar no que realmente importa: fazer sua empresa crescer.</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>savings</mat-icon>
            <mat-card-title>Economia Tributária</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Analisamos o regime tributário ideal para sua empresa, garantindo o pagamento correto de impostos e identificando oportunidades legais de economia.</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>support_agent</mat-icon>
            <mat-card-title>Atendimento Dedicado</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Oferecemos um atendimento personalizado e dedicado, com profissionais qualificados para atender às necessidades específicas de cada cliente.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </section>

    <section class="cta-section">
      <h2>Pronto para simplificar sua contabilidade?</h2>
      <p>Fale com nossa equipe e descubra como podemos cuidar da sua contabilidade com clareza e eficiência.</p>
      <a mat-raised-button color="primary" routerLink="/contato" class="cta-btn">Entre em Contato</a>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #1a237e 0%, #e91e63 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
    }
    .hero-content { max-width: 800px; margin: 0 auto; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 20px; }
    .hero p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .cta-btn { padding: 8px 32px !important; font-size: 1rem; }
    .features {
      padding: 60px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    .features h2 { margin-bottom: 40px; font-size: 2rem; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .features-grid mat-card { text-align: left; }
    .features-grid mat-icon[mat-card-avatar] { font-size: 40px; width: 40px; height: 40px; color: #e91e63; }
    .cta-section {
      background: #f5f5f5;
      padding: 60px 20px;
      text-align: center;
    }
    :host-context(.dark-theme) .cta-section { background: #1e1e1e; }
    .cta-section h2 { margin-bottom: 16px; }
    .cta-section p { margin-bottom: 24px; font-size: 1.1rem; }
  `]
})
export class HomeComponent {}
