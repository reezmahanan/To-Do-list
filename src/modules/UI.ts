import { TodoService } from './TodoService';
import { ThemeManager } from './ThemeManager';
import { SoundManager } from './SoundManager';
import { NotificationManager } from './NotificationManager';
import type { Priority, FilterState, FilterType, RecurrenceType } from '../types/todo';

export class UI {
  private service: TodoService;
  private themeManager: ThemeManager;
  private soundManager: SoundManager;
  private notificationManager: NotificationManager;
  
  private selectedTodoId: string | null = null;
  private activeCalendarDateFilter: string | null = null;
  private currentCalendarDate = new Date();
  
  private filterState: FilterState = {
    searchQuery: '',
    type: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  // DOM elements cache
  private taskListEl!: HTMLUListElement;
  private statsPercentTextEl!: HTMLSpanElement;
  private statsBarEl!: SVGCircleElement;
  private statsCounterEl!: HTMLDivElement;
  
  // Form elements
  private taskFormEl!: HTMLFormElement;
  private titleInputEl!: HTMLInputElement;
  private prioritySelectEl!: HTMLSelectElement;
  private categorySelectEl!: HTMLSelectElement;
  private dateInputEl!: HTMLInputElement;
  private recurrenceSelectEl!: HTMLSelectElement;
  
  // Search & Filter controls
  private searchInputEl!: HTMLInputElement;
  private sortSelectEl!: HTMLSelectElement;
  private sortOrderBtnEl!: HTMLButtonElement;
  private filterPillsEl!: NodeListOf<HTMLElement>;
  private categoryPillsEl!: NodeListOf<HTMLElement>;
  
  // Drawer elements
  private drawerEl!: HTMLDivElement;
  private drawerBackdropEl!: HTMLDivElement;
  private drawerCloseBtnEl!: HTMLElement;
  private drawerTitleInputEl!: HTMLInputElement;
  private drawerDescTextareaEl!: HTMLTextAreaElement;
  private drawerPriorityEl!: HTMLSelectElement;
  private drawerCategoryEl!: HTMLSelectElement;
  private drawerDateEl!: HTMLInputElement;
  private drawerRecurrenceEl!: HTMLSelectElement;
  private drawerSubtaskInputEl!: HTMLInputElement;
  private drawerSubtaskAddBtnEl!: HTMLButtonElement;
  private drawerSubtasksListEl!: HTMLUListElement;
  private drawerSaveBtnEl!: HTMLButtonElement;
  
  // Footer actions
  private clearCompletedBtnEl!: HTMLButtonElement;
  private exportBtnEl!: HTMLButtonElement;
  private importBtnEl!: HTMLButtonElement;
  private importFileEl!: HTMLInputElement;
  private themeToggleBtnEl!: HTMLButtonElement;
  private soundToggleBtnEl!: HTMLButtonElement;

  // Tabs navigation
  private tabLinksEl!: NodeListOf<HTMLElement>;
  private viewContainersEl!: NodeListOf<HTMLElement>;

  // Calendar specific elements
  private calendarMonthTitleEl!: HTMLElement;
  private prevMonthBtnEl!: HTMLButtonElement;
  private nextMonthBtnEl!: HTMLButtonElement;
  private calendarGridEl!: HTMLElement;

  constructor(service: TodoService, themeManager: ThemeManager) {
    this.service = service;
    this.themeManager = themeManager;
    this.soundManager = new SoundManager();
    this.notificationManager = new NotificationManager();
    
    this.initDOMElements();
    this.initEventListeners();
    this.initSoundToggleIcon();
    this.render();
  }

  private initDOMElements(): void {
    this.taskListEl = document.getElementById('task-list') as HTMLUListElement;
    this.statsPercentTextEl = document.getElementById('stats-percent') as HTMLSpanElement;
    this.statsBarEl = document.getElementById('stats-bar') as unknown as SVGCircleElement;
    this.statsCounterEl = document.getElementById('stats-counter') as HTMLDivElement;
    
    this.taskFormEl = document.getElementById('task-form') as HTMLFormElement;
    this.titleInputEl = document.getElementById('task-title-input') as HTMLInputElement;
    this.prioritySelectEl = document.getElementById('task-priority') as HTMLSelectElement;
    this.categorySelectEl = document.getElementById('task-category') as HTMLSelectElement;
    this.dateInputEl = document.getElementById('task-date') as HTMLInputElement;
    this.recurrenceSelectEl = document.getElementById('task-recurrence') as HTMLSelectElement;
    
    this.searchInputEl = document.getElementById('search-input') as HTMLInputElement;
    this.sortSelectEl = document.getElementById('sort-select') as HTMLSelectElement;
    this.sortOrderBtnEl = document.getElementById('sort-order-btn') as HTMLButtonElement;
    this.filterPillsEl = document.querySelectorAll('.filter-pill');
    this.categoryPillsEl = document.querySelectorAll('.category-item');
    
    this.drawerEl = document.getElementById('task-drawer') as HTMLDivElement;
    this.drawerBackdropEl = document.getElementById('drawer-backdrop') as HTMLDivElement;
    this.drawerCloseBtnEl = document.getElementById('close-drawer') as HTMLElement;
    this.drawerTitleInputEl = document.getElementById('drawer-title') as HTMLInputElement;
    this.drawerDescTextareaEl = document.getElementById('drawer-desc') as HTMLTextAreaElement;
    this.drawerPriorityEl = document.getElementById('drawer-priority') as HTMLSelectElement;
    this.drawerCategoryEl = document.getElementById('drawer-category') as HTMLSelectElement;
    this.drawerDateEl = document.getElementById('drawer-date') as HTMLInputElement;
    this.drawerRecurrenceEl = document.getElementById('drawer-recurrence') as HTMLSelectElement;
    this.drawerSubtaskInputEl = document.getElementById('drawer-subtask-input') as HTMLInputElement;
    this.drawerSubtaskAddBtnEl = document.getElementById('drawer-subtask-add') as HTMLButtonElement;
    this.drawerSubtasksListEl = document.getElementById('drawer-subtasks') as HTMLUListElement;
    this.drawerSaveBtnEl = document.getElementById('drawer-save') as HTMLButtonElement;
    
    this.clearCompletedBtnEl = document.getElementById('clear-completed') as HTMLButtonElement;
    this.exportBtnEl = document.getElementById('export-tasks') as HTMLButtonElement;
    this.importBtnEl = document.getElementById('import-tasks') as HTMLButtonElement;
    this.importFileEl = document.getElementById('import-file') as HTMLInputElement;
    this.themeToggleBtnEl = document.getElementById('theme-toggle') as HTMLButtonElement;
    this.soundToggleBtnEl = document.getElementById('sound-toggle') as HTMLButtonElement;

    // Tabs
    this.tabLinksEl = document.querySelectorAll('.tab-link');
    this.viewContainersEl = document.querySelectorAll('.app-view-container');

    // Calendar
    this.calendarMonthTitleEl = document.getElementById('calendar-month-title') as HTMLElement;
    this.prevMonthBtnEl = document.getElementById('prev-month-btn') as HTMLButtonElement;
    this.nextMonthBtnEl = document.getElementById('next-month-btn') as HTMLButtonElement;
    this.calendarGridEl = document.getElementById('calendar-grid') as HTMLElement;
  }

  private initEventListeners(): void {
    // Add task
    this.taskFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask();
    });

    // Theme Toggle
    this.themeToggleBtnEl.addEventListener('click', () => {
      const newTheme = this.themeManager.toggleTheme();
      const icon = this.themeToggleBtnEl.querySelector('i');
      if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    });

    // Initialize icon for theme
    const themeIcon = this.themeToggleBtnEl.querySelector('i');
    if (themeIcon) {
      themeIcon.className = this.themeManager.getTheme() === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Sound Toggle
    this.soundToggleBtnEl.addEventListener('click', () => {
      const isMuted = this.soundManager.toggleMute();
      const icon = this.soundToggleBtnEl.querySelector('i');
      if (icon) {
        icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
      }
      // Request notifications permission on unmuting (or sound toggle click) as a safe gesture
      this.notificationManager.requestPermission();
    });

    // Search and Sort
    this.searchInputEl.addEventListener('input', () => {
      this.activeCalendarDateFilter = null; // Clear calendar day filter
      this.filterState.searchQuery = this.searchInputEl.value;
      this.renderTaskList();
    });

    this.sortSelectEl.addEventListener('change', () => {
      this.filterState.sortBy = this.sortSelectEl.value as any;
      this.renderTaskList();
    });

    this.sortOrderBtnEl.addEventListener('click', () => {
      const current = this.filterState.sortOrder;
      this.filterState.sortOrder = current === 'asc' ? 'desc' : 'asc';
      
      const icon = this.sortOrderBtnEl.querySelector('i');
      if (icon) {
        icon.className = this.filterState.sortOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down';
      }
      this.renderTaskList();
    });

    // Filter pills
    this.filterPillsEl.forEach(pill => {
      pill.addEventListener('click', () => {
        this.activeCalendarDateFilter = null; // Clear calendar day filter
        this.filterPillsEl.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.filterState.type = pill.getAttribute('data-filter') as FilterType;
        this.renderTaskList();
      });
    });

    // Category pills
    this.categoryPillsEl.forEach(pill => {
      pill.addEventListener('click', () => {
        this.activeCalendarDateFilter = null; // Clear calendar day filter
        this.categoryPillsEl.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.filterState.category = pill.getAttribute('data-category') || 'all';
        this.renderTaskList();
      });
    });

    // Task list clicks
    this.taskListEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.task-card') as HTMLElement;
      if (!card) return;
      
      const id = card.dataset.id;
      if (!id) return;

      // Clicked checkbox
      if (target.closest('.checkbox-wrapper') || target.classList.contains('task-checkbox')) {
        e.stopPropagation();
        
        const todo = this.service.getTodoById(id);
        const wasCompleted = todo?.completed;
        
        this.service.toggleTodoCompleted(id);
        
        // Play chime on completion
        if (!wasCompleted) {
          this.soundManager.playCompleteChime();
        }
        
        this.render();
        if (this.selectedTodoId === id) {
          this.loadTodoDetails(id);
        }
        return;
      }

      // Clicked delete button
      if (target.closest('.delete-task-btn') || target.classList.contains('delete-task-btn')) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
          this.service.deleteTodo(id);
          if (this.selectedTodoId === id) {
            this.closeDrawer();
          }
          this.render();
        }
        return;
      }

      // Open drawer
      this.openDrawer(id);
    });

    // Drawer close
    this.drawerCloseBtnEl.addEventListener('click', () => this.closeDrawer());
    this.drawerBackdropEl.addEventListener('click', () => this.closeDrawer());
    this.drawerSaveBtnEl.addEventListener('click', () => this.handleSaveDrawerDetails());

    // Drawer subtasks
    this.drawerSubtaskAddBtnEl.addEventListener('click', () => this.handleAddSubtask());
    this.drawerSubtaskInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddSubtask();
      }
    });

    this.drawerSubtasksListEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!this.selectedTodoId) return;

      const subtaskItem = target.closest('.drawer-subtask-item') as HTMLElement;
      if (!subtaskItem) return;

      const subtaskId = subtaskItem.dataset.id;
      if (!subtaskId) return;

      // Toggle subtask
      if (target.closest('.drawer-subtask-checkbox') || target.classList.contains('drawer-subtask-checkbox')) {
        const todo = this.service.getTodoById(this.selectedTodoId);
        const sub = todo?.subtasks.find(s => s.id === subtaskId);
        const wasCompleted = sub?.completed;
        
        this.service.toggleSubtaskCompleted(this.selectedTodoId, subtaskId);
        
        // Play sound if subtask is completed and parent got completed too
        if (!wasCompleted) {
          this.soundManager.playCompleteChime();
        }
        
        this.loadTodoDetails(this.selectedTodoId);
        this.render();
        return;
      }

      // Delete subtask
      if (target.closest('.drawer-subtask-delete-btn') || target.classList.contains('drawer-subtask-delete-btn')) {
        this.service.deleteSubtask(this.selectedTodoId, subtaskId);
        this.loadTodoDetails(this.selectedTodoId);
        this.render();
        return;
      }
    });

    // Clear completed
    this.clearCompletedBtnEl.addEventListener('click', () => {
      const completedCount = this.service.getTodos().filter(t => t.completed).length;
      if (completedCount === 0) return;
      if (confirm(`Clear all ${completedCount} completed tasks?`)) {
        this.service.clearCompleted();
        this.closeDrawer();
        this.render();
      }
    });

    // Import/Export
    this.exportBtnEl.addEventListener('click', () => {
      const dataStr = this.service.exportTasks();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todo-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    this.importBtnEl.addEventListener('click', () => this.importFileEl.click());
    this.importFileEl.addEventListener('change', () => {
      const file = this.importFileEl.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (this.service.importTasks(text)) {
          alert('Tasks imported successfully!');
          this.closeDrawer();
          this.render();
        } else {
          alert('Failed to import tasks.');
        }
      };
      reader.readAsText(file);
      this.importFileEl.value = '';
    });

    // Tabs clicks
    this.tabLinksEl.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab') || 'list';
        this.switchToTab(tabId);
      });
    });

    // Calendar month control clicks
    this.prevMonthBtnEl.addEventListener('click', () => {
      this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
      this.renderCalendar();
    });

    this.nextMonthBtnEl.addEventListener('click', () => {
      this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
      this.renderCalendar();
    });
  }

  private initSoundToggleIcon(): void {
    const icon = this.soundToggleBtnEl.querySelector('i');
    if (icon) {
      icon.className = this.soundManager.getMuted() ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
  }

  private switchToTab(tabId: string): void {
    this.tabLinksEl.forEach(l => {
      if (l.getAttribute('data-tab') === tabId) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    this.viewContainersEl.forEach(v => {
      if (v.id === `view-${tabId}`) {
        v.classList.add('active-view');
      } else {
        v.classList.remove('active-view');
      }
    });

    if (tabId === 'calendar') {
      this.renderCalendar();
    } else if (tabId === 'analytics') {
      this.renderAnalytics();
    }
  }

  // Event Handlers
  private handleAddTask(): void {
    const title = this.titleInputEl.value.trim();
    if (!title) return;

    const priority = this.prioritySelectEl.value as Priority;
    const category = this.categorySelectEl.value;
    const dueDate = this.dateInputEl.value;
    const recurrence = this.recurrenceSelectEl.value as RecurrenceType;

    const newTodo = this.service.addTodo(title, priority, category, dueDate, '', recurrence);
    
    // Check if task is due today and notify if yes
    const todayStr = new Date().toISOString().split('T')[0];
    if (newTodo.dueDate === todayStr) {
      this.notificationManager.triggerDueAlert(newTodo);
    }

    // Reset Form
    this.titleInputEl.value = '';
    this.dateInputEl.value = '';
    this.prioritySelectEl.value = 'medium';
    this.categorySelectEl.value = 'personal';
    this.recurrenceSelectEl.value = 'none';
    
    this.render();
  }

  private handleAddSubtask(): void {
    if (!this.selectedTodoId) return;

    const text = this.drawerSubtaskInputEl.value.trim();
    if (!text) return;

    this.service.addSubtask(this.selectedTodoId, text);
    this.drawerSubtaskInputEl.value = '';
    
    this.loadTodoDetails(this.selectedTodoId);
    this.render();
  }

  private handleSaveDrawerDetails(): void {
    if (!this.selectedTodoId) return;

    const title = this.drawerTitleInputEl.value.trim();
    if (!title) return;

    const description = this.drawerDescTextareaEl.value.trim();
    const priority = this.drawerPriorityEl.value as Priority;
    const category = this.drawerCategoryEl.value;
    const dueDate = this.drawerDateEl.value || undefined;
    const recurrence = this.drawerRecurrenceEl.value as RecurrenceType;

    this.service.updateTodo(this.selectedTodoId, {
      title,
      description,
      priority,
      category,
      dueDate,
      recurring: recurrence
    });

    this.closeDrawer();
    this.render();
  }

  // Drawer Functions
  private openDrawer(id: string): void {
    this.selectedTodoId = id;
    this.loadTodoDetails(id);
    
    const cards = this.taskListEl.querySelectorAll('.task-card');
    cards.forEach(c => {
      const cardEl = c as HTMLElement;
      if (cardEl.dataset.id === id) {
        cardEl.classList.add('selected');
      } else {
        cardEl.classList.remove('selected');
      }
    });

    this.drawerEl.classList.add('open');
    this.drawerBackdropEl.classList.add('open');
  }

  private closeDrawer(): void {
    this.selectedTodoId = null;
    this.drawerEl.classList.remove('open');
    this.drawerBackdropEl.classList.remove('open');
    
    const cards = this.taskListEl.querySelectorAll('.task-card');
    cards.forEach(c => c.classList.remove('selected'));
  }

  private loadTodoDetails(id: string): void {
    const todo = this.service.getTodoById(id);
    if (!todo) {
      this.closeDrawer();
      return;
    }

    this.drawerTitleInputEl.value = todo.title;
    this.drawerDescTextareaEl.value = todo.description || '';
    this.drawerPriorityEl.value = todo.priority;
    this.drawerCategoryEl.value = todo.category;
    this.drawerDateEl.value = todo.dueDate || '';
    this.drawerRecurrenceEl.value = todo.recurring || 'none';

    // Subtasks loading
    this.drawerSubtasksListEl.innerHTML = '';
    if (todo.subtasks.length === 0) {
      this.drawerSubtasksListEl.innerHTML = `<li style="text-align: center; color: var(--text-muted); font-size: 13px; margin: 10px 0;">No subtasks yet. Add one above!</li>`;
    } else {
      todo.subtasks.forEach(s => {
        const li = document.createElement('li');
        li.className = `drawer-subtask-item ${s.completed ? 'completed-subtask' : ''}`;
        li.dataset.id = s.id;
        li.innerHTML = `
          <div class="drawer-subtask-checkbox">
            <i class="fas fa-check"></i>
          </div>
          <span class="drawer-subtask-text">${this.escapeHTML(s.text)}</span>
          <span class="drawer-subtask-delete-btn" title="Delete subtask"><i class="fas fa-times"></i></span>
        `;
        this.drawerSubtasksListEl.appendChild(li);
      });
    }
  }

  // Renders
  public render(): void {
    this.renderTaskList();
    this.renderStats();
    this.renderCategoryCounters();
  }

  private renderTaskList(): void {
    let filteredTodos = this.service.getFilteredAndSortedTodos(this.filterState);
    this.taskListEl.innerHTML = '';

    // Apply calendar day filter if set
    if (this.activeCalendarDateFilter) {
      filteredTodos = filteredTodos.filter(t => t.dueDate === this.activeCalendarDateFilter);
      // Insert a clear calendar filter alert in UI
      const alertDiv = document.createElement('div');
      alertDiv.className = 'empty-state';
      alertDiv.style.padding = '12px';
      alertDiv.style.flexDirection = 'row';
      alertDiv.style.justifyContent = 'space-between';
      alertDiv.style.alignItems = 'center';
      alertDiv.style.background = 'var(--primary-light)';
      alertDiv.style.borderRadius = 'var(--border-radius-sm)';
      alertDiv.style.border = '1px solid var(--primary)';
      alertDiv.innerHTML = `
        <span style="font-size: 13px; font-weight: 600; color: var(--text-main);"><i class="far fa-calendar-alt"></i> Filtered by date: ${this.activeCalendarDateFilter}</span>
        <button id="clear-calendar-filter" style="padding: 4px 10px; font-size: 11px;">Clear Filter</button>
      `;
      this.taskListEl.appendChild(alertDiv);

      // Bind clear calendar filter
      setTimeout(() => {
        const clearBtn = document.getElementById('clear-calendar-filter');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            this.activeCalendarDateFilter = null;
            this.renderTaskList();
          });
        }
      }, 0);
    }

    if (filteredTodos.length === 0) {
      const stateDiv = document.createElement('div');
      stateDiv.className = 'empty-state';
      stateDiv.innerHTML = `
        <i class="fas fa-clipboard-list"></i>
        <p class="empty-state-text">No tasks matching the current filters.</p>
      `;
      this.taskListEl.appendChild(stateDiv);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    filteredTodos.forEach(todo => {
      const card = document.createElement('li');
      card.className = `task-card ${todo.completed ? 'completed-task' : ''} ${this.selectedTodoId === todo.id ? 'selected' : ''}`;
      card.dataset.id = todo.id;
      
      let priorityColor = 'var(--text-muted)';
      if (todo.priority === 'high') priorityColor = 'var(--priority-high)';
      else if (todo.priority === 'medium') priorityColor = 'var(--priority-medium)';
      else if (todo.priority === 'low') priorityColor = 'var(--priority-low)';
      card.style.setProperty('--priority-color', priorityColor);

      const totalSub = todo.subtasks.length;
      const completedSub = todo.subtasks.filter(s => s.completed).length;
      const percentSub = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
      
      const subtaskHTML = totalSub > 0 ? `
        <div class="task-subtasks-progress">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percentSub}%"></div>
          </div>
          <span class="subtasks-count-text">${completedSub}/${totalSub} subtasks</span>
        </div>
      ` : '';

      let dateHTML = '';
      if (todo.dueDate) {
        const isOverdue = !todo.completed && todo.dueDate < todayStr;
        const relativeDateText = this.getRelativeDateText(todo.dueDate);
        dateHTML = `
          <span class="badge badge-date ${isOverdue ? 'overdue' : ''}">
            <i class="far fa-calendar-alt"></i> ${relativeDateText}
          </span>
        `;
      }

      const notesIndicator = todo.description ? `
        <span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted);" title="Has notes">
          <i class="far fa-sticky-note"></i> Notes
        </span>
      ` : '';

      // Recurring badge indicator
      const repeatIndicator = todo.recurring && todo.recurring !== 'none' ? `
        <span class="badge" style="background: var(--primary-light); color: var(--primary);" title="Recurring: ${todo.recurring}">
          <i class="fas fa-redo"></i> ${todo.recurring}
        </span>
      ` : '';

      card.innerHTML = `
        <div class="checkbox-wrapper">
          <div class="task-checkbox">
            <i class="fas fa-check"></i>
          </div>
        </div>
        <div class="task-info-block">
          <div class="task-card-header">
            <span class="task-card-title">${this.escapeHTML(todo.title)}</span>
          </div>
          <div class="task-card-meta">
            <span class="badge badge-priority-${todo.priority}">
              <i class="fas fa-circle" style="font-size: 6px;"></i> ${todo.priority}
            </span>
            <span class="badge badge-category">
              ${todo.category}
            </span>
            ${dateHTML}
            ${notesIndicator}
            ${repeatIndicator}
          </div>
          ${subtaskHTML}
        </div>
        <div class="task-actions">
          <span class="action-btn delete-task-btn" title="Delete task"><i class="fas fa-trash-alt"></i></span>
        </div>
      `;

      this.taskListEl.appendChild(card);
    });
  }

  private renderStats(): void {
    const todos = this.service.getTodos();
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.statsPercentTextEl.textContent = `${percentage}%`;

    const strokeOffset = 220 - (220 * percentage) / 100;
    this.statsBarEl.style.strokeDashoffset = strokeOffset.toString();

    const remaining = total - completed;
    this.statsCounterEl.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} pending`;
  }

  private renderCategoryCounters(): void {
    const todos = this.service.getTodos();
    const todayStr = new Date().toISOString().split('T')[0];

    const counts = {
      all: todos.length,
      pending: todos.filter(t => !t.completed).length,
      completed: todos.filter(t => t.completed).length,
      overdue: todos.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length
    };

    this.filterPillsEl.forEach(pill => {
      const type = pill.getAttribute('data-filter') as FilterType;
      const cnt = pill.querySelector('.counter');
      if (cnt) {
        cnt.textContent = counts[type].toString();
      }
    });

    this.categoryPillsEl.forEach(pill => {
      const category = pill.getAttribute('data-category') || 'all';
      const cnt = pill.querySelector('.counter');
      if (cnt) {
        if (category === 'all') {
          cnt.textContent = todos.length.toString();
        } else {
          const categoryTodos = todos.filter(t => t.category.toLowerCase() === category.toLowerCase());
          cnt.textContent = categoryTodos.length.toString();
        }
      }
    });
  }

  // Calendar render logic
  private renderCalendar(): void {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    
    // Set Calendar Title
    this.calendarMonthTitleEl.textContent = this.currentCalendarDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });

    // Clear grid
    this.calendarGridEl.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill blanks
    for (let i = 0; i < firstDayIndex; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day empty';
      this.calendarGridEl.appendChild(blank);
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const todos = this.service.getTodos();

    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0,0,0,0);
      const dateStr = cellDate.toISOString().split('T')[0];

      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      if (cellDate.getTime() === today.getTime()) {
        dayCell.classList.add('today');
      }

      const numSpan = document.createElement('span');
      numSpan.className = 'calendar-day-number';
      numSpan.textContent = day.toString();
      dayCell.appendChild(numSpan);

      // Find due items
      const dueTodos = todos.filter(t => t.dueDate === dateStr);
      if (dueTodos.length > 0) {
        const indicators = document.createElement('div');
        indicators.className = 'calendar-day-indicators';

        dueTodos.slice(0, 5).forEach(todo => {
          const indicator = document.createElement('div');
          indicator.className = 'calendar-indicator';
          let indicatorColor = 'var(--text-muted)';
          if (todo.priority === 'high') indicatorColor = 'var(--priority-high)';
          else if (todo.priority === 'medium') indicatorColor = 'var(--priority-medium)';
          else if (todo.priority === 'low') indicatorColor = 'var(--priority-low)';
          indicator.style.setProperty('--indicator-color', indicatorColor);
          indicator.title = `${todo.title} (${todo.priority})`;
          indicators.appendChild(indicator);
        });

        dayCell.appendChild(indicators);
      }

      // Filter tasks by date on click
      dayCell.addEventListener('click', () => {
        this.activeCalendarDateFilter = dateStr;
        this.switchToTab('list');
      });

      this.calendarGridEl.appendChild(dayCell);
    }
  }

  // Analytics Render logic
  private renderAnalytics(): void {
    const weeklyStats = this.service.getWeeklyCompletionStats();
    const categoryStats = this.service.getCategoryDistribution();
    const priorityStats = this.service.getPriorityDistribution();

    // 1. Draw Weekly SVG Bar Chart
    this.drawWeeklyChart(weeklyStats);

    // 2. Draw Category SVG Horizontal Bar Chart
    const categoryColors: { [key: string]: string } = {
      work: 'var(--category-work)',
      personal: 'var(--category-personal)',
      shopping: 'var(--category-shopping)',
      fitness: 'var(--category-fitness)',
      other: 'var(--category-other)'
    };
    const categoryData = categoryStats.map(c => ({ name: c.category, count: c.count }));
    this.drawHorizontalChart('category-chart', categoryData, categoryColors);

    // 3. Draw Priority SVG Horizontal Bar Chart
    const priorityColors: { [key: string]: string } = {
      high: 'var(--priority-high)',
      medium: 'var(--priority-medium)',
      low: 'var(--priority-low)'
    };
    const priorityData = priorityStats.map(p => ({ name: p.priority, count: p.count }));
    this.drawHorizontalChart('priority-chart', priorityData, priorityColors);
  }

  private drawWeeklyChart(stats: { date: string; label: string; count: number }[]): void {
    const svg = document.getElementById('weekly-chart') as unknown as SVGSVGElement;
    if (!svg) return;
    svg.innerHTML = ''; // clear

    const maxVal = Math.max(...stats.map(s => s.count), 4);
    const width = 450;
    const height = 200;
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Grid and Y-axis labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const yVal = Math.round((maxVal / yTicks) * i);
      const yPos = height - paddingBottom - (chartHeight / yTicks) * i;

      // Line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', paddingLeft.toString());
      gridLine.setAttribute('y1', yPos.toString());
      gridLine.setAttribute('x2', (width - paddingRight).toString());
      gridLine.setAttribute('y2', yPos.toString());
      gridLine.setAttribute('class', 'chart-grid-line');
      svg.appendChild(gridLine);

      // Text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (paddingLeft - 8).toString());
      text.setAttribute('y', (yPos + 4).toString());
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'chart-text');
      text.textContent = yVal.toString();
      svg.appendChild(text);
    }

    // Draw Bars & X labels
    const barWidth = 28;
    const barSpacing = chartWidth / stats.length;

    stats.forEach((item, index) => {
      const xPos = paddingLeft + index * barSpacing + (barSpacing - barWidth) / 2;
      const barHeight = (item.count / maxVal) * chartHeight;
      const yPos = height - paddingBottom - barHeight;

      // Draw Bar Rect
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', xPos.toString());
      rect.setAttribute('y', yPos.toString());
      rect.setAttribute('width', barWidth.toString());
      rect.setAttribute('height', Math.max(barHeight, 2).toString());
      rect.setAttribute('class', 'chart-bar');

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${item.date}: ${item.count} tasks completed`;
      rect.appendChild(title);
      svg.appendChild(rect);

      // Draw X Label
      const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabel.setAttribute('x', (xPos + barWidth / 2).toString());
      xLabel.setAttribute('y', (height - paddingBottom + 18).toString());
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.setAttribute('class', 'chart-text');
      xLabel.textContent = item.label;
      svg.appendChild(xLabel);
    });
  }

  private drawHorizontalChart(svgId: string, data: { name: string; count: number }[], colors: { [key: string]: string }): void {
    const svg = document.getElementById(svgId) as unknown as SVGSVGElement;
    if (!svg) return;
    svg.innerHTML = '';

    const maxVal = Math.max(...data.map(d => d.count), 1);
    const width = 200;
    const rowHeight = 32;
    const paddingLeft = 55;
    const chartWidth = width - paddingLeft - 22;

    data.forEach((item, index) => {
      const yPos = index * rowHeight + 15;

      // Label
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', (paddingLeft - 8).toString());
      labelText.setAttribute('y', (yPos + 9).toString());
      labelText.setAttribute('text-anchor', 'end');
      labelText.setAttribute('class', 'chart-text');
      labelText.setAttribute('style', 'text-transform: capitalize;');
      labelText.textContent = item.name;
      svg.appendChild(labelText);

      // Background rect
      const bgBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgBar.setAttribute('x', paddingLeft.toString());
      bgBar.setAttribute('y', yPos.toString());
      bgBar.setAttribute('width', chartWidth.toString());
      bgBar.setAttribute('height', '10');
      bgBar.setAttribute('rx', '3');
      bgBar.setAttribute('fill', 'var(--panel-border)');
      svg.appendChild(bgBar);

      // Fill rect
      const fillWidth = (item.count / maxVal) * chartWidth;
      const fillBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fillBar.setAttribute('x', paddingLeft.toString());
      fillBar.setAttribute('y', yPos.toString());
      fillBar.setAttribute('width', fillWidth.toString());
      fillBar.setAttribute('height', '10');
      fillBar.setAttribute('rx', '3');
      fillBar.setAttribute('fill', colors[item.name.toLowerCase()] || 'var(--primary)');
      svg.appendChild(fillBar);

      // Count text
      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', (paddingLeft + fillWidth + 5).toString());
      valText.setAttribute('y', (yPos + 9).toString());
      valText.setAttribute('class', 'chart-text');
      valText.setAttribute('style', 'font-weight: 600;');
      valText.textContent = item.count.toString();
      svg.appendChild(valText);
    });
  }

  // General helpers
  private getRelativeDateText(dateStr: string): string {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return weekdays[date.getDay()];
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
