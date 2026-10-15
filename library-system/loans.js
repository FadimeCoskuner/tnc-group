// Ödünç modülü (odunc.js): ödünç alma ve iade
// index.js'de app.use('/loans', loansRouter) ile bağlanır

const express = require('express');
const router = express.Router();

// Diğer iki modülün verilerini kullanıyoruz
const { books } = require('./books');
const { users } = require('./users');

// Bir kullanıcının aynı anda alabileceği en fazla kitap sayısı
const MAX_LOANS = 3;

// Her ödünç işleminin kaydı
// returnDate: null ise kitap hâlâ kullanıcıda
const loans = [];

// Bugünün tarihini "2026-10-15" şeklinde döndürür
function today() {
    return new Date().toISOString().split('T')[0];
}

// GET /loans -> tüm ödünç kayıtları
// GET /loans?active=true -> sadece iade edilmemiş olanlar
// GET /loans?userId=1    -> bir kullanıcının kayıtları
router.get('/', (req, res) => {
    const { active, userId } = req.query;
    let result = loans;

    if (active === 'true') {
        result = result.filter(l => l.returnDate === null);
    } else if (active === 'false') {
        result = result.filter(l => l.returnDate !== null);
    }

    if (userId) {
        result = result.filter(l => l.userId === Number(userId));
    }

    // Kayıtlara kitap ve kullanıcı adını da ekleyerek döndür (okunması kolay olsun)
    const detailed = result.map(loan => ({
        ...loan,
        bookTitle: books.find(b => b.id === loan.bookId)?.title,
        userName: users.find(u => u.id === loan.userId)?.name
    }));

    res.json({ message: 'Ödünç kayıtları listelendi', status: 'success', count: detailed.length, data: detailed });
});

// POST /loans -> kitap ödünç al
// Body: { "userId": 1, "bookId": 2 }
router.post('/', (req, res) => {
    const { userId, bookId } = req.body;

    if (userId === undefined || bookId === undefined) {
        return res.status(400).json({ message: 'userId ve bookId alanları zorunludur', status: 'error' });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı', status: 'error' });
    }

    const book = books.find(b => b.id === bookId);
    if (!book) {
        return res.status(404).json({ message: 'Kitap bulunamadı', status: 'error' });
    }

    // Kitap başkasındaysa ödünç verilemez
    if (book.borrowedBy !== null) {
        return res.status(400).json({ message: `"${book.title}" şu an ödünçte`, status: 'error' });
    }

    // Kullanıcı sınırı aşmasın
    const activeCount = books.filter(b => b.borrowedBy === userId).length;
    if (activeCount >= MAX_LOANS) {
        return res.status(400).json({ message: `Bir kullanıcı en fazla ${MAX_LOANS} kitap alabilir`, status: 'error' });
    }

    // Kitabı kullanıcıya ver ve kaydı oluştur
    book.borrowedBy = userId;

    const newLoan = {
        id: loans.length + 1,
        userId,
        bookId,
        borrowDate: today(),
        returnDate: null
    };
    loans.push(newLoan);

    res.status(201).json({ message: `${user.name}, "${book.title}" kitabını ödünç aldı`, status: 'success', data: newLoan });
});

// PATCH /loans/:id/return -> kitabı iade et
router.patch('/:id/return', (req, res) => {
    const loan = loans.find(l => l.id === Number(req.params.id));

    if (!loan) {
        return res.status(404).json({ message: 'Ödünç kaydı bulunamadı', status: 'error' });
    }

    if (loan.returnDate !== null) {
        return res.status(400).json({ message: 'Bu kitap zaten iade edilmiş', status: 'error' });
    }

    // Kaydı kapat ve kitabı rafa geri koy
    loan.returnDate = today();

    const book = books.find(b => b.id === loan.bookId);
    if (book) {
        book.borrowedBy = null;
    }

    res.json({ message: `"${book ? book.title : 'Kitap'}" iade edildi`, status: 'success', data: loan });
});

module.exports = { router, loans };
