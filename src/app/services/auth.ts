import { Injectable } from '@angular/core';
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

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    registeredDate: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body);
  }

  register(fullName: string, email: string, password: string, confirmPassword: string): Observable<AuthResponse> {
    const body: RegisterRequest = { fullName, email, password, confirmPassword };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
