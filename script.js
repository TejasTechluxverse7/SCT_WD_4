document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('task-input');
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const addBtn = document.getElementById('add-btn');
  const taskList = document.getElementById('task-list');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const totalTasksEl = document.getElementById('total-tasks');
  const completedTasksEl = document.getElementById('completed-tasks');
  const remainingTasksEl = document.getElementById('remaining-tasks');
  const darkToggle = document.getElementById('darkToggle');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';

  // Dark mode toggle
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    darkToggle.innerHTML = document.body.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Add task
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

  function addTask() {
    const text = taskInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    if (!text) { alert('Enter a task!'); return; }

    const task = { id: Date.now(), text, date, time, completed: false };
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();

    taskInput.value = ''; dateInput.value = ''; timeInput.value = '';
  }

  function renderTasks() {
    taskList.innerHTML = '';
    let filtered = tasks;
    const today = new Date().toISOString().split('T')[0];
    if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);
    if (currentFilter === 'today') filtered = tasks.filter(t => t.date === today);

    if (filtered.length === 0) {
      taskList.innerHTML = `<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No tasks</p></div>`;
      return;
    }

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed':''}`;
      li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked':''}>
        <div class="task-content">
          <div class="task-text">${task.text}</div>
          ${task.date ? `<div class="task-datetime">${formatDate(task.date)} ${task.time||''}</div>`:''}
        </div>
        <div class="task-actions">
          <button class="edit-btn"><i class="fas fa-edit"></i></button>
          <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
        </div>`;
      taskList.appendChild(li);

      li.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
      li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    });
  }

  function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed:!t.completed}:t);
    saveTasks(); renderTasks(); updateStats();
  }

  function editTask(id) {
    const t = tasks.find(x => x.id === id);
    const newText = prompt('Edit task:', t.text);
    if (!newText) return;
    t.text = newText;
    saveTasks(); renderTasks();
  }

  function deleteTask(id) {
    if (!confirm('Delete task?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(); renderTasks(); updateStats();
  }

  function updateStats() {
    totalTasksEl.textContent = `Total: ${tasks.length}`;
    completedTasksEl.textContent = `Completed: ${tasks.filter(t=>t.completed).length}`;
    remainingTasksEl.textContent = `Remaining: ${tasks.filter(t=>!t.completed).length}`;
  }

  function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

  function formatDate(d) { return new Date(d).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}); }

  // Reminder check
  setInterval(() => {
    const now = new Date();
    tasks.forEach(t => {
      if (!t.completed && t.date && t.time) {
        const taskTime = new Date(`${t.date}T${t.time}`);
        if (Math.abs(taskTime - now) < 60000) {
          alert(`⏰ Reminder: ${t.text}`);
        }
      }
    });
  }, 60000);

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      renderTasks();
    });
  });

  renderTasks(); updateStats();
});
