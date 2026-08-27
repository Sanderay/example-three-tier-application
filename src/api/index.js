const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /users — list all users
app.get('/users', async (_req, res) => {
  const { rows } = await db.query('SELECT id, email FROM users ORDER BY email ASC');
  res.json(rows);
});

// GET /tasks — list all tasks (optionally filter by assigned_user_id)
app.get('/tasks', async (req, res) => {
  const { assigned_user_id } = req.query;
  
  let query = `
    SELECT tasks.*, users.email as assigned_user_email
    FROM tasks
    LEFT JOIN users ON tasks.assigned_user_id = users.id
  `;
  const params = [];
  
  if (assigned_user_id) {
    query += ' WHERE tasks.assigned_user_id = $1';
    params.push(parseInt(assigned_user_id, 10));
  }
  
  query += ' ORDER BY tasks.created_at ASC';
  
  const { rows } = await db.query(query, params);
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title, assigned_user_id } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  
  const params = [title.trim()];
  let query = 'INSERT INTO tasks (title';
  let values = 'VALUES ($1';
  
  if (assigned_user_id !== undefined && assigned_user_id !== null) {
    query += ', assigned_user_id';
    values += ', $2';
    params.push(parseInt(assigned_user_id, 10));
  }
  
  query += ') ' + values + ') RETURNING *';
  
  const { rows } = await db.query(query, params);
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete, rename, or reassign)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title, assigned_user_id } = req.body;

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;
  const newAssignedUserId = assigned_user_id !== undefined 
    ? (assigned_user_id === null ? null : parseInt(assigned_user_id, 10))
    : current.assigned_user_id;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, title = $2, assigned_user_id = $3 WHERE id = $4 RETURNING *',
    [newCompleted, newTitle, newAssignedUserId, id]
  );
  res.json(updated[0]);
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
