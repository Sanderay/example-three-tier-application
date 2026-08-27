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

// POST /users — create a user
app.post('/users', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at',
      [email.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    throw err;
  }
});

// GET /tasks — list all tasks, optionally filtered by assigned_to
app.get('/tasks', async (req, res) => {
  const { assigned_to } = req.query;
  let query = 'SELECT * FROM tasks';
  const params = [];
  
  if (assigned_to !== undefined) {
    const userId = parseInt(assigned_to, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'assigned_to must be a valid user ID' });
    }
    query += ' WHERE assigned_to = $1';
    params.push(userId);
  }
  
  query += ' ORDER BY created_at ASC';
  const { rows } = await db.query(query, params);
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title, assigned_to } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  
  let assignedToId = null;
  if (assigned_to !== undefined) {
    assignedToId = parseInt(assigned_to, 10);
    if (isNaN(assignedToId)) {
      return res.status(400).json({ error: 'assigned_to must be a valid user ID' });
    }
    // Verify user exists
    const { rows: userRows } = await db.query('SELECT id FROM users WHERE id = $1', [assignedToId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
  }
  
  const { rows } = await db.query(
    'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2) RETURNING *',
    [title.trim(), assignedToId]
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
  
  let newAssignedTo = current.assigned_to;
  if (assigned_to !== undefined) {
    if (assigned_to === null) {
      newAssignedTo = null;
    } else {
      const assignedToId = parseInt(assigned_to, 10);
      if (isNaN(assignedToId)) {
        return res.status(400).json({ error: 'assigned_to must be a valid user ID or null' });
      }
      // Verify user exists
      const { rows: userRows } = await db.query('SELECT id FROM users WHERE id = $1', [assignedToId]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      newAssignedTo = assignedToId;
    }
  }

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, title = $2, assigned_to = $3 WHERE id = $4 RETURNING *',
    [newCompleted, newTitle, newAssignedTo, id]
  );
  res.json(updated[0]);
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
