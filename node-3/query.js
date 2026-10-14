const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // JSON verilerini almak için gerekli middleware

// Kullanıcı listesi
const users = [
    { id: 1, name: "Ayşe", city: "Konya" },
    { id: 2, name: "Mehmet", city: "Ankara" },
    { id: 3, name: "Zeynep", city: "İstanbul" }
];

// Kategori listesi: her kategorinin kendi ürünleri var
const categories = [
    {
        id: 1,
        name: "Elektronik",
        products: [
            { id: 1, name: "Laptop", price: 1500 },
            { id: 2, name: "Mouse", price: 20 }
        ]
    },
    {
        id: 2,
        name: "Giyim",
        products: [
            { id: 3, name: "Tişört", price: 15 },
            { id: 4, name: "Pantolon", price: 40 }
        ]
    },
    {
        id: 3,
        name: "Kitap",
        products: [
            { id: 5, name: "Roman", price: 10 }
        ]
    }
];

// Query parametresi: URL'de ? işaretinden sonra gelir
// Örnek: http://localhost:3000/users?id=2
// id verilmezse tüm kullanıcılar listelenir
app.get('/users', (req, res) => {
    const id = req.query.id;

    // id yoksa tüm listeyi döndür
    if (!id) {
        return res.json({
            message: 'Kullanıcılar listelendi',
            status: 'success',
            data: users
        });
    }

    // id varsa o kullanıcıyı bul (query'den gelen değer yazıdır, sayıya çeviriyoruz)
    const user = users.find(u => u.id === parseInt(id));

    if (user) {
        res.json({
            message: 'Kullanıcı bulundu',
            status: 'success',
            data: user
        });
    } else {
        res.status(404).json({
            message: 'Kullanıcı bulunamadı',
            status: 'error'
        });
    }
});

// Route parametresi: URL'nin bir parçasıdır, :id ile tanımlanır
// Örnek: http://localhost:3000/categorys/category/products/1
app.get('/categorys/category/products/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);

    const category = categories.find(c => c.id === categoryId);

    if (category) {
        res.json({
            message: 'Kategoriye ait ürünler listelendi',
            status: 'success',
            category: category.name,
            data: category.products
        });
    } else {
        res.status(404).json({
            message: 'Kategori bulunamadı',
            status: 'error'
        });
    }
});

// POST: yeni kullanıcı ekler
// Örnek: POST http://localhost:3000/users
// Body: { "name": "Ali", "city": "İzmir" }
app.post('/users', (req, res) => {
    const { name, city } = req.body;

    if (!name) {
        return res.status(400).json({
            message: 'İsim alanı zorunludur',
            status: 'error'
        });
    }

    // id otomatik verilir: son kullanıcının id'sinin 1 fazlası
    const newUser = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        name: name,
        city: city
    };

    users.push(newUser);

    // 201: yeni kayıt oluşturuldu
    res.status(201).json({
        message: 'Kullanıcı eklendi',
        status: 'success',
        data: newUser
    });
});

// POST: bir kategoriye yeni ürün ekler
// Örnek: POST http://localhost:3000/categorys/category/products/1
// Body: { "name": "Klavye", "price": 50 }
app.post('/categorys/category/products/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const { name, price } = req.body;

    const category = categories.find(c => c.id === categoryId);

    if (!category) {
        return res.status(404).json({
            message: 'Kategori bulunamadı',
            status: 'error'
        });
    }

    if (!name || price === undefined) {
        return res.status(400).json({
            message: 'İsim ve fiyat alanları zorunludur',
            status: 'error'
        });
    }

    // Tüm kategorilerdeki ürünlere bakıp en büyük id'nin 1 fazlasını ver
    const allProducts = categories.flatMap(c => c.products);
    const newId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) + 1 : 1;

    const newProduct = { id: newId, name: name, price: price };
    category.products.push(newProduct);

    res.status(201).json({
        message: 'Ürün kategoriye eklendi',
        status: 'success',
        category: category.name,
        data: newProduct
    });
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
