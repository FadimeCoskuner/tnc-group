// Kitaplar modülü (kitaplar.js)
// index.js'de app.use('/books', booksRouter) ile bağlanır

const express = require('express');
const router = express.Router();

// borrowedBy: kitabı ödünç alan kullanıcının id'si, rafta ise null
const books = [
    { id: 1, title: "Suç ve Ceza", author: "Dostoyevski", borrowedBy: null },
    { id: 2, title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", borrowedBy: null },
    { id: 3, title: "Simyacı", author: "Paulo Coelho", borrowedBy: null },
    { id: 4, title: "1984", author: "George Orwell", borrowedBy: null },
    { id: 5, title: "Küçük Prens", author: "Antoine de Saint-Exupéry", borrowedBy: null }
];

// GET /books -> tüm kitaplar
// GET /books?available=true  -> sadece raftaki kitaplar
// GET /books?available=false -> sadece ödünçteki kitaplar
router.get('/', (req, res) => {
    const { available } = req.query;
    let result = books;

    if (available === 'true') {
        result = books.filter(b => b.borrowedBy === null);
    } else if (available === 'false') {
        result = books.filter(b => b.borrowedBy !== null);
    }

    res.json({ message: 'Kitaplar listelendi', status: 'success', count: result.length, data: result });
});

// GET /books/:id -> tek kitap
router.get('/:id', (req, res) => {
    const book = books.find(b => b.id === Number(req.params.id));

    if (!book) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    res.json({ message: 'Kitap bulundu', status: 'success', data: book });
});

// POST /books -> yeni kitap
// Body: { "title": "Dune", "author": "Frank Herbert" }
router.post('/', (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'title ve author alanları zorunludur', status: 'error' });
    }

    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    const newBook = { id: newId, title, author, borrowedBy: null };
    books.push(newBook);

    res.status(201).json({ message: 'Kitap eklendi', status: 'success', data: newBook });
});

// DELETE /books/:id -> kitabı sil (ödünçteyse silinemez)
router.delete('/:id', (req, res) => {
    const index = books.findIndex(b => b.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    if (books[index].borrowedBy !== null) {
        return res.status(400).json({ message: 'Ödünçteki kitap silinemez, önce iade edilmeli', status: 'error' });
    }

    const deletedBook = books.splice(index, 1)[0];
    res.json({ message: 'Kitap silindi', status: 'success', data: deletedBook });
});

// Router'ı index.js için, books dizisini de diğer modüller (users, loans) için dışa aktarıyoruz
module.exports = { router, books };
