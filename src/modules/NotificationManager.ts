import type { Todo } from '../types/todo';

export class NotificationManager {
  public requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return Promise.resolve(false);
    }
    if (Notification.permission === 'granted') {
      return Promise.resolve(true);
    }
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }

  public getPermissionStatus(): 'granted' | 'denied' | 'default' {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  public triggerDueAlert(todo: Todo): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      new Notification(`Task Due Today!`, {
        body: `"${todo.title}" is due today. Category: ${todo.category}.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/1950/1950715.png'
      });
    } catch (e) {
      console.warn('Failed to fire desktop notification.', e);
    }
  }

  public checkTasksDueToday(todos: Todo[]): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const todayStr = new Date().toISOString().split('T')[0];
    const dueToday = todos.filter(t => !t.completed && t.dueDate === todayStr);

    if (dueToday.length > 0) {
      const msg = dueToday.length === 1 
        ? `You have a task due today: "${dueToday[0].title}"` 
        : `You have ${dueToday.length} tasks due today!`;
        
      new Notification(`Task Reminders`, {
        body: msg,
        icon: 'https://cdn-icons-png.flaticon.com/512/1950/1950715.png'
      });
    }
  }
}
