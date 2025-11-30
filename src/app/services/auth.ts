import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  registeredDate: string;
}

export interface TokenInfo {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body);
  }

  register(fullName: string, email: string, password: string, confirmPassword: string): Observable<AuthResponse> {
    const body: RegisterRequest = { fullName, email, password, confirmPassword };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body);
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  saveUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUser(): User | null {
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Decodificar JWT sin librería externa
  private decodeToken(token: string): TokenInfo | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as TokenInfo;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Obtener información del token
  getTokenInfo(): TokenInfo | null {
    const token = this.getToken();
    return token ? this.decodeToken(token) : null;
  }

  // Obtener tiempo de expiración del token en minutos
  getTokenExpirationTime(): number | null {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) return null;

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = tokenInfo.exp - now;

    return expiresIn > 0 ? Math.floor(expiresIn / 60) : 0;
  }

  // Verificar si el token está próximo a expirar
  isTokenExpiringSoon(minutesThreshold: number = 5): boolean {
    const expirationTime = this.getTokenExpirationTime();
    return expirationTime !== null && expirationTime <= minutesThreshold;
  }
}
