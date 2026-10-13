// Örneklerde kullanacağımız öğrenci dizisi
const ogrenciler = [
    { id: 1, isim: "Ayşe", not: 92 },
    { id: 2, isim: "Mehmet", not: 45 },
    { id: 3, isim: "Zeynep", not: 78 },
    { id: 4, isim: "Ali", not: 60 },
    { id: 5, isim: "Fatma", not: 85 }
];

// Basit bir sayı dizisi
const sayilar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ==============================
// 1) FIND: koşula uyan İLK elemanı bulur
// ==============================

// id'si 3 olan öğrenciyi bul
const bulunanOgrenci = ogrenciler.find((ogrenci) => ogrenci.id === 3);
console.log("find -> id'si 3 olan öğrenci:", bulunanOgrenci);

// Notu 80'den büyük olan ilk öğrenciyi bul
const ilkBasarili = ogrenciler.find((ogrenci) => ogrenci.not > 80);
console.log("find -> notu 80'den büyük ilk öğrenci:", ilkBasarili.isim);

// Koşula uyan eleman yoksa undefined döner
const olmayanOgrenci = ogrenciler.find((ogrenci) => ogrenci.id === 99);
console.log("find -> id'si 99 olan öğrenci:", olmayanOgrenci);

// ==============================
// 2) FILTER: koşula uyan TÜM elemanları yeni bir dizi olarak döndürür
// ==============================

// Çift sayıları filtrele
const ciftSayilar = sayilar.filter((sayi) => sayi % 2 === 0);
console.log("filter -> çift sayılar:", ciftSayilar);

// Notu 60 ve üzeri olan (geçen) öğrencileri filtrele
const gecenler = ogrenciler.filter((ogrenci) => ogrenci.not >= 60);
console.log("filter -> geçen öğrenci sayısı:", gecenler.length);

// Koşula uyan eleman yoksa boş dizi [] döner
const yuzAlanlar = ogrenciler.filter((ogrenci) => ogrenci.not === 100);
console.log("filter -> 100 alanlar:", yuzAlanlar);

// ==============================
// 3) MAP: her elemanı dönüştürür, AYNI uzunlukta yeni bir dizi döndürür
// ==============================

// Her sayının 2 katını al
const ikiKati = sayilar.map((sayi) => sayi * 2);
console.log("map -> sayıların 2 katı:", ikiKati);

// Sadece öğrenci isimlerinden oluşan bir dizi oluştur
const isimler = ogrenciler.map((ogrenci) => ogrenci.isim);
console.log("map -> öğrenci isimleri:", isimler);

// Her öğrenci için bir cümle oluştur
const cumleler = ogrenciler.map((ogrenci) => `${ogrenci.isim} ${ogrenci.not} aldı`);
console.log("map -> cümleler:", cumleler);

// ==============================
// 4) BİRLİKTE KULLANIM: filter + map
// ==============================

// Önce geçenleri filtrele, sonra sadece isimlerini al
const gecenIsimler = ogrenciler
    .filter((ogrenci) => ogrenci.not >= 60)
    .map((ogrenci) => ogrenci.isim);
console.log("filter + map -> geçen öğrencilerin isimleri:", gecenIsimler);

// Not: find, filter ve map orijinal diziyi DEĞİŞTİRMEZ
console.log("Orijinal sayılar dizisi:", sayilar);
