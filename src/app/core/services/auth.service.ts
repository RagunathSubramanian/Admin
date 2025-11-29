import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';
import { UserConfigService } from './user-config.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

/**
 * Authentication Service (stubbed)
 * TODO: Implement actual authentication logic
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userConfigService = inject(UserConfigService);
  
  // Current user signal
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  // Authentication state
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  
  // Check if current user is admin
  public isAdmin = computed(() => {
    const user = this.currentUserSignal();
    return user?.role === 'admin';
  });

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
      name: this.getUserNameFromEmail(email),
      email: email.toLowerCase(),
      role: this.determineRole(email),
    } as User).pipe(
      delay(1000), // Simulate API delay
      tap((user) => {
        this.currentUserSignal.set(user);
        // TODO: Store token securely
        localStorage.setItem(this.tokenKey, 'mock_token_' + Date.now());
        // Clean email before storing - ensure it's just the email, no route paths
        const cleanEmail = user.email.trim().toLowerCase();
        if (cleanEmail.includes('@') && !cleanEmail.includes('/')) {
          localStorage.setItem('user_email', cleanEmail);
        } else {
          console.error('Invalid email format detected:', user.email);
        }
      })
    );
  }

  /**
   * Determine user role based on email configuration
   */
  private determineRole(email: string): 'admin' | 'user' {
    const role = this.userConfigService.getRoleForEmail(email);
    return role || 'user'; // Default to 'user' if not configured
  }

  /**
   * Get user name from email (extract name part before @)
   */
  private getUserNameFromEmail(email: string): string {
    const namePart = email.split('@')[0];
    // Capitalize first letter of each word
    return namePart
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_email'); // Clear user email as well
    this.router.navigate(['/login']);
  }

  /**
   * Check if user has a valid session
   */
  private checkExistingSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const storedEmail = localStorage.getItem('user_email');
    
    if (token && storedEmail) {
      // Clean and validate stored email
      const cleanEmail = storedEmail.trim().toLowerCase();
      // Only restore if email is valid (contains @ and no route paths)
      if (cleanEmail.includes('@') && !cleanEmail.includes('/')) {
        // TODO: Validate token with backend
        // Restore user from stored email
        this.currentUserSignal.set({
          id: '1',
          name: this.getUserNameFromEmail(cleanEmail),
          email: cleanEmail,
          role: this.determineRole(cleanEmail),
        });
      } else {
        // Corrupted email in localStorage - clear it
        console.warn('Corrupted email in localStorage, clearing:', storedEmail);
        localStorage.removeItem('user_email');
        localStorage.removeItem(this.tokenKey);
      }
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

  /**
   * Get current user email
   */
  getCurrentUserEmail(): string | null {
    const email = this.currentUser()?.email;
    if (!email) {
      return null;
    }
    // Clean and validate email - remove any route paths or invalid characters
    const cleaned = email.trim().toLowerCase();
    // Check if it looks like a valid email (contains @)
    if (cleaned.includes('@') && !cleaned.includes('/')) {
      return cleaned;
    }
    // If corrupted, try to get from localStorage directly
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail && storedEmail.includes('@') && !storedEmail.includes('/')) {
      return storedEmail.trim().toLowerCase();
    }
    return null;
  }
}

