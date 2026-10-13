// Anasayfa

const layout = require('../components/layout');

const content = `
    <main class="home">
        <span class="eyebrow">NODE.JS · DERS 2</span>

        <h1>Sayaç &amp; <span class="accent">Hesap Makinesi</span></h1>

        <p class="lead">
            Node.js sunucusu ile çalışan iki küçük uygulama.
            Tüm işlemler sunucuda yapılır. Başlamak için birini seç.
        </p>

        <div class="tiles">
            <a class="tile" href="/counter">
                <span class="tile-number">01</span>
                <h3>Sayaç</h3>
                <p>Değeri artır, azalt ya da sıfırla. Sayfayı yenilesen bile değer sunucuda saklanır.</p>
                <span class="tile-link">Sayacı aç</span>
            </a>

            <a class="tile" href="/calculator">
                <span class="tile-number">02</span>
                <h3>Hesap Makinesi</h3>
                <p>İki sayı gir, işlemi seç. Toplama, çıkarma, çarpma ve bölme sunucuda hesaplanır.</p>
                <span class="tile-link">Hesap makinesini aç</span>
            </a>
        </div>
    </main>
`;

module.exports = layout('Anasayfa', content, '');
