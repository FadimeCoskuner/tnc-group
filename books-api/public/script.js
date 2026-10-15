// API adresi: sayfa aynı sunucudan açıldığı için sadece yol yazmak yeterli
const API_URL = '/books';

// Sayfadaki elemanlar
const form = document.getElementById('book-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const bookIdInput = document.getElementById('book-id');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const yearInput = document.getElementById('year');
const typeInput = document.getElementById('type');
const filterSelect = document.getElementById('filter');
const bookList = document.getElementById('book-list');
const countText = document.getElementById('count');
const messageText = document.getElementById('message');

// ==============================
// Kitapları getir ve listele (GET)
// ==============================
async function loadBooks() {
    const type = filterSelect.value;

    // Filtre seçiliyse /books?type=roman, değilse /books
    const url = type ? `${API_URL}?type=${encodeURIComponent(type)}` : API_URL;

    const response = await fetch(url);
    const result = await response.json();

    renderBooks(result.data);
}

// Kitapları kart olarak ekrana çizer
function renderBooks(books) {
    countText.textContent = `(${books.length})`;

    if (books.length === 0) {
        bookList.innerHTML = '<p class="text-slate-500">Bu türde kitap bulunamadı.</p>';
        return;
    }

    // map: her kitap için bir HTML kartı oluşturur, join: hepsini birleştirir
    bookList.innerHTML = books.map(book => `
        <div class="bg-white rounded-xl shadow p-5 flex flex-col">
            <span class="self-start text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full mb-3">${book.type}</span>
            <h3 class="font-semibold text-lg">${book.title}</h3>
            <p class="text-slate-600">${book.author}</p>
            <p class="text-slate-400 text-sm mb-4">${book.year}</p>

            <div class="mt-auto flex gap-2">
                <button onclick="startEdit(${book.id})"
                    class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm py-1.5 rounded-lg">
                    Düzenle
                </button>
                <button onclick="deleteBook(${book.id})"
                    class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm py-1.5 rounded-lg">
                    Sil
                </button>
            </div>
        </div>
    `).join('');
}

// Filtre listesini mevcut türlerle doldurur
async function loadTypes() {
    const response = await fetch(API_URL);
    const result = await response.json();

    // Tüm türleri al, Set ile tekrar edenleri çıkar
    const types = [...new Set(result.data.map(book => book.type))];

    const selected = filterSelect.value;
    filterSelect.innerHTML = '<option value="">Tüm türler</option>' +
        types.map(type => `<option value="${type}">${type}</option>`).join('');

    // Önceden seçili tür hâlâ varsa seçili kalsın
    if (types.includes(selected)) {
        filterSelect.value = selected;
    }
}

// ==============================
// Form gönderilince: ekle (POST) veya güncelle (PUT)
// ==============================
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Sayfanın yenilenmesini engeller

    const book = {
        title: titleInput.value,
        author: authorInput.value,
        year: Number(yearInput.value),
        type: typeInput.value.toLowerCase()
    };

    const id = bookIdInput.value;

    // id varsa düzenleme modundayız: PUT, yoksa yeni kitap: POST
    const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    });

    const result = await response.json();
    showMessage(result.message, response.ok);

    if (response.ok) {
        resetForm();
        await loadTypes();
        await loadBooks();
    }
});

// ==============================
// Düzenle butonuna basınca formu doldur
// ==============================
async function startEdit(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();
    const book = result.data;

    bookIdInput.value = book.id;
    titleInput.value = book.title;
    authorInput.value = book.author;
    yearInput.value = book.year;
    typeInput.value = book.type;

    formTitle.textContent = 'Kitabı Düzenle';
    submitBtn.textContent = 'Kaydet';
    cancelBtn.classList.remove('hidden');
    titleInput.focus();
}

// ==============================
// Sil butonuna basınca (DELETE)
// ==============================
async function deleteBook(id) {
    // Kullanıcıdan onay al
    if (!confirm('Bu kitabı silmek istediğine emin misin?')) {
        return;
    }

    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const result = await response.json();
    showMessage(result.message, response.ok);

    await loadTypes();
    await loadBooks();
}

// Formu ekleme moduna geri döndürür
function resetForm() {
    form.reset();
    bookIdInput.value = '';
    formTitle.textContent = 'Yeni Kitap Ekle';
    submitBtn.textContent = 'Ekle';
    cancelBtn.classList.add('hidden');
}

// Başarılıysa yeşil, hatalıysa kırmızı mesaj gösterir
function showMessage(text, success) {
    messageText.textContent = text;
    messageText.className = 'text-sm mt-4 ' + (success ? 'text-green-600' : 'text-red-600');

    // 3 saniye sonra mesajı temizle
    setTimeout(() => { messageText.textContent = ''; }, 3000);
}

// Vazgeç butonu ve filtre değişimi
cancelBtn.addEventListener('click', resetForm);
filterSelect.addEventListener('change', loadBooks);

// Sayfa ilk açıldığında türleri ve kitapları yükle
loadTypes();
loadBooks();
