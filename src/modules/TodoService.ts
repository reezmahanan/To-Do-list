import type { Todo, SubTask, Priority, FilterState, RecurrenceType } from '../types/todo';
import { Storage } from './Storage';

export class TodoService {
  private todos: Todo[] = [];

  constructor() {
    this.todos = Storage.loadTodos();
  }

  public getTodos(): Todo[] {
    return this.todos;
  }

  public getTodoById(id: string): Todo | undefined {
    return this.todos.find(t => t.id === id);
  }

  public addTodo(
    title: string, 
    priority: Priority, 
    category: string, 
    dueDate?: string, 
    description: string = '',
    recurring: RecurrenceType = 'none',
    subtasks: SubTask[] = []
  ): Todo {
    const newTodo: Todo = {
      id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      priority,
      category,
      dueDate: dueDate || undefined,
      completed: false,
      subtasks: subtasks.length > 0 ? subtasks : [],
      createdAt: Date.now(),
      recurring
    };
    this.todos.push(newTodo);
    this.save();
    return newTodo;
  }

  public updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo | undefined {
    const todo = this.getTodoById(id);
    if (!todo) return undefined;
    
    Object.assign(todo, updates);
    this.save();
    return todo;
  }

  public deleteTodo(id: string): boolean {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(t => t.id !== id);
    if (this.todos.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  public toggleTodoCompleted(id: string): boolean {
    const todo = this.getTodoById(id);
    if (!todo) return false;
    
    todo.completed = !todo.completed;
    
    if (todo.completed) {
      todo.completedAt = Date.now();
      todo.subtasks.forEach(s => s.completed = true);

      // Handle recurrence
      if (todo.recurring && todo.recurring !== 'none') {
        const nextDueDate = this.calculateNextDueDate(todo.dueDate, todo.recurring);
        // Create duplicate copy with pending state and reset subtasks
        const subtasksCopy = todo.subtasks.map(s => ({
          id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          text: s.text,
          completed: false
        }));
        this.addTodo(
          todo.title + ` (Copy)`, 
          todo.priority, 
          todo.category, 
          nextDueDate, 
          todo.description, 
          todo.recurring, 
          subtasksCopy
        );
        // Turn recurrence off on current completed task so it doesn't trigger again if toggled
        todo.recurring = 'none';
        // Remove "(Copy)" suffix from newly created one or keep title clean, let's keep name identical
        const latest = this.todos[this.todos.length - 1];
        latest.title = todo.title;
      }
    } else {
      delete todo.completedAt;
    }
    
    this.save();
    return true;
  }

  // Subtasks
  public addSubtask(todoId: string, text: string): SubTask | undefined {
    const todo = this.getTodoById(todoId);
    if (!todo) return undefined;

    const subtask: SubTask = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      text,
      completed: false
    };

    todo.subtasks.push(subtask);
    
    if (todo.completed) {
      todo.completed = false;
      delete todo.completedAt;
    }

    this.save();
    return subtask;
  }

  public toggleSubtaskCompleted(todoId: string, subtaskId: string): boolean {
    const todo = this.getTodoById(todoId);
    if (!todo) return false;

    const subtask = todo.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return false;

    subtask.completed = !subtask.completed;

    const allCompleted = todo.subtasks.length > 0 && todo.subtasks.every(s => s.completed);
    if (allCompleted) {
      todo.completed = true;
      todo.completedAt = Date.now();
      
      // Handle recurrence if parent task gets completed automatically
      if (todo.recurring && todo.recurring !== 'none') {
        const nextDueDate = this.calculateNextDueDate(todo.dueDate, todo.recurring);
        const subtasksCopy = todo.subtasks.map(s => ({
          id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          text: s.text,
          completed: false
        }));
        this.addTodo(todo.title, todo.priority, todo.category, nextDueDate, todo.description, todo.recurring, subtasksCopy);
        todo.recurring = 'none';
      }
    } else {
      todo.completed = false;
      delete todo.completedAt;
    }

    this.save();
    return true;
  }

  public deleteSubtask(todoId: string, subtaskId: string): boolean {
    const todo = this.getTodoById(todoId);
    if (!todo) return false;

    todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId);
    
    const allCompleted = todo.subtasks.length > 0 && todo.subtasks.every(s => s.completed);
    if (allCompleted) {
      todo.completed = true;
      todo.completedAt = Date.now();
    }

    this.save();
    return true;
  }

  public clearCompleted(): void {
    this.todos = this.todos.filter(t => !t.completed);
    this.save();
  }

  public exportTasks(): string {
    return JSON.stringify(this.todos, null, 2);
  }

  public importTasks(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const isValid = parsed.every(item => 
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.completed === 'boolean' &&
          Array.isArray(item.subtasks)
        );
        if (isValid) {
          this.todos = parsed;
          this.save();
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Failed to import tasks', e);
      return false;
    }
  }

  // Filter & Sort
  public getFilteredAndSortedTodos(filters: FilterState): Todo[] {
    let result = [...this.todos];

    // Search query
    if (filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) || 
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Type filter
    const now = new Date();
    now.setHours(0,0,0,0);
    const todayStr = now.toISOString().split('T')[0];

    if (filters.type === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (filters.type === 'completed') {
      result = result.filter(t => t.completed);
    } else if (filters.type === 'overdue') {
      result = result.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      result = result.filter(t => t.priority === filters.priority);
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(t => t.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Sort
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        comparison = a.dueDate.localeCompare(b.dueDate);
      } else if (filters.sortBy === 'priority') {
        comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
      } else {
        comparison = b.createdAt - a.createdAt;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }

  // Next Due Date Helper
  private calculateNextDueDate(dateStr: string | undefined, recurrence: RecurrenceType): string {
    let baseDate = new Date();
    if (dateStr) {
      const parts = dateStr.split('-');
      baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    baseDate.setHours(0,0,0,0);
    
    if (recurrence === 'daily') {
      baseDate.setDate(baseDate.getDate() + 1);
    } else if (recurrence === 'weekly') {
      baseDate.setDate(baseDate.getDate() + 7);
    } else if (recurrence === 'monthly') {
      baseDate.setMonth(baseDate.getMonth() + 1);
    }
    
    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(baseDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Analytics Helpers
  public getWeeklyCompletionStats(): { date: string; label: string; count: number }[] {
    const stats: { date: string; label: string; count: number }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const label = weekdayLabels[targetDate.getDay()];

      // Find todos completed on targetDate
      const completedCount = this.todos.filter(todo => {
        if (!todo.completed || !todo.completedAt) return false;
        const compDate = new Date(todo.completedAt);
        const compDateStr = compDate.toISOString().split('T')[0];
        return compDateStr === dateStr;
      }).length;

      stats.push({
        date: dateStr,
        label,
        count: completedCount
      });
    }

    return stats;
  }

  public getCategoryDistribution(): { category: string; count: number }[] {
    const dist: { [key: string]: number } = {};
    this.todos.forEach(t => {
      const cat = t.category.toLowerCase();
      dist[cat] = (dist[cat] || 0) + 1;
    });

    const categories = ['work', 'personal', 'shopping', 'fitness', 'other'];
    return categories.map(cat => ({
      category: cat,
      count: dist[cat] || 0
    }));
  }

  public getPriorityDistribution(): { priority: Priority; count: number }[] {
    const dist: { [key in Priority]: number } = { high: 0, medium: 0, low: 0 };
    this.todos.forEach(t => {
      dist[t.priority] = dist[t.priority] + 1;
    });

    return [
      { priority: 'high', count: dist.high },
      { priority: 'medium', count: dist.medium },
      { priority: 'low', count: dist.low }
    ];
  }

  private save(): void {
    Storage.saveTodos(this.todos);
  }
}
