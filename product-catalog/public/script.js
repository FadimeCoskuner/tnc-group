// API adresi: sayfa aynı sunucudan açıldığı için sadece yol yazmak yeterli
const API_URL = '/products';

// Sayfadaki elemanlar
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const idInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const categoryInput = document.getElementById('category');
const categoryOptions = document.getElementById('category-options');
const categoryTabs = document.getElementById('category-tabs');
const sortSelect = document.getElementById('sort');
const productList = document.getElementById('product-list');
const countText = document.getElementById('count');
const messageBox = document.getElementById('message');

// Seçili kategori ("" = tümü)
let selectedCategory = '';

// Kategori adlarının Türkçe karşılıkları (listede olmayan olduğu gibi gösterilir)
const categoryLabels = {
    electronics: 'Elektronik',
    clothing: 'Giyim',
    books: 'Kitap'
};

// Kategoriye göre ikon
const categoryIcons = {
    electronics: '💻',
    clothing: '👕',
    books: '📚'
};

function getLabel(category) {
    return categoryLabels[category] || category;
}

function getIcon(category) {
    return categoryIcons[category] || '📦';
}

// Fiyatı "25.000,00 ₺" şeklinde gösterir
function formatPrice(price) {
    return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
}

// Stok durumuna göre renkli etiket döndürür
function stockBadge(stock) {
    if (stock === 0) {
        return '<span class="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">Tükendi</span>';
    }
    if (stock < 10) {
        return `<span class="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Son ${stock} adet</span>`;
    }
    return `<span class="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Stokta: ${stock}</span>`;
}

// ==============================
// Ürünleri getir ve listele (GET)
// ==============================
async function loadProducts() {
    // URLSearchParams: ?category=...&sort=...&order=... kısmını oluşturur
    const params = new URLSearchParams();

    if (selectedCategory) {
        params.append('category', selectedCategory);
    }

    // Seçenek "price-desc" gibi: tireden ayırıp sort ve order'a böleriz
    if (sortSelect.value) {
        const [sort, order] = sortSelect.value.split('-');
        params.append('sort', sort);
        params.append('order', order);
    }

    const query = params.toString();
    const response = await fetch(query ? `${API_URL}?${query}` : API_URL);
    const result = await response.json();

    renderProducts(result.data);
}

// Ürünleri kart olarak ekrana çizer
function renderProducts(products) {
    countText.textContent = `${products.length} ürün`;

    if (products.length === 0) {
        productList.innerHTML = '<p class="col-span-full text-center text-gray-500 py-16">Bu kategoride ürün yok.</p>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col ${product.stock === 0 ? 'opacity-70' : ''}">
            <!-- Ürün görseli yerine kategori ikonu -->
            <div class="h-32 bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center text-5xl">
                ${getIcon(product.category)}
            </div>

            <div class="p-4 flex flex-col flex-1">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs uppercase tracking-wide text-gray-400">${getLabel(product.category)}</span>
                    ${stockBadge(product.stock)}
                </div>

                <h3 class="font-semibold text-lg">${product.name}</h3>
                <p class="text-2xl font-bold text-emerald-700 mt-1 mb-4">${formatPrice(product.price)}</p>

                <div class="mt-auto flex gap-2">
                    <button onclick="startEdit(${product.id})"
                        class="flex-1 text-sm py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        Düzenle
                    </button>
                    <button onclick="deleteProduct(${product.id})"
                        class="flex-1 text-sm py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                        Sil
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Kategori butonlarını ve form önerilerini mevcut kategorilerle doldurur
async function loadCategories() {
    const response = await fetch(API_URL);
    const result = await response.json();

    // Set ile tekrar eden kategorileri çıkar
    const categories = [...new Set(result.data.map(p => p.category))];

    // Seçili kategori silindiyse "Tümü"ne dön
    if (selectedCategory && !categories.includes(selectedCategory)) {
        selectedCategory = '';
    }

    // "Tümü" butonu + her kategori için bir buton
    const tabs = [{ value: '', text: 'Tümü' }, ...categories.map(c => ({ value: c, text: getLabel(c) }))];

    categoryTabs.innerHTML = tabs.map(tab => {
        const active = tab.value === selectedCategory;
        return `
            <button onclick="selectCategory('${tab.value}')"
                class="text-sm px-4 py-2 rounded-full border ${active
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-500'}">
                ${tab.text}
            </button>`;
    }).join('');

    // Formdaki kategori alanı için öneriler
    categoryOptions.innerHTML = categories.map(c => `<option value="${c}">`).join('');
}

// Kategori butonuna basılınca
async function selectCategory(category) {
    selectedCategory = category;
    await loadCategories(); // aktif butonun rengi güncellensin
    await loadProducts();
}

// ==============================
// Form gönderilince: ekle (POST) veya güncelle (PUT)
// ==============================
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Sayfanın yenilenmesini engeller

    // Boş alanlar undefined gider, böylece sunucu "zorunlu alan" hatası verir
    const product = {
        name: nameInput.value.trim() || undefined,
        price: priceInput.value === '' ? undefined : Number(priceInput.value),
        stock: stockInput.value === '' ? undefined : Number(stockInput.value),
        category: categoryInput.value.trim().toLowerCase() || undefined
    };

    const id = idInput.value;

    // id varsa düzenleme modundayız: PUT, yoksa yeni ürün: POST
    const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });

    const result = await response.json();

    // Hata varsa (ör. fiyat 0) sunucunun mesajı kırmızı gösterilir
    showMessage(result.message, response.ok);

    if (response.ok) {
        resetForm();
        await loadCategories();
        await loadProducts();
    }
});

// ==============================
// Düzenle butonuna basınca formu doldur
// ==============================
async function startEdit(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();
    const product = result.data;

    idInput.value = product.id;
    nameInput.value = product.name;
    priceInput.value = product.price;
    stockInput.value = product.stock;
    categoryInput.value = product.category;

    formTitle.textContent = 'Ürünü Düzenle';
    submitBtn.textContent = 'Kaydet';
    cancelBtn.classList.remove('hidden');
    nameInput.focus();
}

// ==============================
// Sil butonuna basınca (DELETE)
// ==============================
async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğine emin misin?')) {
        return;
    }

    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const result = await response.json();
    showMessage(result.message, response.ok);

    await loadCategories();
    await loadProducts();
}

// Formu ekleme moduna geri döndürür
function resetForm() {
    form.reset();
    idInput.value = '';
    formTitle.textContent = 'Yeni Ürün';
    submitBtn.textContent = 'Ekle';
    cancelBtn.classList.add('hidden');
}

// Başarılıysa yeşil, hatalıysa kırmızı kutu gösterir
function showMessage(text, success) {
    messageBox.textContent = text;
    messageBox.className = 'mt-4 text-sm rounded-lg px-3 py-2 ' +
        (success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700');

    // 4 saniye sonra gizle
    setTimeout(() => { messageBox.classList.add('hidden'); }, 4000);
}

// Vazgeç butonu ve sıralama değişimi
cancelBtn.addEventListener('click', resetForm);
sortSelect.addEventListener('change', loadProducts);

// Sayfa ilk açıldığında kategorileri ve ürünleri yükle
loadCategories();
loadProducts();
