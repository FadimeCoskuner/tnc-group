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

// Kapak renkleri: klasik ciltli kitap tonları
const coverColors = ['#7f1d1d', '#14532d', '#1e3a5f', '#4a1d4a', '#5b3a1e', '#134e4a'];

// Aynı türdeki kitaplar hep aynı renkte olsun diye türün harflerinden bir sayı üretiriz
function getCoverColor(type) {
    let total = 0;
    for (const letter of type) {
        total += letter.charCodeAt(0);
    }
    return coverColors[total % coverColors.length];
}

// Kitapları raftaki kapaklar olarak ekrana çizer
function renderBooks(books) {
    countText.textContent = `(${books.length})`;

    if (books.length === 0) {
        bookList.innerHTML = '<p class="col-span-full text-amber-100/70 italic">Bu rafta henüz kitap yok.</p>';
        return;
    }

    // map: her kitap için bir HTML kapağı oluşturur, join: hepsini birleştirir
    bookList.innerHTML = books.map(book => `
        <div class="flex flex-col">
            <div class="book-cover rounded-r-md rounded-l-sm aspect-[3/4] pl-7 pr-4 py-5 flex flex-col text-amber-50"
                style="background-color: ${getCoverColor(book.type)}">
                <span class="gold text-[10px] uppercase tracking-[0.3em]">${book.type}</span>
                <h3 class="font-display gold text-lg leading-snug mt-3">${book.title}</h3>
                <p class="italic text-amber-100/80 text-sm mt-2">${book.author}</p>
                <p class="mt-auto text-amber-100/60 text-xs">${book.year}</p>
            </div>

            <!-- Raf tahtası -->
            <div class="shelf -mx-3"></div>

            <div class="flex gap-2 mt-3">
                <button onclick="startEdit(${book.id})"
                    class="flex-1 text-xs py-1.5 border border-amber-600/60 text-amber-200 hover:bg-amber-700/30 rounded-sm">
                    Düzenle
                </button>
                <button onclick="deleteBook(${book.id})"
                    class="flex-1 text-xs py-1.5 border border-red-700/60 text-red-300 hover:bg-red-900/40 rounded-sm">
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
    messageText.className = 'text-sm mt-4 italic ' + (success ? 'text-green-800' : 'text-red-800');

    // 3 saniye sonra mesajı temizle
    setTimeout(() => { messageText.textContent = ''; }, 3000);
}

// Vazgeç butonu ve filtre değişimi
cancelBtn.addEventListener('click', resetForm);
filterSelect.addEventListener('change', loadBooks);

// Sayfa ilk açıldığında türleri ve kitapları yükle
loadTypes();
loadBooks();
