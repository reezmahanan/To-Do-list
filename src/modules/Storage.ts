import type { Todo } from '../types/todo';

export class Storage {
  private static readonly TODOS_KEY = 'advanced_todo_items';
  private static readonly THEME_KEY = 'advanced_todo_theme';

  public static loadTodos(): Todo[] {
    const raw = localStorage.getItem(this.TODOS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse todos from localStorage', e);
      return [];
    }
  }

  public static saveTodos(todos: Todo[]): void {
    try {
      localStorage.setItem(this.TODOS_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }

  public static loadTheme(): 'light' | 'dark' {
    const theme = localStorage.getItem(this.THEME_KEY);
    return theme === 'dark' ? 'dark' : 'light';
  }

  public static saveTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
