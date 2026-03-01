import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="portal-container">
      <mat-toolbar color="primary" class="portal-toolbar">
        <button mat-icon-button (click)="sidenavOpen = !sidenavOpen">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="brand">Rosa Contabilidade</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="theme.toggle()">
          <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div mat-menu-item disabled class="user-info">
            <strong>{{ auth.currentUser?.fullName }}</strong>
            <br><small>{{ auth.currentUser?.role }}</small>
          </div>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/">
            <mat-icon>home</mat-icon> Site
          </a>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Sair
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav [opened]="sidenavOpen" mode="side" class="sidenav">
          <mat-nav-list>
            @if (auth.isAdmin) {
              <h3 matSubheader>Administração</h3>
              <a mat-list-item routerLink="/app/admin/clientes" routerLinkActive="active">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Clientes</span>
              </a>
              <a mat-list-item routerLink="/app/admin/pendencias" routerLinkActive="active">
                <mat-icon matListItemIcon>pending_actions</mat-icon>
                <span matListItemTitle>Pendências</span>
              </a>
              <a mat-list-item routerLink="/app/admin/pagamentos" routerLinkActive="active">
                <mat-icon matListItemIcon>payment</mat-icon>
                <span matListItemTitle>Pagamentos</span>
              </a>
              <a mat-list-item routerLink="/app/admin/documentos" routerLinkActive="active">
                <mat-icon matListItemIcon>folder</mat-icon>
                <span matListItemTitle>Documentos</span>
              </a>
              <a mat-list-item routerLink="/app/admin/leads" routerLinkActive="active">
                <mat-icon matListItemIcon>contact_mail</mat-icon>
                <span matListItemTitle>Leads</span>
              </a>
            }
            @if (auth.isCliente) {
              <h3 matSubheader>Meu Portal</h3>
              <a mat-list-item routerLink="/app/dashboard" routerLinkActive="active">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/app/meus-dados" routerLinkActive="active">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>Meus Dados</span>
              </a>
              <a mat-list-item routerLink="/app/pagamentos" routerLinkActive="active">
                <mat-icon matListItemIcon>payment</mat-icon>
                <span matListItemTitle>Pagamentos</span>
              </a>
              <a mat-list-item routerLink="/app/documentos" routerLinkActive="active">
                <mat-icon matListItemIcon>folder</mat-icon>
                <span matListItemTitle>Documentos</span>
              </a>
            }
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .portal-container { display: flex; flex-direction: column; height: 100vh; }
    .portal-toolbar { position: sticky; top: 0; z-index: 1000; }
    .brand { font-weight: 600; margin-left: 8px; }
    .spacer { flex: 1; }
    .sidenav-container { flex: 1; }
    .sidenav { width: 250px; }
    .main-content { padding: 24px; }
    .user-info { line-height: 1.4; }
    .active { background: rgba(0,0,0,0.04) !important; }
    :host-context(.dark-theme) .active { background: rgba(255,255,255,0.08) !important; }
  `]
})
export class PortalLayoutComponent {
  sidenavOpen = true;
  constructor(public theme: ThemeService, public auth: AuthService) {}
}
