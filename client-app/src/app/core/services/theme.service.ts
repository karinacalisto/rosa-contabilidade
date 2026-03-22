import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = signal(false);
  isDark = this.darkMode.asReadonly();

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.darkMode.set(true);
      document.body.classList.add('dark-theme');
    }
  }

  toggle(): void {
    const newValue = !this.darkMode();
    this.darkMode.set(newValue);
    if (newValue) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
