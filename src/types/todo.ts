export type Priority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  subtasks: SubTask[];
  createdAt: number; // timestamp
  completedAt?: number; // timestamp when task was marked done
  recurring: RecurrenceType;
}

export type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

export interface FilterState {
  searchQuery: string;
  type: FilterType;
  priority: Priority | 'all';
  category: string | 'all';
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
