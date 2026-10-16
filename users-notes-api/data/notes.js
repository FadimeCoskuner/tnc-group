// Örnek notlar; her not userId ile bir kullanıcıya bağlıdır
let notes = [
  { id: 1, userId: 1, title: "Express öğreniyorum", content: "Express, Node.js için sade bir web framework'üdür" },
  { id: 2, userId: 1, title: "Middleware", content: "Middleware fonksiyonları istek ile yanıt arasında çalışır" },
  { id: 3, userId: 1, title: "Router kullanımı", content: "express.Router ile route'ları ayrı dosyalara bölebiliriz" },
  { id: 4, userId: 1, title: "Sayfalama", content: "page ve limit parametreleri ile listeyi parçalara ayırırız" },
  { id: 5, userId: 1, title: "Alışveriş listesi", content: "Süt, ekmek, yumurta ve kahve" },
  { id: 6, userId: 1, title: "Kitap önerileri", content: "Bu ay okunacak kitapların listesi" },
  { id: 7, userId: 2, title: "Spor programı", content: "Pazartesi koşu, çarşamba yüzme, cuma fitness" },
  { id: 8, userId: 2, title: "Express notları", content: "req.params, req.query ve req.body farkları" },
  { id: 9, userId: 3, title: "Tatil planı", content: "Temmuz ayında Ege kıyılarına gidilecek" }
];

module.exports = notes;
