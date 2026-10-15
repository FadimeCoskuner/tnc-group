// Not Defteri: web sürümü
// Notlar yine notes.json dosyasında tutulur (notes.js modülü ile).
// Terminal sürümüyle aynı dosyayı kullandığı için ikisinde de aynı notlar görünür.
//
// GET    /notes                  -> tüm notlar
// GET    /notes?search=kelime    -> arama
// GET    /notes?completed=true   -> sadece yapılanlar (false: yapılacaklar)
// POST   /notes                  -> yeni not      Body: { "title": "...", "content": "..." }
// PUT    /notes/:id              -> notu güncelle Body: { "title": "...", "content": "..." }
// PATCH  /notes/:id/complete     -> yapıldı / yapılmadı Body: { "completed": true }
// DELETE /notes/:id              -> notu sil

const express = require('express');
const { readNotes, addNote, updateNote, setCompleted, deleteNote } = require('./notes');

const app = express();
const port = 3006;

app.use(express.json()); // JSON verilerini almak için gerekli middleware

// public klasöründeki dosyaları (index.html, script.js) tarayıcıya sunar
app.use(express.static(__dirname + '/public'));

// Başlık ve içerik kontrolü: hata varsa mesaj, yoksa null döner
function validate(title, content) {
    if (!title || !title.trim() || !content || !content.trim()) {
        return 'Başlık ve içerik boş olamaz';
    }
    return null;
}

// GET /notes -> en yeni not en üstte
app.get('/notes', (req, res) => {
    const search = (req.query.search || '').toLowerCase();
    const { completed } = req.query;
    let notes = readNotes().reverse();

    // Duruma göre filtre: ?completed=true veya ?completed=false
    if (completed === 'true' || completed === 'false') {
        notes = notes.filter(n => n.completed === (completed === 'true'));
    }

    // Arama: başlıkta veya içerikte geçen notlar
    if (search) {
        notes = notes.filter(n =>
            n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search)
        );
    }

    res.json({ message: 'Notlar listelendi', status: 'success', count: notes.length, data: notes });
});

// POST /notes -> yeni not
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    const error = validate(title, content);
    if (error) {
        return res.status(400).json({ message: error, status: 'error' });
    }

    const note = addNote(title.trim(), content.trim());
    res.status(201).json({ message: 'Not eklendi', status: 'success', data: note });
});

// PUT /notes/:id -> notu güncelle
app.put('/notes/:id', (req, res) => {
    const { title, content } = req.body;

    const error = validate(title, content);
    if (error) {
        return res.status(400).json({ message: error, status: 'error' });
    }

    const note = updateNote(Number(req.params.id), title.trim(), content.trim());
    if (!note) {
        return res.status(404).json({ message: 'Not bulunamadı', status: 'error' });
    }

    res.json({ message: 'Not güncellendi', status: 'success', data: note });
});

// PATCH /notes/:id/complete -> yapıldı / yapılmadı olarak işaretle
// Body'de completed yoksa mevcut durum tersine çevrilir
app.patch('/notes/:id/complete', (req, res) => {
    const { completed } = req.body;

    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'completed true veya false olmalıdır', status: 'error' });
    }

    const note = setCompleted(Number(req.params.id), completed);
    if (!note) {
        return res.status(404).json({ message: 'Not bulunamadı', status: 'error' });
    }

    res.json({
        message: note.completed ? 'Not tamamlandı olarak işaretlendi' : 'Not yapılacaklara geri alındı',
        status: 'success',
        data: note
    });
});

// DELETE /notes/:id -> notu sil
app.delete('/notes/:id', (req, res) => {
    const deleted = deleteNote(Number(req.params.id));
    if (!deleted) {
        return res.status(404).json({ message: 'Not bulunamadı', status: 'error' });
    }

    res.json({ message: 'Not silindi', status: 'success', data: deleted });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Not defteri http://localhost:${port} adresinde çalışıyor.`);
});
