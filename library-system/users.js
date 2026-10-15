// Kullanıcılar modülü (kullanicilar.js)
// index.js'de app.use('/users', usersRouter) ile bağlanır

const express = require('express');
const router = express.Router();

// Kitaplar modülünden books dizisini alıyoruz (kullanıcının elindeki kitapları bulmak için)
const { books } = require('./books');

const users = [
    { id: 1, name: "Ayşe", email: "ayse@mail.com" },
    { id: 2, name: "Mehmet", email: "mehmet@mail.com" },
    { id: 3, name: "Zeynep", email: "zeynep@mail.com" }
];

// GET /users -> tüm kullanıcılar
router.get('/', (req, res) => {
    res.json({ message: 'Kullanıcılar listelendi', status: 'success', data: users });
});

// GET /users/:id -> tek kullanıcı ve şu an elindeki kitaplar
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    const borrowedBooks = books.filter(b => b.borrowedBy === id);

    res.json({ message: 'Kullanıcı bulundu', status: 'success', data: { ...user, borrowedBooks } });
});

// POST /users -> yeni kullanıcı
// Body: { "name": "Ali", "email": "ali@mail.com" }
router.post('/', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'name ve email alanları zorunludur', status: 'error' });
    }

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı', status: 'error' });
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, name, email };
    users.push(newUser);

    res.status(201).json({ message: 'Kullanıcı eklendi', status: 'success', data: newUser });
});

// DELETE /users/:id -> kullanıcıyı sil (elinde kitap varsa silinemez)
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    if (books.some(b => b.borrowedBy === id)) {
        return res.status(400).json({ message: 'Elinde kitap olan kullanıcı silinemez, önce kitapları iade etmeli', status: 'error' });
    }

    const deletedUser = users.splice(index, 1)[0];
    res.json({ message: 'Kullanıcı silindi', status: 'success', data: deletedUser });
});

module.exports = { router, users };
