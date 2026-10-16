const users = require('../data/users');

// Değerin pozitif bir tam sayı olup olmadığını kontrol eder (ID kontrolleri için)
const isValidId = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
};

// Not başlığı ve içerik kurallarını kontrol eder, bulunan hataları döndürür
const getNoteFieldErrors = (title, content) => {
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

  return errors;
};

// Not ekleme (POST /notes) doğrulaması: başlık, içerik ve userId
const noteVerify = (req, res, next) => {
  const { title, content, userId } = req.body;

  const errors = getNoteFieldErrors(title, content);

  // userId kontrolü: zorunlu, sayı olmalı ve böyle bir kullanıcı bulunmalı
  if (userId === undefined) {
    errors.push('userId zorunludur');
  } else if (!isValidId(userId)) {
    errors.push('userId pozitif bir sayı olmalı');
  } else if (!users.some(u => u.id === Number(userId))) {
    errors.push(`${userId} ID'li kullanıcı bulunamadı`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// Kullanıcı ekleme (POST /users) doğrulaması: ad ve e-posta
const userVerify = (req, res, next) => {
  const { name, email } = req.body;

  const errors = [];

  // Ad kontrolü: zorunlu, en az 2 karakter
  if (!name) {
    errors.push('Ad zorunludur');
  } else if (name.length < 2) {
    errors.push('Ad en az 2 karakter olmalı');
  }

  // E-posta kontrolü: zorunlu, basit biçim kontrolü ve benzersiz olmalı
  if (!email) {
    errors.push('E-posta zorunludur');
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Geçerli bir e-posta adresi girin');
  } else if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    errors.push('Bu e-posta adresi zaten kayıtlı');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = { isValidId, getNoteFieldErrors, noteVerify, userVerify };
