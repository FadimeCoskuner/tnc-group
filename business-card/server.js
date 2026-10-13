// Kişisel Kartvizit

// Kartvizit bilgileri tek bir nesnede tutulur
// Yaş ve hobileri kendi bilgilerinle değiştir
const kartvizit = {
    adSoyad: "Fadime Mutlu",
    meslek: "Bilgisayar Mühendisi",
    yas: 25,
    sehir: "Konya",
    hobiler: ["Kitap Okumak", "Film İzlemek", "Seyahat Etmek"]
};

const genislik = 40;

// Bir satırı kutunun içine, sağdan boşlukla doldurarak yazar
function satir(metin) {
    return "│ " + metin.padEnd(genislik) + " │";
}

// Kartı ekrana yazdırır
function kartviziYazdir(kisi) {
    const cizgi = "─".repeat(genislik + 2);

    console.log("┌" + cizgi + "┐");
    console.log(satir(kisi.adSoyad.toLocaleUpperCase("tr-TR")));
    console.log(satir(kisi.meslek));
    console.log("├" + cizgi + "┤");
    console.log(satir("Yaş     : " + kisi.yas));
    console.log(satir("Şehir   : " + kisi.sehir));
    console.log(satir("Hobiler :"));

    // Her hobiyi ayrı satırda, başında nokta ile yaz
    kisi.hobiler.forEach((hobi) => {
        console.log(satir("  • " + hobi));
    });

    console.log("└" + cizgi + "┘");
}

kartviziYazdir(kartvizit);
