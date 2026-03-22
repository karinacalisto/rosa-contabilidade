import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatListModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard">
      @if (loading) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else if (data) {
        <h1>Olá, {{ data.fullName }}!</h1>
        <p class="subtitle">Bem-vindo ao seu portal de contabilidade</p>

        <div class="cards-grid">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Dados Cadastrais</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>E-mail:</strong> {{ data.email }}</p>
              <p><strong>CPF/CNPJ:</strong> {{ data.cpfCnpj || 'Não informado' }}</p>
              <p><strong>Regime:</strong> {{ data.regimeObservacoes || 'Não informado' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/app/meus-dados">Editar dados</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar class="warn-icon">pending_actions</mat-icon>
              <mat-card-title>Pendências ({{ data.pendencias?.length || 0 }})</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (data.pendencias?.length) {
                <mat-list>
                  @for (p of data.pendencias.slice(0, 5); track p.id) {
                    <mat-list-item>
                      <mat-icon matListItemIcon [class.resolved]="p.resolvida">
                        {{ p.resolvida ? 'check_circle' : 'radio_button_unchecked' }}
                      </mat-icon>
                      <span matListItemTitle>{{ p.descricao }}</span>
                      @if (p.dataLimite) {
                        <span matListItemLine>Prazo: {{ p.dataLimite | date:'dd/MM/yyyy' }}</span>
                      }
                    </mat-list-item>
                  }
                </mat-list>
              } @else {
                <p>Nenhuma pendência no momento.</p>
              }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>payment</mat-icon>
              <mat-card-title>Pagamentos ({{ data.linksPagamento?.length || 0 }})</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (data.linksPagamento?.length) {
                <mat-list>
                  @for (p of data.linksPagamento.slice(0, 5); track p.id) {
                    <mat-list-item>
                      <mat-icon matListItemIcon [class.paid]="p.pago">
                        {{ p.pago ? 'check_circle' : 'pending' }}
                      </mat-icon>
                      <span matListItemTitle>{{ p.descricao }}</span>
                      <span matListItemLine>
                        R$ {{ p.valor | number:'1.2-2' }}
                        @if (!p.pago) {
                          - <a [href]="p.url" target="_blank">Pagar</a>
                        }
                      </span>
                    </mat-list-item>
                  }
                </mat-list>
              } @else {
                <p>Nenhum pagamento pendente.</p>
              }
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/app/pagamentos">Ver todos</a>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>folder</mat-icon>
              <mat-card-title>Documentos ({{ data.documentos?.length || 0 }})</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (data.documentos?.length) {
                <mat-list>
                  @for (d of data.documentos.slice(0, 5); track d.id) {
                    <mat-list-item>
                      <mat-icon matListItemIcon>description</mat-icon>
                      <span matListItemTitle>{{ d.nomeOriginal }}</span>
                      <span matListItemLine>{{ d.createdAt | date:'dd/MM/yyyy' }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              } @else {
                <p>Nenhum documento disponível.</p>
              }
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/app/documentos">Ver todos</a>
            </mat-card-actions>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }
    .dashboard h1 { margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 24px; }
    :host-context(.dark-theme) .subtitle { color: #aaa; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }
    .warn-icon { color: #ff9800 !important; }
    .resolved { color: #4caf50 !important; }
    .paid { color: #4caf50 !important; }
    mat-icon[mat-card-avatar] { font-size: 36px; width: 36px; height: 36px; color: #e91e63; }
  `]
})
export class DashboardComponent implements OnInit {
  data: any = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (res) => { this.data = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
