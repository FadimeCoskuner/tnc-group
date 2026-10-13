// Hesap makinesi sayfası

const layout = require('../components/layout');

const content = `
    <div class="card">
        <h2>Hesap Makinesi</h2>

        <div class="screen">
            <div class="small" id="operation"></div>
            <div class="big" id="result">0</div>
        </div>

        <input type="number" id="a" placeholder="1. sayı">
        <input type="number" id="b" placeholder="2. sayı">

        <div class="buttons">
            <button class="btn" onclick="calculate('+')">+</button>
            <button class="btn" onclick="calculate('-')">−</button>
            <button class="btn" onclick="calculate('*')">×</button>
            <button class="btn" onclick="calculate('/')">÷</button>
        </div>

        <a class="back" href="/">← Anasayfa</a>
    </div>
`;

const script = `
    // İşlem tuşuna basınca sayıları ve işlemi body içinde sunucuya gönder
    function calculate(operation) {
        fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                a: Number(document.getElementById('a').value),
                b: Number(document.getElementById('b').value),
                operation: operation
            })
        })
            .then(res => res.json())
            .then(data => {
                const result = document.getElementById('result');

                if(data.success) {
                    // Üst satıra işlemi, alt satıra sonucu yaz
                    document.getElementById('operation').textContent = data.message.split('=')[0] + '=';
                    result.textContent = data.result;
                    result.className = 'big';
                } else {
                    // Hata varsa (ör. sıfıra bölme) kırmızı göster
                    document.getElementById('operation').textContent = '';
                    result.textContent = data.message;
                    result.className = 'big error';
                }
            });
    }
`;

module.exports = layout('Hesap Makinesi', content, script);
