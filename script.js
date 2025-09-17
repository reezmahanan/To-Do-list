document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addButton = document.getElementById('add-button');
    const taskList = document.getElementById('task-list');
    const filters = document.querySelectorAll('.filter');
    const clearButton = document.querySelector('.clear-btn');
    const tasksCounter = document.getElementById('tasks-counter');
    
    // Event Listeners
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    taskList.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle delete button click
        if (target.classList.contains('fa-trash') || target.classList.contains('delete-btn')) {
            const taskItem = target.closest('li');
            deleteTask(taskItem);
        }
        
        // Update counter
        updateTasksCounter();
    });
    
    // Toggle task completion
    taskList.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            const taskItem = e.target.closest('li');
            taskItem.classList.toggle('completed');
            
            // Update counter
            updateTasksCounter();
        }
    });
    
    // Filter tasks
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Update active filter
            filters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.getAttribute('data-filter');
            filterTasks(filterType);
        });
    });
    
    // Clear all tasks
    clearButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all tasks?')) {
            taskList.innerHTML = '';
            updateTasksCounter();
        }
    });
    
    // Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText !== '') {
            // Create unique ID for the task
            const taskId = 'task-' + Date.now();
            
            // Create new task HTML
            const taskHTML = `
                <li class="task">
                    <input type="checkbox" id="${taskId}">
                    <label for="${taskId}">
                        <span class="check-icon"><i class="fas fa-check"></i></span>
                        ${taskText}
                    </label>
                    <span class="delete-btn"><i class="fas fa-trash"></i></span>
                </li>
            `;
            
            // Add task to the list
            taskList.insertAdjacentHTML('beforeend', taskHTML);
            
            // Clear input
            taskInput.value = '';
            
            // Update counter
            updateTasksCounter();
        }
    }
    
    function deleteTask(taskElement) {
        taskElement.remove();
    }
    
    function filterTasks(filterType) {
        const tasks = taskList.querySelectorAll('.task');
        
        tasks.forEach(task => {
            switch(filterType) {
                case 'all':
                    task.style.display = 'flex';
                    break;
                case 'pending':
                    if (task.classList.contains('completed')) {
                        task.style.display = 'none';
                    } else {
                        task.style.display = 'flex';
                    }
                    break;
                case 'completed':
                    if (task.classList.contains('completed')) {
                        task.style.display = 'flex';
                    } else {
                        task.style.display = 'none';
                    }
                    break;
            }
        });
    }
    
    function updateTasksCounter() {
        const totalTasks = taskList.querySelectorAll('.task').length;
        const completedTasks = taskList.querySelectorAll('.task.completed').length;
        const remainingTasks = totalTasks - completedTasks;
        
        tasksCounter.textContent = `${remainingTasks} task${remainingTasks !== 1 ? 's' : ''} left`;
    }
    
    // Initialize counter
    updateTasksCounter();
});