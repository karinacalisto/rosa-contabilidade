import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  role: string;
  userId: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  private currentUserSubject = new BehaviorSubject<TokenResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API}/login`, request).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('access_token', user.accessToken);
        localStorage.setItem('refresh_token', user.refreshToken);
        this.currentUserSubject.next(user);
      })
    );
  }

  refresh(): Observable<TokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token') || '';
    return this.http.post<TokenResponse>(`${this.API}/refresh`, { refreshToken }).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('access_token', user.accessToken);
        localStorage.setItem('refresh_token', user.refreshToken);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.API}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API}/reset-password`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API}/change-password`, request);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.API}/me`);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get currentUser(): TokenResponse | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get isCliente(): boolean {
    return this.currentUser?.role === 'CLIENTE';
  }
}
