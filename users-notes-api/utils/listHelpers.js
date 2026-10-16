// Türkçe harfleri doğru küçültür ("İ" -> "i", "I" -> "ı")
const toLower = (text) => String(text).toLocaleLowerCase('tr');

// Verilen alanlardan herhangi birinde arama kelimesi geçen kayıtları döndürür
// Örnek: filterBySearch(notes, 'express', ['title', 'content'])
const filterBySearch = (list, search, fields) => {
  if (!search) {
    return list;
  }

  const keyword = toLower(search);

  return list.filter(item =>
    fields.some(field => toLower(item[field]).includes(keyword))
  );
};

// Listeyi sayfalara böler ve sayfa bilgileriyle birlikte döndürür
const paginate = (list, page, limit) => {
  const total = list.length;
  const totalPages = Math.ceil(total / limit);

  // Örnek: page=2, limit=5 -> 5. indeksten 10. indekse kadar (10 hariç)
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data
  };
};

module.exports = { filterBySearch, paginate };
