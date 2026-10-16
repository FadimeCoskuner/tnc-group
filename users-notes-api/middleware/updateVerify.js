const notes = require('../data/notes');
const { isValidId, getNoteFieldErrors } = require('./verify');

// PUT /notes/:id için çoklu doğrulama middleware'i (Alıştırma 2)
// Tüm kontrolleri yapar, ilk hatada durmaz; bütün hataları tek yanıtta döndürür
const updateVerify = (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const errors = [];

  // Durum kodunu (404 mü 400 mü) belirlemek için
  let notFound = false;

  // 1) ID kontrolü: pozitif tam sayı olmalı
  if (!isValidId(id)) {
    errors.push('ID pozitif bir sayı olmalı');
  } else {
    // 2) Kayıt kontrolü: ID geçerliyse not var mı bak
    const note = notes.find(n => n.id === Number(id));

    if (!note) {
      notFound = true;
      errors.push(`${id} ID'li not bulunamadı`);
    } else {
      // Route'un notu tekrar aramasına gerek kalmasın
      req.note = note;
    }
  }

  // 3) Başlık ve içerik kuralları
  errors.push(...getNoteFieldErrors(title, content));

  if (errors.length > 0) {
    // Yalnızca "kayıt bulunamadı" hatası varsa 404, diğer tüm durumlarda 400
    const status = notFound && errors.length === 1 ? 404 : 400;

    return res.status(status).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = updateVerify;
