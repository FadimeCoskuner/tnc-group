// Sayfanın durumu
let books = [];
let users = [];
let loans = [];
let activeTab = 'loans';      // açık sekme
let availableFilter = '';     // '' = tümü, 'true' = rafta, 'false' = ödünçte

// Sayfadaki elemanlar
const stats = document.getElementById('stats');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const loanForm = document.getElementById('loan-form');
const loanUserSelect = document.getElementById('loan-user');
const loanBookSelect = document.getElementById('loan-book');
const activeLoansBox = document.getElementById('active-loans');
const loanHistory = document.getElementById('loan-history');
const bookForm = document.getElementById('book-form');
const bookFilterButtons = document.querySelectorAll('.filter-btn');
const bookList = document.getElementById('book-list');
const userForm = document.getElementById('user-form');
const userList = document.getElementById('user-list');
const toast = document.getElementById('toast');

// Kullanıcının yazdığı metni HTML'e güvenle koymak için
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

// "2026-10-15" -> "15 Eki 2026"
function formatDate(dateText) {
    return new Date(dateText).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Kitap kaç gündür ödünçte?
function daysSince(dateText) {
    const ms = new Date() - new Date(dateText);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Sunucuya JSON isteği atan yardımcı fonksiyon
async function sendRequest(url, method, body) {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const result = await response.json();
    showToast(result.message, response.ok);
    return response.ok;
}

// ==============================
// Verileri yükle
// ==============================
async function loadData() {
    // Üç modülün verisini aynı anda çek
    const [booksRes, usersRes, loansRes] = await Promise.all([
        fetch('/books'), fetch('/users'), fetch('/loans')
    ]);
    books = (await booksRes.json()).data;
    users = (await usersRes.json()).data;
    loans = (await loansRes.json()).data;

    renderStats();
    renderLoanForm();
    renderLoans();
    await renderBooks();
    renderUsers();
}

// ==============================
// Ekrana çizme fonksiyonları
// ==============================

// Üstteki 4 istatistik kartı
function renderStats() {
    const borrowed = books.filter(b => b.borrowedBy !== null).length;
    const items = [
        { label: 'Toplam kitap', value: books.length, icon: '📚' },
        { label: 'Rafta', value: books.length - borrowed, icon: '✅' },
        { label: 'Ödünçte', value: borrowed, icon: '📖' },
        { label: 'Üye', value: users.length, icon: '👥' }
    ];

    stats.innerHTML = items.map(item => `
        <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between text-slate-500 text-sm">
                <span>${item.label}</span><span class="text-xl">${item.icon}</span>
            </div>
            <p class="font-serif text-4xl text-[#13233a] mt-2">${item.value}</p>
        </div>
    `).join('');
}

// Ödünç formundaki seçim kutuları
function renderLoanForm() {
    loanUserSelect.innerHTML = users.map(u => {
        const count = books.filter(b => b.borrowedBy === u.id).length;
        return `<option value="${u.id}">${escapeHtml(u.name)} (${count}/3 kitap)</option>`;
    }).join('');

    const available = books.filter(b => b.borrowedBy === null);
    loanBookSelect.innerHTML = available.length
        ? available.map(b => `<option value="${b.id}">${escapeHtml(b.title)} — ${escapeHtml(b.author)}</option>`).join('')
        : '<option value="">Rafta kitap yok</option>';
}

// Ödünçteki kitaplar (kart) ve geçmiş (tablo)
function renderLoans() {
    const active = loans.filter(l => l.returnDate === null);
    const returned = loans.filter(l => l.returnDate !== null).reverse(); // en yeni üstte

    activeLoansBox.innerHTML = active.length ? active.map(loan => {
        const days = daysSince(loan.borrowDate);
        return `
            <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border-l-4 border-amber-400">
                <div class="flex-1 min-w-0">
                    <p class="font-semibold truncate">${escapeHtml(loan.bookTitle)}</p>
                    <p class="text-sm text-slate-500">${escapeHtml(loan.userName)} · ${formatDate(loan.borrowDate)}</p>
                    <p class="text-xs text-amber-600 mt-1">${days === 0 ? 'Bugün alındı' : `${days} gündür ödünçte`}</p>
                </div>
                <!-- PATCH /loans/:id/return -->
                <button onclick="returnBook(${loan.id})"
                    class="shrink-0 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium">
                    İade al
                </button>
            </div>`;
    }).join('') : '<p class="text-slate-400 col-span-full">Şu an ödünçte kitap yok.</p>';

    loanHistory.innerHTML = returned.length ? returned.map(loan => `
        <tr class="border-b border-stone-100 last:border-0">
            <td class="px-5 py-3">${escapeHtml(loan.bookTitle)}</td>
            <td class="px-5 py-3 text-slate-600">${escapeHtml(loan.userName)}</td>
            <td class="px-5 py-3 text-slate-500">${formatDate(loan.borrowDate)}</td>
            <td class="px-5 py-3 text-emerald-700">${formatDate(loan.returnDate)}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" class="px-5 py-6 text-center text-slate-400">Henüz iade edilen kitap yok.</td></tr>';
}

// Kitap kartları: filtre seçiliyse sunucudan filtreli liste istenir
async function renderBooks() {
    const url = availableFilter ? `/books?available=${availableFilter}` : '/books';
    const list = (await (await fetch(url)).json()).data;

    // Aktif filtre butonu
    bookFilterButtons.forEach(btn => {
        const active = btn.dataset.available === availableFilter;
        btn.className = 'filter-btn text-sm px-4 py-1.5 rounded-full border ' +
            (active ? 'bg-[#13233a] text-white border-[#13233a]' : 'bg-white border-stone-300 text-slate-600 hover:border-[#13233a]');
    });

    bookList.innerHTML = list.length ? list.map(book => {
        const borrower = users.find(u => u.id === book.borrowedBy);
        const onShelf = book.borrowedBy === null;
        return `
            <div class="bg-white rounded-2xl shadow-sm p-5 flex gap-4">
                <!-- Küçük kitap kapağı -->
                <div class="w-12 h-16 rounded shrink-0 ${onShelf ? 'bg-[#13233a]' : 'bg-stone-300'} flex items-center justify-center text-amber-400 font-serif text-xl">
                    ${escapeHtml(book.title.charAt(0))}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold leading-snug">${escapeHtml(book.title)}</p>
                    <p class="text-sm text-slate-500">${escapeHtml(book.author)}</p>
                    <div class="flex items-center justify-between mt-3">
                        ${onShelf
                            ? '<span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Rafta</span>'
                            : `<span class="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">${escapeHtml(borrower?.name ?? '')} okuyor</span>`}
                        <button onclick="deleteBook(${book.id})" class="text-xs text-slate-400 hover:text-red-600">Sil</button>
                    </div>
                </div>
            </div>`;
    }).join('') : '<p class="text-slate-400 col-span-full">Bu filtrede kitap yok.</p>';
}

// Üye kartları
function renderUsers() {
    userList.innerHTML = users.map(user => {
        const userBooks = books.filter(b => b.borrowedBy === user.id);
        const totalLoans = loans.filter(l => l.userId === user.id).length;
        return `
            <div class="bg-white rounded-2xl shadow-sm p-5">
                <div class="flex items-center gap-3">
                    <span class="w-11 h-11 rounded-full bg-amber-100 text-amber-700 font-semibold flex items-center justify-center">
                        ${escapeHtml(user.name.charAt(0).toUpperCase())}
                    </span>
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold">${escapeHtml(user.name)}</p>
                        <p class="text-sm text-slate-500 truncate">${escapeHtml(user.email)}</p>
                    </div>
                    <button onclick="deleteUser(${user.id})" class="text-xs text-slate-400 hover:text-red-600">Sil</button>
                </div>

                <!-- Elindeki kitap sayısı / sınır (3) -->
                <div class="mt-4">
                    <div class="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Elindeki kitaplar</span><span>${userBooks.length}/3 · toplam ${totalLoans} ödünç</span>
                    </div>
                    <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div class="h-full bg-amber-400" style="width: ${(userBooks.length / 3) * 100}%"></div>
                    </div>
                    ${userBooks.length ? `
                        <ul class="mt-3 space-y-1 text-sm text-slate-600">
                            ${userBooks.map(b => `<li>📖 ${escapeHtml(b.title)}</li>`).join('')}
                        </ul>` : ''}
                </div>
            </div>`;
    }).join('');
}

// ==============================
// İşlemler
// ==============================

// Ödünç ver: POST /loans
loanForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!loanBookSelect.value) return;

    const ok = await sendRequest('/loans', 'POST', {
        userId: Number(loanUserSelect.value),
        bookId: Number(loanBookSelect.value)
    });
    if (ok) await loadData();
});

// İade al: PATCH /loans/:id/return
async function returnBook(loanId) {
    await sendRequest(`/loans/${loanId}/return`, 'PATCH');
    await loadData();
}

// Kitap ekle: POST /books
bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ok = await sendRequest('/books', 'POST', {
        title: document.getElementById('book-title').value.trim(),
        author: document.getElementById('book-author').value.trim()
    });
    if (ok) {
        bookForm.reset();
        await loadData();
    }
});

// Kitap sil: DELETE /books/:id (ödünçteyse sunucu izin vermez)
async function deleteBook(id) {
    if (!confirm('Bu kitap silinsin mi?')) return;
    await sendRequest(`/books/${id}`, 'DELETE');
    await loadData();
}

// Üye ekle: POST /users
userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ok = await sendRequest('/users', 'POST', {
        name: document.getElementById('user-name').value.trim(),
        email: document.getElementById('user-email').value.trim()
    });
    if (ok) {
        userForm.reset();
        await loadData();
    }
});

// Üye sil: DELETE /users/:id (elinde kitap varsa sunucu izin vermez)
async function deleteUser(id) {
    if (!confirm('Bu üye silinsin mi?')) return;
    await sendRequest(`/users/${id}`, 'DELETE');
    await loadData();
}

// ==============================
// Sekmeler ve filtre
// ==============================
function showTab(tab) {
    activeTab = tab;

    tabPanels.forEach(panel => panel.classList.toggle('hidden', panel.id !== `tab-${tab}`));

    tabButtons.forEach(btn => {
        const active = btn.dataset.tab === tab;
        btn.className = 'tab-btn pb-3 font-medium border-b-2 -mb-px ' +
            (active ? 'border-amber-500 text-[#13233a]' : 'border-transparent text-slate-400 hover:text-slate-600');
    });
}

tabButtons.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));

bookFilterButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        availableFilter = btn.dataset.available;
        await renderBooks();
    });
});

// Sağ altta kısa süre görünen mesaj
let toastTimer;
function showToast(text, success) {
    toast.textContent = text;
    toast.className = 'fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm text-white max-w-xs ' +
        (success ? 'bg-[#13233a]' : 'bg-red-600');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// Sayfa ilk açıldığında
showTab(activeTab);
loadData();
