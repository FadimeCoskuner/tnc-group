const express = require('express');
const app = express();
const notesRouter = require('./routes/notes');
const logger = require('./middleware/logger');
const port = 3000;

// Gelen JSON gövdesini okur ve her isteği loglar
app.use(express.json());
app.use(logger);

// /notes ile başlayan istekler notes router'ına gider
app.use('/notes', notesRouter);

// Hiçbir route eşleşmezse 404 döndür
app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint bulunamadı",
        url: req.url
    });
});

app.listen(port, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});
