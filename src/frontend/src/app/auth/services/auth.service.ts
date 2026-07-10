import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'clinica_token';
  private readonly USER_KEY = 'clinica_user';

  readonly isAuthenticated = signal(!!this.getToken());
  readonly userEmail = signal<string | null>(null);
  readonly user = signal<LoginResponse | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as LoginResponse;
        this.user.set(user);
        this.userEmail.set(user.email);
      } catch { /* ignore */ }
    }
  }

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string; resetToken?: string | null; resetUrl?: string | null }>(
      `${environment.apiUrl}/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(body: { email: string; token: string; novaSenha: string }) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, body);
  }

  setSession(response: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.isAuthenticated.set(true);
    this.user.set(response);
    this.userEmail.set(response.email);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.userEmail.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
