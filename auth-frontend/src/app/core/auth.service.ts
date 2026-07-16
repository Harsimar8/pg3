import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenStorageKey = 'auth_token';
  private readonly userStorageKey = 'auth_user';
  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());
  readonly isAuthenticated = signal<boolean>(this.hasStoredToken());

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload) {
    return this.http
      .post<any>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<any>(`${environment.apiBaseUrl}/auth/register`, payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  getProfile() {
    return this.http.get<any>(`${environment.apiBaseUrl}/auth/profile`).pipe(
      tap((response) => {
        const user = response?.user ?? response?.profile ?? response?.data ?? null;
        if (user) {
          this.currentUser.set(user);
          localStorage.setItem(this.userStorageKey, JSON.stringify(user));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  private handleAuthResponse(response: any) {
    const token = response?.token ?? response?.accessToken ?? response?.data?.token ?? response?.data?.accessToken;
    const user = response?.user ?? response?.profile ?? response?.data?.user ?? response?.data?.profile ?? null;

    if (token) {
      localStorage.setItem(this.tokenStorageKey, token);
      this.isAuthenticated.set(true);
    } else {
      this.isAuthenticated.set(false);
    }

    if (user) {
      this.currentUser.set(user);
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));
    }
  }

  private hasStoredToken(): boolean {
    return Boolean(this.getToken());
  }

  private loadStoredUser(): AuthUser | null {
    const stored = localStorage.getItem(this.userStorageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      localStorage.removeItem(this.userStorageKey);
      return null;
    }
  }
}
