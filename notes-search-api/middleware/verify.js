// Not ekleme/güncelleme isteklerinde başlık ve içeriği doğrulayan middleware
const notesVerify = (req, res, next) => {
  const { title, content } = req.body;

  // Bulunan tüm hatalar bu dizide toplanır
  const errors = [];

  // Başlık kontrolü: zorunlu, 3-100 karakter arası
  if (!title) {
    errors.push('Başlık zorunludur');
  } else if (title.length < 3) {
    errors.push('Başlık en az 3 karakter olmalı');
  } else if (title.length > 100) {
    errors.push('Başlık en fazla 100 karakter olmalı');
  }

  // İçerik kontrolü: zorunlu, en az 10 karakter
  if (!content) {
    errors.push('İçerik zorunludur');
  } else if (content.length < 10) {
    errors.push('İçerik en az 10 karakter olmalı');
  }

  // Hata varsa isteği durdur ve 400 döndür
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors // [ 'Başlık zorunludur', ... ]
    });
  }

  // Hata yoksa bir sonraki adıma (route) geç
  next();
};

module.exports = notesVerify;
