const express = require('express');
const app = express();
const port = 3000;

// JSON gövdelerini ayrıştıran Middleware
app.use(express.json()); // JSON verilerini almak için gerekli middleware


//Ana sayfa route'u
app.get('/', (req, res) => {
    res.json({ 
        message: 'Ana sayfa',
        status: 'Başarılı'
    });
});

// Hakkında sayfası route'u
app.get('/about', (req, res) => {
    res.json({ 
        message: 'Hakkında sayfası',
        status: 'Başarılı'
    });
}); 

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
