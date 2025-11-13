import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Authentication Service (stubbed)
 * TODO: Implement actual authentication logic
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Current user signal
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  // Authentication state
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);

  // Token storage (in production, use secure storage)
  private tokenKey = 'auth_token';

  constructor(private router: Router) {
    // Check for existing session on init
    this.checkExistingSession();
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<User> {
    // TODO: Replace with actual API call
    return of({
      id: '1',
      name: 'John Doe',
      email: email,
      role: 'admin',
    } as User).pipe(
      delay(1000), // Simulate API delay
      tap((user) => {
        this.currentUserSignal.set(user);
        // TODO: Store token securely
        localStorage.setItem(this.tokenKey, 'mock_token_' + Date.now());
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user has a valid session
   */
  private checkExistingSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // TODO: Validate token with backend
      // For now, set a mock user
      this.currentUserSignal.set({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      });
    }
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}

