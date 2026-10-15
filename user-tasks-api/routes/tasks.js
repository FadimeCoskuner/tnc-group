// Görev modülü: /tasks ile başlayan tüm endpoint'ler
// server.js'de app.use('/tasks', tasksRouter) ile bağlandı

const express = require('express');
const router = express.Router();
const { users, tasks, getNextId } = require('../data');

// Verilen id'de bir kullanıcı var mı?
function userExists(userId) {
    return users.some(u => u.id === userId);
}

// GET /tasks -> tüm görevler
// İsteğe bağlı filtre: /tasks?completed=true veya /tasks?completed=false
router.get('/', (req, res) => {
    const { completed } = req.query;
    let result = tasks;

    if (completed !== undefined) {
        // Query'den gelen değer yazıdır: "true" ise true, değilse false
        const isCompleted = completed === 'true';
        result = tasks.filter(t => t.completed === isCompleted);
    }

    res.json({ message: 'Görevler listelendi', status: 'success', count: result.length, data: result });
});

// GET /tasks/:id -> tek görev
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({ message: 'Görev bulunamadı', status: 'error' });
    }

    res.json({ message: 'Görev bulundu', status: 'success', data: task });
});

// POST /tasks -> yeni görev
// Body: { "title": "Ders çalış", "userId": 2 }
router.post('/', (req, res) => {
    const { title, userId, completed } = req.body;

    if (!title || userId === undefined) {
        return res.status(400).json({ message: 'title ve userId alanları zorunludur', status: 'error' });
    }

    // Görev, var olan bir kullanıcıya ait olmalı
    if (!userExists(userId)) {
        return res.status(400).json({ message: `${userId} id'li kullanıcı yok`, status: 'error' });
    }

    const newTask = {
        id: getNextId(tasks),
        title,
        completed: completed === true, // gönderilmezse false
        userId
    };

    tasks.push(newTask);

    res.status(201).json({ message: 'Görev eklendi', status: 'success', data: newTask });
});

// PATCH /tasks/:id -> görevin bazı alanlarını güncelle
// Örnek body: { "completed": true }
router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({ message: 'Görev bulunamadı', status: 'error' });
    }

    const { title, completed, userId } = req.body;

    // Görev başka bir kullanıcıya aktarılıyorsa o kullanıcı var olmalı
    if (userId !== undefined && !userExists(userId)) {
        return res.status(400).json({ message: `${userId} id'li kullanıcı yok`, status: 'error' });
    }

    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = completed;
    if (userId !== undefined) task.userId = userId;

    res.json({ message: 'Görev güncellendi', status: 'success', data: task });
});

// DELETE /tasks/:id -> görevi sil
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Görev bulunamadı', status: 'error' });
    }

    const deletedTask = tasks.splice(index, 1)[0];

    res.json({ message: 'Görev silindi', status: 'success', data: deletedTask });
});

module.exports = router;
