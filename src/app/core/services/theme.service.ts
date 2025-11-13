import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'orange';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly defaultTheme: Theme = 'light';

  currentTheme = signal<Theme>(this.defaultTheme);

  constructor() {
    // Load theme from localStorage on init
    this.loadTheme();

    // Save theme to localStorage when it changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem(this.THEME_KEY, theme);
    });
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.currentTheme.set(savedTheme);
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme.set('dark');
      } else {
        this.currentTheme.set(this.defaultTheme);
      }
    }
  }

  private isValidTheme(theme: string): theme is Theme {
    return ['light', 'dark', 'orange'].includes(theme);
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  toggleTheme() {
    const themes: Theme[] = ['light', 'dark', 'orange'];
    const currentIndex = themes.indexOf(this.currentTheme());
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'orange', 'dark-orange');
    
    // Add current theme class
    root.classList.add(theme);
  }

  getThemeName(): string {
    const themeNames = {
      light: 'Light',
      dark: 'Dark',
      orange: 'Orange',
    };
    return themeNames[this.currentTheme()];
  }
}

