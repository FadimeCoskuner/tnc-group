// Sayaç ve Hesap Makinesi
//
// Sayfalar (HTML döner) -> pages/ klasöründe:
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

// Sayfaları kendi dosyalarından çağır
const homePage = require('./pages/home');
const counterPage = require('./pages/counter');
const calculatorPage = require('./pages/calculator');

// Sayacın değeri burada tutulur (sunucu kapanınca sıfırlanır)
let counter = 0;

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
                const { a, b, operation } = JSON.parse(body);
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
                        message: "Geçersiz işlem. Kullanılabilir: + - * /",
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
