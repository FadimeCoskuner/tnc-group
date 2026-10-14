const express = require('express');
const app = express();
const port = 3001;

// express.json(): body'deki JSON'ı otomatik parse eder
app.use(express.json());

// ── 1. Loglama Middleware ──────────────────────
// Her isteği saat, method ve url ile konsola yazar
const logger = (req, res, next) => {
    const time = new Date().toLocaleTimeString('tr-TR');
    console.log(`[${time}] ${req.method} ${req.url}`);
    next(); // Bir sonraki adıma (route'a) geç
};

// app.use() ile eklendiği için TÜM isteklerde çalışır
app.use(logger);

// ── 2. Basit Auth Middleware ───────────────────
// Authorization header'ındaki token'ı kontrol eder
const authCheck = (req, res, next) => {
    const token = req.headers['authorization'];

    // Token hiç gönderilmemişse: 401
    if (!token) {
        return res.status(401).json({ error: 'Token gerekli' });
    }

    // Token yanlışsa: 403
    if (token !== 'gizli-token-123') {
        return res.status(403).json({ error: 'Geçersiz token' });
    }

    next(); // Token doğruysa devam et
};

// Herkese açık route: sadece logger çalışır
app.get('/', (req, res) => {
    res.json({ message: 'Ana sayfa, herkes görebilir' });
});

// Sadece bu route korunsun: authCheck ikinci parametre olarak verildi
app.get('/profile', authCheck, (req, res) => {
    res.json({ user: 'Ahmet', role: 'admin' });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
