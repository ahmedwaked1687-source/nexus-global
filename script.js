const STORAGE_KEY = 'todo-list-items';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error('Unable to read tasks from localStorage:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateTaskCount() {
  const remainingTasks = tasks.filter((task) => !task.completed).length;
  const label = remainingTasks === 1 ? 'task left' : 'tasks left';
  taskCount.textContent = `${remainingTasks} ${label}`;
}

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks here yet. Add one to get started.</li>';
    updateTaskCount();
    return;
  }

  todoList.innerHTML = filteredTasks
    .map(
      (task) => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="todo-main">
            <button class="check-btn" type="button" aria-label="Mark task complete" data-action="toggle"></button>
            <p class="todo-text">${escapeHtml(task.text)}</p>
          </div>
          <button class="delete-btn" type="button" aria-label="Delete task" data-action="delete">×</button>
        </li>
      `
    )
    .join('');

  updateTaskCount();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addTask(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text: trimmedText,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === Number(taskId) ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== Number(taskId));
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]');

  if (!actionButton) {
    return;
  }

  const item = actionButton.closest('.todo-item');
  const taskId = item?.dataset.id;

  if (!taskId) {
    return;
  }

  if (actionButton.dataset.action === 'toggle') {
    toggleTask(taskId);
  }

  if (actionButton.dataset.action === 'delete') {
    deleteTask(taskId);
  }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
    });

    renderTasks();
  });
});

renderTasks();
