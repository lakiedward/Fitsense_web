import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { STORAGE_KEYS } from '../constants/storage-keys';

export type ThemeMode = 'light' | 'dark' | 'low-light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<ThemeMode>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme: ThemeMode = 'light';
    
    if (savedTheme === 'low-light') {
      theme = 'low-light';
    } else if (savedTheme === 'dark') {
      theme = 'dark';
    } else if (!savedTheme && prefersDark) {
      theme = 'dark';
    }
    
    this.setTheme(theme);
  }

  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: ThemeMode): void {
    // Remove all theme classes first
    document.body.classList.remove('dark-mode', 'low-light');
    
    if (theme === 'low-light') {
      document.body.classList.add('low-light');
    } else if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    this.currentThemeSubject.next(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    
    // Cycle through: light -> dark -> low-light -> light
    if (currentTheme === 'light') {
      this.setTheme('dark');
    } else if (currentTheme === 'dark') {
      this.setTheme('low-light');
    } else {
      this.setTheme('light');
    }
  }

  isDarkMode(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  isLowLightMode(): boolean {
    return this.getCurrentTheme() === 'low-light';
  }
} 