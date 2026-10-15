// Ürün Kataloğu API'si
//
// GET    /products                         -> tüm ürünler
// GET    /products?category=electronics    -> kategoriye göre filtreleme
// GET    /products?sort=price              -> fiyata göre artan sıralama
// GET    /products?sort=price&order=desc   -> fiyata göre azalan sıralama
// GET    /products/:id                     -> tek ürün
// POST   /products                         -> yeni ürün ekle
// PUT    /products/:id                     -> ürünü tamamen güncelle
// PATCH  /products/:id                     -> ürünün bazı alanlarını güncelle
// DELETE /products/:id                     -> ürünü sil

const express = require('express');
const app = express();
const port = 3003;

app.use(express.json()); // JSON verilerini almak için gerekli middleware

// Ürün listesi (sunucu kapanınca başa döner)
let products = [
    { id: 1, name: "Laptop", price: 25000, stock: 10, category: "electronics" },
    { id: 2, name: "Mouse", price: 350, stock: 50, category: "electronics" },
    { id: 3, name: "Kulaklık", price: 1200, stock: 0, category: "electronics" },
    { id: 4, name: "Tişört", price: 250, stock: 100, category: "clothing" },
    { id: 5, name: "Mont", price: 1800, stock: 15, category: "clothing" },
    { id: 6, name: "Roman", price: 120, stock: 40, category: "books" }
];

// Sıralanabilecek alanlar
const sortableFields = ['price', 'stock', 'name'];

// ==============================
// Doğrulama fonksiyonu
// ==============================
// Hata varsa hata mesajını, yoksa null döndürür
// isPartial = true ise (PATCH) sadece gönderilen alanlar kontrol edilir
function validateProduct(data, isPartial = false) {
    const { name, price, stock, category } = data;

    // POST ve PUT'ta tüm alanlar zorunlu
    if (!isPartial) {
        if (name === undefined || price === undefined || stock === undefined || category === undefined) {
            return 'name, price, stock ve category alanları zorunludur';
        }
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        return 'name boş olamaz';
    }

    // Fiyat sayı olmalı ve 0'dan büyük olmalı
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        return 'price 0\'dan büyük bir sayı olmalıdır';
    }

    // Stok tam sayı olmalı ve 0 veya daha büyük olmalı
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
        return 'stock 0 veya daha büyük bir tam sayı olmalıdır';
    }

    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
        return 'category boş olamaz';
    }

    return null; // Hata yok
}

// ---------- GET: tüm ürünler + filtreleme + sıralama ----------
app.get('/products', (req, res) => {
    const { category, sort, order } = req.query;

    // Orijinal diziyi bozmamak için kopyasıyla çalışıyoruz
    let result = [...products];

    // 1) Kategori filtresi: /products?category=electronics
    if (category) {
        result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 2) Sıralama: /products?sort=price
    if (sort) {
        if (!sortableFields.includes(sort)) {
            return res.status(400).json({
                message: `sort sadece şunlardan biri olabilir: ${sortableFields.join(', ')}`,
                status: 'error'
            });
        }

        // order=desc ise azalan, değilse artan sıralama
        const direction = order === 'desc' ? -1 : 1;

        result.sort((a, b) => {
            // İsimler yazı olduğu için localeCompare ile karşılaştırılır
            if (sort === 'name') {
                return a.name.localeCompare(b.name, 'tr') * direction;
            }
            return (a[sort] - b[sort]) * direction;
        });
    }

    res.json({ message: 'Ürünler listelendi', status: 'success', count: result.length, data: result });
});

// ---------- GET: tek ürün ----------
app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı', status: 'error' });
    }

    res.json({ message: 'Ürün bulundu', status: 'success', data: product });
});

// ---------- POST: yeni ürün ----------
// Body: { "name": "Klavye", "price": 750, "stock": 20, "category": "electronics" }
app.post('/products', (req, res) => {
    const error = validateProduct(req.body);
    if (error) {
        return res.status(400).json({ message: error, status: 'error' });
    }

    const { name, price, stock, category } = req.body;

    // id otomatik verilir: en büyük id'nin 1 fazlası
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, name, price, stock, category };

    products.push(newProduct);

    res.status(201).json({ message: 'Ürün eklendi', status: 'success', data: newProduct });
});

// ---------- PUT: ürünü tamamen güncelle ----------
app.put('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Ürün bulunamadı', status: 'error' });
    }

    const error = validateProduct(req.body);
    if (error) {
        return res.status(400).json({ message: error, status: 'error' });
    }

    const { name, price, stock, category } = req.body;
    products[index] = { id, name, price, stock, category };

    res.json({ message: 'Ürün güncellendi', status: 'success', data: products[index] });
});

// ---------- PATCH: bazı alanları güncelle ----------
app.patch('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı', status: 'error' });
    }

    // true: sadece gönderilen alanlar kontrol edilir
    const error = validateProduct(req.body, true);
    if (error) {
        return res.status(400).json({ message: error, status: 'error' });
    }

    const { name, price, stock, category } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;

    res.json({ message: 'Ürün kısmen güncellendi', status: 'success', data: product });
});

// ---------- DELETE: ürünü sil ----------
app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Ürün bulunamadı', status: 'error' });
    }

    const deletedProduct = products.splice(index, 1)[0];

    res.json({ message: 'Ürün silindi', status: 'success', data: deletedProduct });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
