// Kitap Yönetimi API'si
//
// GET    /books              -> tüm kitaplar
// GET    /books?type=roman   -> türe göre filtreleme
// GET    /books/:id          -> tek kitap
// POST   /books              -> yeni kitap ekle
// PUT    /books/:id          -> kitabı tamamen güncelle
// PATCH  /books/:id          -> kitabın bazı alanlarını güncelle
// DELETE /books/:id          -> kitabı sil

const express = require('express');
const app = express();
const port = 3002;

app.use(express.json()); // JSON verilerini almak için gerekli middleware

// public klasöründeki dosyaları (index.html, style, script) tarayıcıya sunar
// http://localhost:3002 açılınca public/index.html gösterilir
app.use(express.static(__dirname + '/public'));

// Kitap listesi (sunucu kapanınca başa döner)
let books = [
    { id: 1, title: "Suç ve Ceza", author: "Dostoyevski", year: 1866, type: "roman" },
    { id: 2, title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", year: 1943, type: "roman" },
    { id: 3, title: "Simyacı", author: "Paulo Coelho", year: 1988, type: "roman" },
    { id: 4, title: "Nutuk", author: "Mustafa Kemal Atatürk", year: 1927, type: "tarih" },
    { id: 5, title: "Sapiens", author: "Yuval Noah Harari", year: 2011, type: "bilim" }
];

// ---------- GET: tüm kitaplar + filtreleme ----------
// Örnek: /books?type=roman
app.get('/books', (req, res) => {
    const type = req.query.type;

    // type yoksa tüm kitapları döndür
    if (!type) {
        return res.json({ message: 'Kitaplar listelendi', status: 'success', data: books });
    }

    // type varsa sadece o türdeki kitapları filtrele
    // toLowerCase: "Roman" ve "roman" aynı kabul edilsin
    const filteredBooks = books.filter(b => b.type.toLowerCase() === type.toLowerCase());

    res.json({ message: `"${type}" türündeki kitaplar listelendi`, status: 'success', data: filteredBooks });
});

// ---------- GET: tek kitap ----------
app.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    res.json({ message: 'Kitap bulundu', status: 'success', data: book });
});

// ---------- POST: yeni kitap ----------
// Body: { "title": "...", "author": "...", "year": 2000, "type": "roman" }
app.post('/books', (req, res) => {
    const { title, author, year, type } = req.body;

    // Tüm alanlar zorunlu
    if (!title || !author || !year || !type) {
        return res.status(400).json({ message: 'title, author, year ve type alanları zorunludur', status: 'error' });
    }

    // id otomatik verilir: en büyük id'nin 1 fazlası
    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    const newBook = { id: newId, title, author, year, type };

    books.push(newBook);

    res.status(201).json({ message: 'Kitap eklendi', status: 'success', data: newBook });
});

// ---------- PUT: kitabı tamamen güncelle ----------
// Tüm alanların gönderilmesi gerekir
app.put('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    const { title, author, year, type } = req.body;

    if (!title || !author || !year || !type) {
        return res.status(400).json({ message: 'PUT için tüm alanlar zorunludur', status: 'error' });
    }

    // id aynı kalır, diğer alanlar tamamen yenilenir
    books[index] = { id, title, author, year, type };

    res.json({ message: 'Kitap güncellendi', status: 'success', data: books[index] });
});

// ---------- PATCH: bazı alanları güncelle ----------
// Sadece gönderilen alanlar değişir
app.patch('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    const { title, author, year, type } = req.body;

    // Hangi alan gönderildiyse sadece o güncellenir
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (year !== undefined) book.year = year;
    if (type !== undefined) book.type = type;

    res.json({ message: 'Kitap kısmen güncellendi', status: 'success', data: book });
});

// ---------- DELETE: kitabı sil ----------
app.delete('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    // splice: diziden o indeksteki 1 elemanı çıkarır
    const deletedBook = books.splice(index, 1)[0];

    res.json({ message: 'Kitap silindi', status: 'success', data: deletedBook });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
