// Kullanıcı modülü: /users ile başlayan tüm endpoint'ler
// server.js'de app.use('/users', usersRouter) ile bağlandığı için
// burada '/' yazmak aslında '/users' demektir

const express = require('express');
const router = express.Router();
const { users, tasks, getNextId } = require('../data');

// GET /users -> tüm kullanıcılar
router.get('/', (req, res) => {
    res.json({ message: 'Kullanıcılar listelendi', status: 'success', data: users });
});

// GET /users/:id -> tek kullanıcı
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    res.json({ message: 'Kullanıcı bulundu', status: 'success', data: user });
});

// GET /users/:id/tasks -> o kullanıcının görevleri
router.get('/:id/tasks', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    // userId'si bu kullanıcıya eşit olan görevleri filtrele
    const userTasks = tasks.filter(t => t.userId === id);

    res.json({
        message: `${user.name} kullanıcısının görevleri listelendi`,
        status: 'success',
        user: user,
        count: userTasks.length,
        data: userTasks
    });
});

// POST /users -> yeni kullanıcı
// Body: { "name": "Ali", "email": "ali@mail.com" }
router.post('/', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'name ve email alanları zorunludur', status: 'error' });
    }

    // Aynı e-posta ile ikinci kullanıcı olmasın
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı', status: 'error' });
    }

    const newUser = { id: getNextId(users), name, email };
    users.push(newUser);

    res.status(201).json({ message: 'Kullanıcı eklendi', status: 'success', data: newUser });
});

// PUT /users/:id -> kullanıcıyı güncelle
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'name ve email alanları zorunludur', status: 'error' });
    }

    user.name = name;
    user.email = email;

    res.json({ message: 'Kullanıcı güncellendi', status: 'success', data: user });
});

// DELETE /users/:id -> kullanıcıyı ve ona ait görevleri sil
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    const deletedUser = users.splice(index, 1)[0];

    // Sahibi olmayan görev kalmasın: bu kullanıcının görevlerini de sil
    // Sondan başa doğru gidiyoruz ki splice indeksleri kaydırmasın
    let deletedTaskCount = 0;
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].userId === id) {
            tasks.splice(i, 1);
            deletedTaskCount++;
        }
    }

    res.json({
        message: `Kullanıcı ve ${deletedTaskCount} görevi silindi`,
        status: 'success',
        data: deletedUser
    });
});

module.exports = router;
