const express = require('express');
const router = express.Router();
const notes = require('../data/notes');
const notesVerify = require('../middleware/verify');

// GET /notes ve GET /notes?search=express
// Tüm notları getirir; search verilirse başlık VEYA içerikte arama yapar
router.get('/', (req, res) => {
  const { search } = req.query;

  // Arama kelimesi yoksa tüm notları döndür
  if (!search) {
    return res.json(notes);
  }

  // Büyük/küçük harf duyarsız arama için kelimeyi küçük harfe çevir
  const keyword = search.toLowerCase();

  // Başlıkta veya içerikte geçen notları filtrele
  const results = notes.filter(note =>
    note.title.toLowerCase().includes(keyword) ||
    note.content.toLowerCase().includes(keyword)
  );

  res.json({
    search,
    count: results.length,
    results
  });
});

// GET /notes/:id - id'ye göre tek bir not getirir
router.get('/:id', (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));

  if (!note) {
    return res.status(404).json({ error: "Not bulunamadı" });
  }

  res.json(note);
});

// POST /notes - yeni not ekler (önce notesVerify ile doğrulanır)
router.post('/', notesVerify, (req, res) => {
  const { title, content } = req.body;

  // Yeni id: mevcut en büyük id + 1 (liste boşsa 1)
  const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;

  const newNote = { id: newId, title, content };
  notes.push(newNote);

  res.status(201).json(newNote);
});

// PUT /notes/:id - mevcut notu günceller (önce notesVerify ile doğrulanır)
router.put('/:id', notesVerify, (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));

  if (!note) {
    return res.status(404).json({ error: "Not bulunamadı" });
  }

  note.title = req.body.title;
  note.content = req.body.content;

  res.json(note);
});

// DELETE /notes/:id - notu siler ve silinen notu döndürür
router.delete('/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Not bulunamadı" });
  }

  const deletedNote = notes.splice(index, 1)[0];
  res.json(deletedNote);
});

module.exports = router;
