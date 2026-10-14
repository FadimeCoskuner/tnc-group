const express = require('express');
const app = express();
const port = 8000;

app.use(express.json());

app.get('/users/:id', (req, res, next) => {
    const { id } = Number(req.params);
    if (isNaN(id)) {
        return next(new Error('Geçersiz kullanıcı IDsi.'));
    }
    res.json({ message: `Kullanıcı ${id} bulundu.`, status: 'success' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Geçersiz istek.', status: 'error' });
});

app.use((err, req, res, next) => {
    console.error('Hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası.', status: 'error' });
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
