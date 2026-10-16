const express = require('express');
const router = express.Router();
const notes = require('../data/notes');
const pagination = require('../middleware/pagination');
const updateVerify = require('../middleware/updateVerify');
const { isValidId, noteVerify } = require('../middleware/verify');
const { filterBySearch, paginate } = require('../utils/listHelpers');

// GET /notes?userId=1&search=express&page=1&limit=5
// Tüm notları listeler; userId ve search ile filtreler, sonra sayfalar
router.get('/', pagination, (req, res) => {
  const { userId, search } = req.query;
  const { page, limit } = req.pagination;

  let filtered = notes;

  // userId verildiyse yalnızca o kullanıcının notları
  if (userId !== undefined) {
    if (!isValidId(userId)) {
      return res.status(400).json({ success: false, errors: ['userId pozitif bir sayı olmalı'] });
    }

    filtered = filtered.filter(n => n.userId === Number(userId));
  }

  // Başlık veya içerikte arama
  filtered = filterBySearch(filtered, search, ['title', 'content']);

  res.json({ success: true, ...paginate(filtered, page, limit) });
});

// GET /notes/:id - id'ye göre tek bir not getirir
router.get('/:id', (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, errors: ['ID pozitif bir sayı olmalı'] });
  }

  const note = notes.find(n => n.id === Number(req.params.id));

  if (!note) {
    return res.status(404).json({ success: false, errors: ['Not bulunamadı'] });
  }

  res.json({ success: true, data: note });
});

// POST /notes - yeni not ekler (başlık, içerik ve userId doğrulanır)
router.post('/', noteVerify, (req, res) => {
  const { title, content, userId } = req.body;

  // Yeni id: mevcut en büyük id + 1 (liste boşsa 1)
  const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;

  const newNote = { id: newId, userId: Number(userId), title, content };
  notes.push(newNote);

  res.status(201).json({ success: true, data: newNote });
});

// PUT /notes/:id - notun başlığını ve içeriğini günceller
// updateVerify; ID, kayıt ve başlık/içerik kontrollerini yapar, notu req.note'a koyar
router.put('/:id', updateVerify, (req, res) => {
  const note = req.note;

  note.title = req.body.title;
  note.content = req.body.content;

  res.json({ success: true, data: note });
});

// DELETE /notes/:id - notu siler ve silinen notu döndürür
router.delete('/:id', (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, errors: ['ID pozitif bir sayı olmalı'] });
  }

  const index = notes.findIndex(n => n.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ success: false, errors: ['Not bulunamadı'] });
  }

  const deletedNote = notes.splice(index, 1)[0];
  res.json({ success: true, data: deletedNote });
});

module.exports = router;
