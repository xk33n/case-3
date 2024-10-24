const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

// Настройки CORS для взаимодействия между клиентом и сервером
app.use(cors());

// Парсинг тела запроса в JSON формате
app.use(express.json());

// Создание пула соединений с базой данных
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Маршрут для получения всех задач
app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tasks');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Ошибка при получении задач' });
  }
});

// Маршрут для добавления новой задачи
app.post('/tasks', async (req, res) => {
  const { title, description, dueDate, statusId } = req.body;

  if (!title || !description || !dueDate || !statusId) {
    return res.status(400).send({ message: 'Не все поля заполнены' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description, due_date, status_id) VALUES (?, ?, ?, ?)',
      [title, description, new Date(dueDate), statusId]
    );

    res.status(201).json({ id: result.insertId, message: 'Задача создана' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Ошибка при создании задачи' });
  }
});

// Маршрут для обновления задачи
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, statusId } = req.body;

  if (!title || !description || !dueDate || !statusId) {
    return res.status(400).send({ message: 'Не все поля заполнены' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, due_date = ?, status_id = ? WHERE id = ?',
      [title, description, new Date(dueDate), statusId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Задачи не существует' });
    }

    res.status(200).json({ message: 'Задача обновлена' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Ошибка при обновлении задачи' });
  }
});

// Маршрут для удаления задачи
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Задачи не существует' });
    }

    res.status(204).end(); // Нет контента для возврата
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Ошибка при удалении задачи' });
  }
});

// Запуск сервера
app.listen(process.env.PORT, () => {
  console.log(`Сервер запущен на порту ${process.env.PORT}`);
});
