const http = require('http');

const server = http.createServer((req,res) => {
    // İstek geldiği zaman bu çalışır
    console.log("İstek Geldi: ", req.method, req.url);

    // JSON yanıt gönder
    res.writeHead(200, {
        'Content-Type' : 'application/json'
    });

    res.end(JSON.stringify({
        message: "Hello Word!",
        success: true
    }));
});

server.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor');
});