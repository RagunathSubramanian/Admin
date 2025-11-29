import { Injectable, signal, computed } from '@angular/core';

export interface UserConfig {
  adminEmails: string[];
  userEmails: string[];
}

/**
 * User Configuration Service
 * Manages admin and user email configurations
 */
@Injectable({
  providedIn: 'root',
})
export class UserConfigService {
  private readonly configKey = 'user_config';
  
  // Default configuration
  // TODO: Replace 'admin@example.com' with your actual admin email address
  private defaultConfig: UserConfig = {
    adminEmails: ['ragubose.s@gmail.com'], // Change this to your admin email
    userEmails: ['prakashmookiah@gmail.com'],
  };

  // Configuration signal
  private configSignal = signal<UserConfig>(this.loadConfig());

  // Public readonly access
  public config = this.configSignal.asReadonly();
  public adminEmails = computed(() => this.configSignal().adminEmails);
  public userEmails = computed(() => this.configSignal().userEmails);

  constructor() {
    // Load config from localStorage on init
    this.loadConfig();
  }

  /**
   * Load configuration from localStorage or return default
   */
  private loadConfig(): UserConfig {
    try {
      const stored = localStorage.getItem(this.configKey);
      if (stored) {
        const parsed = JSON.parse(stored) as UserConfig;
        // Validate structure
        if (parsed.adminEmails && Array.isArray(parsed.adminEmails) &&
            parsed.userEmails && Array.isArray(parsed.userEmails)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading user config:', error);
    }
    return { ...this.defaultConfig };
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig(config: UserConfig): void {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(config));
      this.configSignal.set(config);
    } catch (error) {
      console.error('Error saving user config:', error);
      throw error;
    }
  }

  /**
   * Update admin emails
   */
  updateAdminEmails(emails: string[]): void {
    const current = this.configSignal();
    this.saveConfig({
      ...current,
      adminEmails: emails.filter(email => email.trim().length > 0),
    });
  }

  /**
   * Update user emails
   */
  updateUserEmails(emails: string[]): void {
    const current = this.configSignal();
    this.saveConfig({
      ...current,
      userEmails: emails.filter(email => email.trim().length > 0),
    });
  }

  /**
   * Add admin email
   */
  addAdminEmail(email: string): void {
    const current = this.configSignal();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && !current.adminEmails.includes(trimmedEmail)) {
      this.saveConfig({
        ...current,
        adminEmails: [...current.adminEmails, trimmedEmail],
      });
    }
  }

  /**
   * Add user email
   */
  addUserEmail(email: string): void {
    const current = this.configSignal();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && !current.userEmails.includes(trimmedEmail)) {
      this.saveConfig({
        ...current,
        userEmails: [...current.userEmails, trimmedEmail],
      });
    }
  }

  /**
   * Remove admin email
   */
  removeAdminEmail(email: string): void {
    const current = this.configSignal();
    this.saveConfig({
      ...current,
      adminEmails: current.adminEmails.filter(e => e !== email.toLowerCase()),
    });
  }

  /**
   * Remove user email
   */
  removeUserEmail(email: string): void {
    const current = this.configSignal();
    this.saveConfig({
      ...current,
      userEmails: current.userEmails.filter(e => e !== email.toLowerCase()),
    });
  }

  /**
   * Check if email is admin
   */
  isAdminEmail(email: string): boolean {
    return this.adminEmails().includes(email.toLowerCase());
  }

  /**
   * Check if email is user
   */
  isUserEmail(email: string): boolean {
    return this.userEmails().includes(email.toLowerCase());
  }

  /**
   * Get role for email
   */
  getRoleForEmail(email: string): 'admin' | 'user' | null {
    const lowerEmail = email.toLowerCase();
    if (this.adminEmails().includes(lowerEmail)) {
      return 'admin';
    }
    if (this.userEmails().includes(lowerEmail)) {
      return 'user';
    }
    return null;
  }

  /**
   * Reset to default configuration
   */
  resetToDefault(): void {
    this.saveConfig({ ...this.defaultConfig });
  }

  /**
   * Clear configuration from localStorage and reload defaults
   */
  clearConfig(): void {
    try {
      localStorage.removeItem(this.configKey);
      this.configSignal.set({ ...this.defaultConfig });
    } catch (error) {
      console.error('Error clearing user config:', error);
    }
  }
}

