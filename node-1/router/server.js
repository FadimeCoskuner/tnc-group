// URL'e göre Farklı Yanıtlar
// Sayfa içerikleri data.json dosyasından okunur

const http = require('http');
const fs = require('fs');

const server = http.createServer((req,res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // data.json dosyasını oku ve JSON'a çevir
    const data = JSON.parse(fs.readFileSync(__dirname + '/data.json', 'utf-8'));

    if(req.url === '/') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Anasayfaya Hoşgeldiniz",
            success: true,
            data: data.home
        }));
    } else if(req.url === '/about') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Hakkımda sayfasına Hoşgeldiniz",
            success: true,
            data: data.about
        }));
    } else if(req.url === '/experience') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "İş Deneyimi sayfasına Hoşgeldiniz",
            success: true,
            data: data.experience
        }));
    } else if(req.url === '/education') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Eğitim sayfasına Hoşgeldiniz",
            success: true,
            data: data.education
        }));
    } else if(req.url === '/skills') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Yetkinlikler sayfasına Hoşgeldiniz",
            success: true,
            data: data.skills
        }));
    } else if(req.url === '/projects') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Projeler sayfasına Hoşgeldiniz",
            success: true,
            data: data.projects
        }));
    } else if(req.url.startsWith('/projects/')) {
        // "/projects/3" adresini "/" işaretinden böl: ["", "projects", "3"]
        const id = req.url.split('/')[2];

        // id'si eşleşen projeyi bul
        const project = data.projects.find(p => p.id === Number(id));

        if(project) {
            res.writeHead(200);
            res.end(JSON.stringify({
                message: "Proje bulundu",
                success: true,
                data: project
            }));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: "Proje bulunamadı",
                success: false
            }));
        }
    } else if(req.url === '/courses') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Kurslar sayfasına Hoşgeldiniz",
            success: true,
            data: data.courses
        }));
    } else if(req.url === '/contact' && req.method === 'GET') {
        // GET: iletişim bilgilerini göster
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "İletişim sayfasına Hoşgeldiniz",
            success: true,
            data: data.contact
        }));
    } else if(req.url === '/contact' && req.method === 'POST') {
        // POST: gönderilen body'yi oku ve kişiye özel yanıt ver
        let body = '';

        // Body parça parça gelir, her parçayı body'ye ekle
        req.on('data', (chunk) => {
            body += chunk;
        });

        // Body'nin tamamı geldiğinde çalışır
        req.on('end', () => {
            try {
                const user = JSON.parse(body);

                res.writeHead(201);
                res.end(JSON.stringify({
                    message: `Merhaba ${user.name}, mesajın alındı. En kısa sürede ${user.email} adresine dönüş yapacağım.`,
                    success: true,
                    data: user
                }));
            } catch (err) {
                // Body geçerli bir JSON değilse
                res.writeHead(400);
                res.end(JSON.stringify({
                    message: "Gönderilen veri geçerli bir JSON değil",
                    success: false
                }));
            }
        });
    } else if(req.url === '/users') {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: "Kullanıcılar sayfasına Hoşgeldiniz",
            success: true,
            data: data.users
        }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: "Sayfa Bulunamadı",
            success: false
        }));
    }
});

server.listen(3000, () => {
    console.log('Sunucu http://localhost:3000 adresinde çalışıyor');
});
