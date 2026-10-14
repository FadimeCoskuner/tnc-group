const express = require('express');
const app = express();
const port = 3000;

// JSON gövdelerini ayrıştıran Middleware
app.use(express.json()); // JSON verilerini almak için gerekli middleware


let products = [
    { id: 1, name: "Laptop", price: 1500 },
    { id: 2, name: "Mouse", price: 20 },
    { id: 3, name: "Keyboard", price: 50 }
];

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

app.post('/product', (req, res) => {
    const newProduct = req.body;
    products.push(newProduct);
    res.status(200).json({ message: "Product added successfully", status: 'success' });
});

app.put('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        res.json({ message: "Product updated successfully", status: 'success' });
    } else {
        res.status(404).json({ message: "Product not found", status: 'error' });
    }
});

app.delete('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);          
    if (index !== -1) {
        products.splice(index, 1);
        res.json({ message: "Product deleted successfully", status: 'success' });
    } else {
        res.status(404).json({ message: "Product not found", status: 'error' });
    }
}); 

app.patch('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedFields = req.body;
    const product = products.find(p => p.id === productId);         

    if (product) {
        Object.assign(product, updatedFields);
        res.json({ message: "Product updated successfully", status: 'success' });
    } else {
        res.status(404).json({ message: "Product not found", status: 'error' });
    }       
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
