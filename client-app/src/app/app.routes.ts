import { Routes } from '@angular/router';
import { authGuard, adminGuard, clientGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes with public layout
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/public/home/home.component').then(m => m.HomeComponent) },
      { path: 'servicos', loadComponent: () => import('./pages/public/services/services.component').then(m => m.ServicesComponent) },
      { path: 'medicos', loadComponent: () => import('./pages/public/doctors/doctors.component').then(m => m.DoctorsComponent) },
      { path: 'faq', loadComponent: () => import('./pages/public/faq/faq.component').then(m => m.FaqComponent) },
      { path: 'contato', loadComponent: () => import('./pages/public/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'calculadora', loadComponent: () => import('./pages/public/calculator/calculator.component').then(m => m.CalculatorComponent) },
      { path: 'login', loadComponent: () => import('./pages/public/login/login.component').then(m => m.LoginComponent) },
    ]
  },
  // Portal routes with portal layout (authenticated)
  {
    path: 'app',
    loadComponent: () => import('./layouts/portal-layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Client routes
      { path: 'dashboard', loadComponent: () => import('./pages/portal/client/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [clientGuard] },
      { path: 'meus-dados', loadComponent: () => import('./pages/portal/client/my-data/my-data.component').then(m => m.MyDataComponent), canActivate: [clientGuard] },
      { path: 'pagamentos', loadComponent: () => import('./pages/portal/client/payments/payments.component').then(m => m.PaymentsComponent), canActivate: [clientGuard] },
      { path: 'documentos', loadComponent: () => import('./pages/portal/client/documents/documents.component').then(m => m.DocumentsComponent), canActivate: [clientGuard] },
      // Admin routes
      { path: 'admin/clientes', loadComponent: () => import('./pages/portal/admin/clients/clients.component').then(m => m.AdminClientsComponent), canActivate: [adminGuard] },
      { path: 'admin/clientes/:id', loadComponent: () => import('./pages/portal/admin/client-form/client-form.component').then(m => m.ClientFormComponent), canActivate: [adminGuard] },
      { path: 'admin/pendencias', loadComponent: () => import('./pages/portal/admin/pendencies/pendencies.component').then(m => m.AdminPendenciesComponent), canActivate: [adminGuard] },
      { path: 'admin/pagamentos', loadComponent: () => import('./pages/portal/admin/payment-links/payment-links.component').then(m => m.AdminPaymentLinksComponent), canActivate: [adminGuard] },
      { path: 'admin/leads', loadComponent: () => import('./pages/portal/admin/leads/leads.component').then(m => m.AdminLeadsComponent), canActivate: [adminGuard] },
      { path: 'admin/documentos', loadComponent: () => import('./pages/portal/admin/documents/admin-documents.component').then(m => m.AdminDocumentsComponent), canActivate: [adminGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
