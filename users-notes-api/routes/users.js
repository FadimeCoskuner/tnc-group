const express = require('express');
const router = express.Router();
const users = require('../data/users');
const notes = require('../data/notes');
const pagination = require('../middleware/pagination');
const { isValidId, userVerify } = require('../middleware/verify');
const { filterBySearch, paginate } = require('../utils/listHelpers');

// GET /users?search=ayşe&page=1&limit=5
// Kullanıcıları listeler; search ile ad veya e-postada arama yapar
router.get('/', pagination, (req, res) => {
  const { search } = req.query;
  const { page, limit } = req.pagination;

  const filtered = filterBySearch(users, search, ['name', 'email']);

  res.json({ success: true, ...paginate(filtered, page, limit) });
});

// GET /users/:id - id'ye göre tek bir kullanıcı getirir
router.get('/:id', (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, errors: ['ID pozitif bir sayı olmalı'] });
  }

  const user = users.find(u => u.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ success: false, errors: ['Kullanıcı bulunamadı'] });
  }

  res.json({ success: true, data: user });
});

// GET /users/:id/notes?search=express&page=1&limit=5
// O kullanıcının notlarını sayfalı ve filtreli olarak döndürür
router.get('/:id/notes', pagination, (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, errors: ['ID pozitif bir sayı olmalı'] });
  }

  const userId = Number(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, errors: ['Kullanıcı bulunamadı'] });
  }

  const { search } = req.query;
  const { page, limit } = req.pagination;

  // 1) Önce kullanıcının notlarını al, 2) sonra aramaya göre filtrele, 3) en son sayfala
  const userNotes = notes.filter(n => n.userId === userId);
  const filtered = filterBySearch(userNotes, search, ['title', 'content']);

  res.json({
    success: true,
    user: { id: user.id, name: user.name },
    ...paginate(filtered, page, limit)
  });
});

// POST /users - yeni kullanıcı ekler (önce userVerify ile doğrulanır)
router.post('/', userVerify, (req, res) => {
  const { name, email } = req.body;

  // Yeni id: mevcut en büyük id + 1 (liste boşsa 1)
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = { id: newId, name, email };
  users.push(newUser);

  res.status(201).json({ success: true, data: newUser });
});

module.exports = router;
