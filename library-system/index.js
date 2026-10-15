// Modüler Kütüphane Sistemi: tüm modülleri burada birleştiriyoruz
//
// Kitaplar (books.js)
// GET    /books                 -> tüm kitaplar (?available=true / false)
// GET    /books/:id             -> tek kitap
// POST   /books                 -> yeni kitap
// DELETE /books/:id             -> kitabı sil (ödünçte değilse)
//
// Kullanıcılar (users.js)
// GET    /users                 -> tüm kullanıcılar
// GET    /users/:id             -> kullanıcı ve elindeki kitaplar
// POST   /users                 -> yeni kullanıcı
// DELETE /users/:id             -> kullanıcıyı sil (elinde kitap yoksa)
//
// Ödünç (loans.js)
// GET    /loans                 -> tüm kayıtlar (?active=true, ?userId=1)
// POST   /loans                 -> kitap ödünç al { userId, bookId }
// PATCH  /loans/:id/return      -> kitabı iade et

const express = require('express');
const app = express();
const port = 3005;

// Her modülden router'ı alıyoruz
const { router: booksRouter } = require('./books');
const { router: usersRouter } = require('./users');
const { router: loansRouter } = require('./loans');

app.use(express.json()); // JSON verilerini almak için gerekli middleware

// Modülleri kendi adreslerine bağlıyoruz
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/loans', loansRouter);

// Hiçbir route eşleşmezse
app.use((req, res) => {
    res.status(404).json({ message: 'Geçersiz istek', status: 'error' });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Kütüphane sistemi http://localhost:${port} adresinde çalışıyor.`);
});
