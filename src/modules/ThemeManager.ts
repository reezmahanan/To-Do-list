import { Storage } from './Storage';

export class ThemeManager {
  private currentTheme: 'light' | 'dark';

  constructor() {
    this.currentTheme = Storage.loadTheme();
    this.applyTheme();
  }

  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  public toggleTheme(): 'light' | 'dark' {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    Storage.saveTheme(this.currentTheme);
    return this.currentTheme;
  }

  private applyTheme(): void {
    const root = document.documentElement;
    if (this.currentTheme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }
}
