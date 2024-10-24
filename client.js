document.addEventListener('DOMContentLoaded', function() {
  fetchTasks();
  document.getElementById('addTaskForm').addEventListener('submit', addTask);
});

async function fetchTasks() {
  try {
    const response = await fetch('/tasks');
    const data = await response.json();
    
    displayTasks(data);
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
  }
}

function displayTasks(tasks) {
  const tasksList = document.getElementById('tasksList');
  
  let html = '';
  tasks.forEach(task => {
    html += `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p class="card-text"><small class="text-muted">Срок выполнения: ${new Date(task.due_date).toLocaleString()}</small></p>
          <a href="#" class="btn btn-warning edit-task-btn" data-id="${task.id}">Редактировать</a>
          <a href="#" class="btn btn-danger delete-task-btn" data-id="${task.id}">Удалить</a>
        </div>
      </div>
    `;
  });

  tasksList.innerHTML = html;

  // Обработчики событий для кнопок редактирования и удаления
  document.querySelectorAll('.edit-task-btn').forEach(btn => {
    btn.addEventListener('click', editTask);
  });

  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', deleteTask);
  });
}

async function addTask(event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById('addTaskForm'));
  const title = formData.get('titleInput');
  const description = formData.get('descriptionInput');
  const dueDate = formData.get('dueDateInput');

  try {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        dueDate,
        statusId: 1 // По умолчанию новая задача имеет статус "Новая"
      })
    });

    if (response.ok) {
      alert('Задача успешно добавлена!');
      fetchTasks(); // Перезагружаем список задач после успешного добавления
