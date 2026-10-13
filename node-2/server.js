// Sayaç ve Hesap Makinesi (basit sürüm)
//
// Sayfalar (HTML döner):
// GET  /                       -> anasayfa
// GET  /counter                -> sayaç sayfası
// GET  /calculator             -> hesap makinesi sayfası
//
// API (JSON döner):
// GET  /api/counter            -> sayacın değerini döner
// POST /api/counter/increase   -> sayacı 1 artırır
// POST /api/counter/decrease   -> sayacı 1 azaltır
// POST /api/counter/reset      -> sayacı sıfırlar
// POST /api/calculate          -> body: { "a": 10, "b": 5, "operation": "+" }

const http = require('http');

// Sayacın değeri burada tutulur (sunucu kapanınca sıfırlanır)
let counter = 0;

// ---------- Anasayfa ----------
const homePage = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Anasayfa</title>
</head>
<body>
    <h1>Anasayfa</h1>
    <a href="/counter">Sayaç</a>
    <br>
    <a href="/calculator">Hesap Makinesi</a>
</body>
</html>
`;

// ---------- Sayaç sayfası ----------
const counterPage = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Sayaç</title>
</head>
<body>
    <h1>Sayaç</h1>
    <p>Değer: <span id="counter">0</span></p>

    <button onclick="changeCounter('decrease')">-1</button>
    <button onclick="changeCounter('reset')">Sıfırla</button>
    <button onclick="changeCounter('increase')">+1</button>

    <br><br>
    <a href="/">Anasayfa</a>

    <script>
        // Sayfa açılınca sayacın değerini sunucudan al
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
    </script>
</body>
</html>
`;

// ---------- Hesap makinesi sayfası ----------
const calculatorPage = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Hesap Makinesi</title>
</head>
<body>
    <h1>Hesap Makinesi</h1>

    <input type="number" id="a" placeholder="1. sayı">
    <input type="number" id="b" placeholder="2. sayı">
    <br><br>

    <button onclick="calculate('+')">+</button>
    <button onclick="calculate('-')">-</button>
    <button onclick="calculate('*')">*</button>
    <button onclick="calculate('/')">/</button>

    <p>Sonuç: <span id="result"></span></p>

    <a href="/">Anasayfa</a>

    <script>
        // İşlem butonuna basınca sayıları body içinde sunucuya gönder
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
                    document.getElementById('result').textContent = data.message;
                });
        }
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    console.log("İstek Geldi:", req.method, req.url);

    // ---------- Sayfalar ----------
    if(req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(homePage);

    } else if(req.url === '/counter' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(counterPage);

    } else if(req.url === '/calculator' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(calculatorPage);

    // ---------- Sayaç API ----------
    } else if(req.url === '/api/counter' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            message: "Sayacın değeri",
            success: true,
            counter: counter
        }));

    } else if(req.url === '/api/counter/increase' && req.method === 'POST') {
        counter = counter + 1;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            message: "Sayaç artırıldı",
            success: true,
            counter: counter
        }));

    } else if(req.url === '/api/counter/decrease' && req.method === 'POST') {
        counter = counter - 1;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            message: "Sayaç azaltıldı",
            success: true,
            counter: counter
        }));

    } else if(req.url === '/api/counter/reset' && req.method === 'POST') {
        counter = 0;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            message: "Sayaç sıfırlandı",
            success: true,
            counter: counter
        }));

    // ---------- Hesap makinesi API ----------
    } else if(req.url === '/api/calculate' && req.method === 'POST') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');

            try {
                const data = JSON.parse(body);
                const a = data.a;
                const b = data.b;
                const operation = data.operation;
                let result;

                if(operation === '+') {
                    result = a + b;
                } else if(operation === '-') {
                    result = a - b;
                } else if(operation === '*') {
                    result = a * b;
                } else if(operation === '/') {
                    if(b === 0) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            message: "Sıfıra bölme yapılamaz",
                            success: false
                        }));
                        return;
                    }
                    result = a / b;
                } else {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        message: "Geçersiz işlem",
                        success: false
                    }));
                    return;
                }

                res.writeHead(200);
                res.end(JSON.stringify({
                    message: `${a} ${operation} ${b} = ${result}`,
                    success: true,
                    result: result
                }));
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    message: "Gönderilen veri geçerli bir JSON değil",
                    success: false
                }));
            }
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            message: "Sayfa Bulunamadı",
            success: false
        }));
    }
});

server.listen(3000, () => {
    console.log('Sunucu http://localhost:3000 adresinde çalışıyor');
});
