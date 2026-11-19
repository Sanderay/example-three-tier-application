const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Work-appropriate song lyrics
const SONG_LYRICS = [
  { lyric: "Don't stop believin'", song: "Don't Stop Believin'", artist: "Journey" },
  { lyric: "I will always love you", song: "I Will Always Love You", artist: "Whitney Houston" },
  { lyric: "Imagine all the people living life in peace", song: "Imagine", artist: "John Lennon" },
  { lyric: "Here comes the sun", song: "Here Comes the Sun", artist: "The Beatles" },
  { lyric: "Good as hell", song: "Good as Hell", artist: "Lizzo" },
  { lyric: "Walking on sunshine", song: "Walking on Sunshine", artist: "Katrina & The Waves" },
  { lyric: "Don't give up, 'cause you have friends", song: "Don't Give Up", artist: "Peter Gabriel & Kate Bush" },
  { lyric: "Every little thing gonna be alright", song: "Three Little Birds", artist: "Bob Marley" },
  { lyric: "I can see clearly now", song: "I Can See Clearly Now", artist: "Johnny Nash" },
  { lyric: "You are the sunshine of my life", song: "You Are the Sunshine of My Life", artist: "Stevie Wonder" },
  { lyric: "Keep your head up", song: "Keep Your Head Up", artist: "Andy Grammer" },
  { lyric: "Good vibrations", song: "Good Vibrations", artist: "The Beach Boys" },
  { lyric: "Walking on air", song: "Walking on Air", artist: "Katy Perry" },
  { lyric: "I'm on top of the world", song: "On Top of the World", artist: "Imagine Dragons" },
  { lyric: "Don't stop me now, I'm having such a good time", song: "Don't Stop Me Now", artist: "Queen" },
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /lyrics/random — get a random work-appropriate song lyric
app.get('/lyrics/random', (_req, res) => {
  const randomIndex = Math.floor(Math.random() * SONG_LYRICS.length);
  res.json(SONG_LYRICS[randomIndex]);
});

// GET /tasks — list all tasks
app.get('/tasks', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete or rename)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title } = req.body;

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
    [newCompleted, newTitle, id]
  );
  res.json(updated[0]);
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
