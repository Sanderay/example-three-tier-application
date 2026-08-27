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
  const { rows } = await db.query('SELECT id, email, created_at FROM users ORDER BY email ASC');
  res.json(rows);
});

// GET /tasks — list all tasks (optionally filtered by assigned_to)
app.get('/tasks', async (req, res) => {
  const assignedTo = req.query.assigned_to;
  
  let query = `
    SELECT t.*, u.email as assigned_to_email 
    FROM tasks t 
    LEFT JOIN users u ON t.assigned_to = u.id
  `;
  let params = [];
  
  if (assignedTo) {
    query += ' WHERE t.assigned_to = $1';
    params.push(parseInt(assignedTo, 10));
  }
  
  query += ' ORDER BY t.created_at ASC';
  
  const { rows } = await db.query(query, params);
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title, assigned_to } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  
  const assignedToValue = assigned_to ? parseInt(assigned_to, 10) : null;
  
  const { rows } = await db.query(
    `INSERT INTO tasks (title, assigned_to) VALUES ($1, $2) 
     RETURNING *, (SELECT email FROM users WHERE id = $2) as assigned_to_email`,
    [title.trim(), assignedToValue]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete, rename, or reassign)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title, assigned_to } = req.body;

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;
  const newAssignedTo = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to, 10) : null) : current.assigned_to;

  const { rows: updated } = await db.query(
    `UPDATE tasks SET completed = $1, title = $2, assigned_to = $3 WHERE id = $4 
     RETURNING *, (SELECT email FROM users WHERE id = $3) as assigned_to_email`,
    [newCompleted, newTitle, newAssignedTo, id]
  );
  res.json(updated[0]);
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
