import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Calculator
  calculate(data: any): Observable<any> {
    return this.http.post('/api/calculator', data);
  }

  // Leads
  createContactLead(data: any): Observable<any> {
    return this.http.post('/api/leads/contato', data);
  }

  createCalculatorLead(data: any): Observable<any> {
    return this.http.post('/api/leads/calculadora', data);
  }

  getLeads(origem?: string): Observable<any[]> {
    let params = new HttpParams();
    if (origem) params = params.set('origem', origem);
    return this.http.get<any[]>('/api/leads', { params });
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`/api/leads/${id}`);
  }

  // Clients
  getClients(): Observable<any[]> {
    return this.http.get<any[]>('/api/clients');
  }

  getClient(id: string): Observable<any> {
    return this.http.get(`/api/clients/${id}`);
  }

  createClient(data: any): Observable<any> {
    return this.http.post('/api/clients', data);
  }

  updateClient(id: string, data: any): Observable<void> {
    return this.http.put<void>(`/api/clients/${id}`, data);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`/api/clients/${id}`);
  }

  getDashboard(): Observable<any> {
    return this.http.get('/api/clients/dashboard');
  }

  // Pendencies
  getPendencies(clienteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    return this.http.get<any[]>('/api/pendencies', { params });
  }

  getMyPendencies(): Observable<any[]> {
    return this.http.get<any[]>('/api/pendencies/minhas');
  }

  createPendency(data: any): Observable<any> {
    return this.http.post('/api/pendencies', data);
  }

  updatePendency(id: number, data: any): Observable<void> {
    return this.http.put<void>(`/api/pendencies/${id}`, data);
  }

  deletePendency(id: number): Observable<void> {
    return this.http.delete<void>(`/api/pendencies/${id}`);
  }

  // Payment Links
  getPaymentLinks(clienteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    return this.http.get<any[]>('/api/paymentlinks', { params });
  }

  getMyPaymentLinks(): Observable<any[]> {
    return this.http.get<any[]>('/api/paymentlinks/meus');
  }

  createPaymentLink(data: any): Observable<any> {
    return this.http.post('/api/paymentlinks', data);
  }

  updatePaymentLink(id: number, data: any): Observable<void> {
    return this.http.put<void>(`/api/paymentlinks/${id}`, data);
  }

  deletePaymentLink(id: number): Observable<void> {
    return this.http.delete<void>(`/api/paymentlinks/${id}`);
  }

  // Documents
  getDocuments(clienteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    return this.http.get<any[]>('/api/documents', { params });
  }

  getMyDocuments(): Observable<any[]> {
    return this.http.get<any[]>('/api/documents/meus');
  }

  uploadDocument(file: File, clienteId: string, descricao?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clienteId', clienteId);
    if (descricao) formData.append('descricao', descricao);
    return this.http.post('/api/documents/upload', formData);
  }

  uploadMyDocument(file: File, descricao?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (descricao) formData.append('descricao', descricao);
    return this.http.post('/api/documents/upload-meu', formData);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`/api/documents/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`/api/documents/${id}`);
  }
}
