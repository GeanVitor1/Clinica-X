import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nomeClinica: string;
  email: string;
  senha: string;
  telefone: string;
  endereco?: string;
  nomeResponsavel?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  nome: string;
  isDemo?: boolean;
  clinicaId?: string;
}

interface StoredUser {
  email: string;
  nome: string;
  isDemo?: boolean;
  clinicaId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'clinica_token';
  private readonly USER_KEY = 'clinica_user';

  /** Token em signal para o computed reagir a login/logout sem reload. */
  private readonly tokenSignal = signal<string | null>(this.readStoredToken());

  readonly userEmail = signal<string | null>(null);
  readonly user = signal<StoredUser | null>(null);
  readonly isDemo = signal(false);

  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    return !this.isTokenExpired(token);
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as StoredUser;
        this.user.set(user);
        this.userEmail.set(user.email);
        this.isDemo.set(!!user.isDemo);
      } catch {
        /* ignore */
      }
    }

    // Sessão expirada: limpa tudo
    const token = this.tokenSignal();
    if (token && this.isTokenExpired(token)) {
      this.clearSession();
    }
  }

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request);
  }

  register(request: RegisterRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, request);
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
    if (!response?.token) {
      console.error('[Auth] LoginResponse sem token', response);
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, response.token);
    const stored: StoredUser = {
      email: response.email,
      nome: response.nome,
      isDemo: response.isDemo,
      clinicaId: response.clinicaId,
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(stored));

    // Atualiza signals (dispara recompute de isAuthenticated)
    this.tokenSignal.set(response.token);
    this.user.set(stored);
    this.userEmail.set(response.email);
    this.isDemo.set(!!response.isDemo);
  }

  /** Sai da conta e volta para a landing (index). */
  logout() {
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.user.set(null);
    this.userEmail.set(null);
    this.isDemo.set(false);
  }

  private readStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) return true;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      const exp = json.exp as number | undefined;
      if (!exp) return false;
      // 30s de margem
      return Date.now() >= exp * 1000 - 30_000;
    } catch {
      return true;
    }
  }
}
