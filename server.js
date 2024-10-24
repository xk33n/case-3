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

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ message: "Все поля обязательны." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(409).send({ message: "Пользователь с таким email уже зарегистрирован." });
    }

    await connection.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).send({ message: "Регистрация прошла успешно!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Что-то пошло не так." });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Все поля обязательны." });
  }

  try {
    const user = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length == 0) {
      return res.status(401).send({ message: "Неверный email или пароль." });
    }

    const validPassword = await bcrypt.compare(password, user[0].password_hash);

    if (!validPassword) {
      return res.status(401).send({ message: "Неверный email или пароль." });
    }

    const token = jwt.sign({ id: user[0].id }, JWT_SECRET, { expiresIn: "24h" });

    res.cookie("jwt", token, { httpOnly: true };

    res.send({ message: "Вход выполнен успешно!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Что-то пошло не так." });
  }
});

// Запуск сервера
app.listen(process.env.PORT, () => {
  console.log(`Сервер запущен на порту ${process.env.PORT}`);
});
