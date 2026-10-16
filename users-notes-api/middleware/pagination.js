const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

// ?page ve ?limit sorgu parametrelerini doğrulayan middleware
// Geçerliyse req.pagination = { page, limit } olarak route'a aktarır
const pagination = (req, res, next) => {
  const { page, limit } = req.query;

  const errors = [];

  // Parametre verilmezse varsayılan değer kullanılır
  const pageNumber = page === undefined ? DEFAULT_PAGE : Number(page);
  const limitNumber = limit === undefined ? DEFAULT_LIMIT : Number(limit);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    errors.push('page pozitif bir tam sayı olmalı');
  }

  if (!Number.isInteger(limitNumber) || limitNumber < 1) {
    errors.push('limit pozitif bir tam sayı olmalı');
  } else if (limitNumber > MAX_LIMIT) {
    errors.push(`limit en fazla ${MAX_LIMIT} olabilir`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  req.pagination = { page: pageNumber, limit: limitNumber };
  next();
};

module.exports = pagination;
