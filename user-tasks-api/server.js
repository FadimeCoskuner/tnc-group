// İki Modüllü API: Kullanıcılar ve Görevler
//
// Kullanıcılar (routes/users.js)
// GET    /users              -> tüm kullanıcılar
// GET    /users/:id          -> tek kullanıcı
// GET    /users/:id/tasks    -> o kullanıcının görevleri
// POST   /users              -> yeni kullanıcı
// PUT    /users/:id          -> kullanıcıyı güncelle
// DELETE /users/:id          -> kullanıcıyı ve görevlerini sil
//
// Görevler (routes/tasks.js)
// GET    /tasks              -> tüm görevler (?completed=true ile filtre)
// GET    /tasks/:id          -> tek görev
// POST   /tasks              -> yeni görev (userId zorunlu)
// PATCH  /tasks/:id          -> görevi güncelle (ör. tamamlandı yap)
// DELETE /tasks/:id          -> görevi sil

const express = require('express');
const app = express();
const port = 3004;

// Modülleri (router'ları) içeri alıyoruz
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');

app.use(express.json()); // JSON verilerini almak için gerekli middleware

// Her modülü kendi adresine bağlıyoruz
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);

// Hiçbir route eşleşmezse
app.use((req, res) => {
    res.status(404).json({ message: 'Geçersiz istek', status: 'error' });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
