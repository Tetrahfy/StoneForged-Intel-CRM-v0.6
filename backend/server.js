const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const db = new Database('stoneforged.db');
const app = express();

app.use(cors());
app.use(express.json());

// Table setup
db.exec(`CREATE TABLE IF NOT EXISTS prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT,
  trigger TEXT,
  score REAL,
  decision_maker TEXT,
  next_action TEXT
)`);

// GET all
app.get('/api/prospects', (req, res) => {
  const rows = db.prepare('SELECT * FROM prospects ORDER BY score DESC').all();
  res.json(rows);
});

// POST new
app.post('/api/prospects', (req, res) => {
  const { brand, trigger, score, decision_maker, next_action } = req.body;
  const stmt = db.prepare(`
    INSERT INTO prospects (brand, trigger, score, decision_maker, next_action)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(brand, trigger, score, decision_maker, next_action);
  res.json({ success: true, id: info.lastInsertRowid });
});

// DELETE one
app.delete('/api/prospects/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM prospects WHERE id = ?');
  const info = stmt.run(id);
  res.json({ success: info.changes > 0 });
});

// Seed
app.get('/api/seed', (req, res) => {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO prospects (brand, trigger, score, decision_maker, next_action)
    VALUES (?, ?, ?, ?, ?)
  `);
  insert.run('VitalSleep', 'New R&D hire', 9.2, 'R&D Director', 'Send sample');
  insert.run('EnergyBoost', 'Facility expansion', 8.7, 'Innovation Manager', 'Technical call');
  insert.run('PureRest', 'Reformulation announced', 9.8, 'Formulation Lead', 'Personalized message');
  res.send('Examples added!');
});

app.listen(3000, () => {
  console.log('StoneForged-Intel backend running → http://localhost:3000');
});
