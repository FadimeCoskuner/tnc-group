// Sayaç sayfası

const layout = require('../components/layout');

const content = `
    <div class="card">
        <h2>Sayaç</h2>

        <div class="screen">
            <div class="small">Sayacın değeri</div>
            <div class="big" id="counter">0</div>
        </div>

        <div class="buttons three">
            <button class="btn" onclick="changeCounter('decrease')">−1</button>
            <button class="btn gray" onclick="changeCounter('reset')">Sıfırla</button>
            <button class="btn" onclick="changeCounter('increase')">+1</button>
        </div>

        <a class="back" href="/">← Anasayfa</a>
    </div>
`;

const script = `
    // Sayfa açılınca sayacın güncel değerini sunucudan al
    fetch('/api/counter')
        .then(res => res.json())
        .then(data => {
            document.getElementById('counter').textContent = data.counter;
        });

    // Butona basınca sunucuya POST isteği gönder
    function changeCounter(action) {
        fetch('/api/counter/' + action, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                document.getElementById('counter').textContent = data.counter;
            });
    }
`;

module.exports = layout('Sayaç', content, script);
