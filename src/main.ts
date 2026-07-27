import './styles/main.css';
import { TodoService } from './modules/TodoService';
import { ThemeManager } from './modules/ThemeManager';
import { UI } from './modules/UI';
import { NotificationManager } from './modules/NotificationManager';

document.addEventListener('DOMContentLoaded', () => {
  const service = new TodoService();
  const themeManager = new ThemeManager();
  new UI(service, themeManager);

  // Proactively check due tasks for notifications after load
  const notificationManager = new NotificationManager();
  setTimeout(() => {
    notificationManager.checkTasksDueToday(service.getTodos());
  }, 1500);
});
