// ==============================
// 1) KOŞULLAR: if / else if / else
// ==============================

// Notu buradan değiştirerek farklı sonuçları deneyebilirsin
const not = 87;

// Harf notunu tutacak değişken
let harfNotu;

// Yukarıdan aşağıya kontrol edilir, ilk doğru olan koşul çalışır
if (not >= 90) {
    harfNotu = "AA";
} else if (not >= 85) {
    harfNotu = "BA";
} else if (not >= 80) {
    harfNotu = "BB";
} else if (not >= 75) {
    harfNotu = "CB";
} else if (not >= 70) {
    harfNotu = "CC";
} else if (not >= 65) {
    harfNotu = "DC";
} else if (not >= 60) {
    harfNotu = "DD";
} else if (not >= 50) {
    harfNotu = "FD";
} else {
    // Hiçbir koşul doğru değilse burası çalışır
    harfNotu = "FF";
}

console.log(`Notun: ${not} -> Harf notun: ${harfNotu}`);

// ==============================
// 2) FOR DÖNGÜSÜ: 1'den 5'e kadar
// ==============================

// i = 1 ile başla, i <= 5 olduğu sürece devam et, her turda i'yi 1 artır
for (let i = 1; i <= 5; i++) {
    console.log("Sayı:", i);
}

// ==============================
// 3) FOREACH DÖNGÜSÜ: dizi üzerinde
// ==============================

// Meyvelerden oluşan bir dizi
const meyveler = ["Elma", "Armut", "Muz", "Çilek", "Karpuz"];

// forEach dizideki her eleman için bir kez çalışır
// meyve: o anki eleman, index: elemanın sırası (0'dan başlar)
meyveler.forEach((meyve, index) => {
    console.log(`${index + 1}. meyve: ${meyve}`);
});
