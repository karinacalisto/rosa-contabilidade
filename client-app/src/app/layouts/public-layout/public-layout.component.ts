import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/" class="brand">
        <mat-icon>account_balance</mat-icon>
        <span>Rosa Contabilidade</span>
      </a>
      <span class="spacer"></span>
      <nav class="nav-links desktop-only">
        <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a mat-button routerLink="/servicos" routerLinkActive="active">Serviços</a>
        <a mat-button routerLink="/medicos" routerLinkActive="active">Para Médicos</a>
        <a mat-button routerLink="/calculadora" routerLinkActive="active">Calculadora</a>
        <a mat-button routerLink="/faq" routerLinkActive="active">FAQ</a>
        <a mat-button routerLink="/contato" routerLinkActive="active">Contato</a>
      </nav>
      <button mat-icon-button (click)="theme.toggle()" matTooltip="Alternar tema">
        <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
      @if (auth.isLoggedIn) {
        <a mat-raised-button color="accent" routerLink="/app/dashboard">Portal</a>
      } @else {
        <a mat-raised-button color="accent" routerLink="/login">Entrar</a>
      }
      <button mat-icon-button [matMenuTriggerFor]="mobileMenu" class="mobile-only">
        <mat-icon>menu</mat-icon>
      </button>
      <mat-menu #mobileMenu="matMenu">
        <a mat-menu-item routerLink="/">Home</a>
        <a mat-menu-item routerLink="/servicos">Serviços</a>
        <a mat-menu-item routerLink="/medicos">Para Médicos</a>
        <a mat-menu-item routerLink="/calculadora">Calculadora</a>
        <a mat-menu-item routerLink="/faq">FAQ</a>
        <a mat-menu-item routerLink="/contato">Contato</a>
      </mat-menu>
    </mat-toolbar>

    <main class="content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Rosa Contabilidade</h3>
          <p>[PLACEHOLDER: Descrição curta da empresa]</p>
        </div>
        <div class="footer-section">
          <h3>Contato</h3>
          <p>[PLACEHOLDER: Telefone]</p>
          <p>[PLACEHOLDER: E-mail]</p>
          <p>[PLACEHOLDER: Endereço]</p>
        </div>
        <div class="footer-section">
          <h3>Links</h3>
          <a routerLink="/servicos">Serviços</a>
          <a routerLink="/medicos">Para Médicos</a>
          <a routerLink="/contato">Contato</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Rosa Contabilidade. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
      font-weight: 600;
      font-size: 1.1rem;
    }
    .spacer { flex: 1; }
    .nav-links { display: flex; gap: 4px; }
    .nav-links a.active { opacity: 1; font-weight: 600; }
    .content { min-height: calc(100vh - 64px - 250px); }
    .footer {
      background: #1a1a2e;
      color: #eee;
      padding: 40px 20px 20px;
    }
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    .footer-section h3 { margin-bottom: 12px; color: #e91e63; }
    .footer-section a { display: block; color: #ccc; text-decoration: none; margin: 4px 0; }
    .footer-section a:hover { color: #fff; }
    .footer-bottom {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #333;
    }
    .mobile-only { display: none; }
    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: inline-flex !important; }
    }
  `]
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();
  constructor(public theme: ThemeService, public auth: AuthService) {}
}
