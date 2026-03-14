import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Calculator
  calculate(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/calculator`, data);
  }

  // Leads
  createContactLead(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/leads/contato`, data);
  }

  createCalculatorLead(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/leads/calculadora`, data);
  }

  getLeads(origem?: string): Observable<any[]> {
    let params = new HttpParams();
    if (origem) params = params.set('origem', origem);
    return this.http.get<any[]>(`${this.baseUrl}/api/leads`, { params });
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/leads/${id}`);
  }

  // Clients
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/clients`);
  }

  getClient(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/clients/${id}`);
  }

  createClient(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/clients`, data);
  }

  updateClient(id: string, data: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/clients/${id}`, data);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/clients/${id}`);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/clients/dashboard`);
  }

  // Pendencies
  getPendencies(clienteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    return this.http.get<any[]>(`${this.baseUrl}/api/pendencies`, { params });
  }

  getMyPendencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/pendencies/minhas`);
  }

  createPendency(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/pendencies`, data);
  }

  updatePendency(id: number, data: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/pendencies/${id}`, data);
  }

  deletePendency(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/pendencies/${id}`);
  }

  // Payment Links
  getPaymentLinks(clienteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    return this.http.get<any[]>(`${this.baseUrl}/api/paymentlinks`, { params });
  }

  getMyPaymentLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/paymentlinks/meus`);
  }

  createPaymentLink(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/paymentlinks`, data);
  }

  updatePaymentLink(id: number, data: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/paymentlinks/${id}`, data);
  }

  deletePaymentLink(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/paymentlinks/${id}`);
  }

  // Documents
  getDocuments(clienteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    return this.http.get<any[]>(`${this.baseUrl}/api/documents`, { params });
  }

  getMyDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/documents/meus`);
  }

  uploadDocument(file: File, clienteId: string, descricao?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clienteId', clienteId);
    if (descricao) formData.append('descricao', descricao);
    return this.http.post(`${this.baseUrl}/api/documents/upload`, formData);
  }

  uploadMyDocument(file: File, descricao?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (descricao) formData.append('descricao', descricao);
    return this.http.post(`${this.baseUrl}/api/documents/upload-meu`, formData);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/documents/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/documents/${id}`);
  }
}
