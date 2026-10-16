const notes = require('../data/notes');
const { getFieldErrors } = require('./verify');

// PUT /notes/:id için çoklu doğrulama middleware'i
// Tüm kontrolleri yapar, ilk hatada durmaz; bütün hataları tek yanıtta döndürür
const updateVerify = (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Bulunan tüm hatalar bu dizide toplanır
  const errors = [];

  // Durum kodunu (404 mü 400 mü) belirlemek için
  let notFound = false;

  // 1) ID kontrolü: pozitif tam sayı olmalı
  const noteId = Number(id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    errors.push('ID pozitif bir sayı olmalı');
  } else {
    // 2) Kayıt kontrolü: ID geçerliyse not var mı bak
    const note = notes.find(n => n.id === noteId);

    if (!note) {
      notFound = true;
      errors.push(`${noteId} ID'li not bulunamadı`);
    } else {
      // Route'un notu tekrar aramasına gerek kalmasın
      req.note = note;
    }
  }

  // 3) Başlık ve içerik kuralları
  errors.push(...getFieldErrors(title, content));

  if (errors.length > 0) {
    // Yalnızca "kayıt bulunamadı" hatası varsa 404, diğer tüm durumlarda 400
    const onlyNotFound = notFound && errors.length === 1;
    const status = onlyNotFound ? 404 : 400;

    return res.status(status).json({
      success: false,
      errors
    });
  }

  // Hata yoksa route'a geç
  next();
};

module.exports = updateVerify;
