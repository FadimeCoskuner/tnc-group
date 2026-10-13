// Sayaç: değeri ve işlemleri tek bir nesnede (object) tutar
const sayac = {
    // Sayacın başlangıç değeri
    deger: 0,

    // Değeri 1 artırır
    arttir: function() {
        this.deger++;
        console.log(this.deger);
    },

    // Değeri 1 azaltır
    azalt: function() {
        this.deger--;
        console.log(this.deger);
    },

    // Değeri sıfırlar
    sifirla: function() {
        this.deger = 0;
        console.log(this.deger);
    }
}

// Fonksiyonları çağırarak sayacı kullanıyoruz
sayac.arttir();  // 1
sayac.arttir();  // 2
sayac.arttir();  // 3
sayac.azalt();   // 2
sayac.sifirla(); // 0
