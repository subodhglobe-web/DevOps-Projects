import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

let notes = [];
let nextId = 1;

app.use(cors());
app.use(express.json());

app.get('/notes', (req, res) => {
  res.json(notes);
});

app.post('/notes', (req, res) => {
  const note = {
    id: nextId++,
    markdown: req.body.markdown,
    tag: req.body.tag,
    timestamp: new Date().toISOString()
  };
  notes.push(note);
  res.json(note);
});

app.delete('/notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = notes.findIndex(note => note.id === id);
  if (index !== -1) {
    notes.splice(index, 1);
    res.json({ message: 'Note deleted' });
  } else {
    res.status(404).json({ message: 'Note not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});