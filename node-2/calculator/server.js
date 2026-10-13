// Detaylı hesap makinesi

// Toplama
function topla(a, b) {
    return a + b;
}

// Çıkarma
function cikar(a, b) {
    return a - b;
}

// Çarpma
function carp(a, b) {
    return a * b;
}

// Bölme
function bol(a, b) {
    return a / b;
}

// Üs alma (** operatörü ile)
function us(a, b) {
    return a ** b;
}

// Üs alma (Math.pow ile) - sonuç us() ile aynıdır
function us2(taban, us) {
    return Math.pow(taban, us);
}

// Karekök alma
function karekok(a) {
    return Math.sqrt(a);
}

// Fonksiyonları çağırıp sonuçları yazdırıyoruz
console.log(topla(10, 5));  // 15
console.log(cikar(10, 5));  // 5
console.log(carp(10, 5));   // 50
console.log(bol(10, 5));    // 2
console.log(us(2, 3));      // 8
console.log(us2(2, 3));     // 8
console.log(karekok(25));   // 5

// ==============================
// Aynı hesap makinesi: switch-case ile
// ==============================

// Tek bir fonksiyon, yapılacak işlemi "islem" parametresi ile alır
function hesapla(a, b, islem) {
    switch (islem) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return a / b;
        case "**":
            return a ** b;
        case "karekok":
            // Karekök tek sayı ile çalışır, b kullanılmaz
            return Math.sqrt(a);
        default:
            // Hiçbir case eşleşmezse burası çalışır
            return "Geçersiz işlem";
    }
}

console.log(hesapla(10, 5, "+"));       // 15
console.log(hesapla(10, 5, "-"));       // 5
console.log(hesapla(10, 5, "*"));       // 50
console.log(hesapla(10, 5, "/"));       // 2
console.log(hesapla(2, 3, "**"));       // 8
console.log(hesapla(25, 0, "karekok")); // 5
console.log(hesapla(10, 5, "%"));       // Geçersiz işlem
