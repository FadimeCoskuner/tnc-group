// API adresi: sayfa aynı sunucudan açıldığı için sadece yol yazmak yeterli
const API_URL = '/notes';

// Sayfadaki elemanlar
const form = document.getElementById('note-form');
const idInput = document.getElementById('note-id');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const messageText = document.getElementById('message');
const searchInput = document.getElementById('search');
const noteList = document.getElementById('note-list');
const countText = document.getElementById('count');
const statusTabs = document.querySelectorAll('.status-tab');

// Seçili durum filtresi: '' = tümü, 'false' = yapılacak, 'true' = tamamlandı
let selectedStatus = '';

// Yapışkan not renkleri ve hafif eğim açıları
const noteColors = ['bg-yellow-200', 'bg-pink-200', 'bg-sky-200', 'bg-lime-200', 'bg-orange-200', 'bg-violet-200'];
const rotations = [-2, 1.5, -1, 2, -1.5, 1];

// Kullanıcının yazdığı metni HTML'e güvenle koymak için
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// "2026-10-15" -> "15 Ekim 2026"
function formatDate(dateText) {
    return new Date(dateText).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ==============================
// Notları getir ve listele (GET)
// ==============================
async function loadNotes() {
    const search = searchInput.value.trim();

    // ?search=...&completed=... kısmını oluştur
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedStatus) params.append('completed', selectedStatus);

    const query = params.toString();
    const response = await fetch(query ? `${API_URL}?${query}` : API_URL);
    const result = await response.json();

    // Üstteki sayaç filtreden bağımsız olsun diye tüm notları da çekiyoruz
    const all = (await (await fetch(API_URL)).json()).data;
    const doneCount = all.filter(n => n.completed).length;
    countText.textContent = `${all.length} not · ${doneCount} tamamlandı`;

    renderTabs();
    renderNotes(result.data, search);
}

// Aktif filtre butonunu koyu yap
function renderTabs() {
    statusTabs.forEach(tab => {
        const active = tab.dataset.status === selectedStatus;
        tab.className = 'status-tab px-4 py-1.5 text-sm rounded-full ' +
            (active ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100');
    });
}

function renderNotes(notes, search) {
    if (notes.length === 0) {
        let emptyText = 'Henüz not yok, ilk notunu yaz ✍️';
        if (search) emptyText = 'Eşleşen not yok';
        else if (selectedStatus === 'true') emptyText = 'Henüz tamamlanan not yok';
        else if (selectedStatus === 'false') emptyText = 'Yapılacak bir şey kalmadı 🎉';

        noteList.innerHTML = `<p class="col-span-full text-center font-hand text-3xl text-stone-400 py-10">${emptyText}</p>`;
        return;
    }

    noteList.innerHTML = notes.map(note => {
        // Her not id'sine göre hep aynı renk ve eğimi alır
        const color = noteColors[note.id % noteColors.length];
        const rotate = rotations[note.id % rotations.length];

        // Tamamlanan not soluk ve üstü çizili görünür
        const done = note.completed;

        // Alttaki tarih: tamamlandıysa tamamlanma tarihi, değilse oluşturma/düzenleme tarihi
        let dateText = formatDate(note.updatedAt || note.createdAt) + (note.updatedAt ? ' · düzenlendi' : '');
        if (done && note.completedAt) dateText = `✔ ${formatDate(note.completedAt)}`;

        return `
            <div class="sticky-note ${color} relative p-5 pt-6 min-h-[200px] flex flex-col ${done ? 'opacity-60' : ''}" style="transform: rotate(${rotate}deg)">
                <span class="tape"></span>
                ${done ? '<span class="stamp">YAPILDI</span>' : ''}

                <h3 class="font-hand text-3xl leading-tight ${done ? 'line-through' : ''}">${escapeHtml(note.title)}</h3>
                <!-- whitespace-pre-line: notta alt satıra geçilmişse aynen gösterir -->
                <p class="mt-2 text-stone-700 whitespace-pre-line break-words flex-1 ${done ? 'line-through' : ''}">${escapeHtml(note.content)}</p>

                <div class="flex items-center justify-between mt-4 text-xs text-stone-600/80">
                    <span>${dateText}</span>
                    <span class="flex gap-1">
                        <!-- PATCH /notes/:id/complete -->
                        <button onclick="toggleNote(${note.id}, ${!done})"
                            class="px-2 py-1 rounded font-semibold ${done ? 'hover:bg-black/10' : 'bg-white/60 hover:bg-white text-emerald-700'}"
                            title="${done ? 'Geri al' : 'Yapıldı olarak işaretle'}">
                            ${done ? '↩️' : '✔ Yapıldı'}
                        </button>
                        <button onclick="startEdit(${note.id})" class="px-2 py-1 rounded hover:bg-black/10" title="Düzenle">✏️</button>
                        <button onclick="deleteNote(${note.id})" class="px-2 py-1 rounded hover:bg-black/10" title="Sil">🗑️</button>
                    </span>
                </div>
            </div>`;
    }).join('');
}

// ==============================
// Kaydet: yeni not (POST) veya düzenleme (PUT)
// ==============================
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = idInput.value;
    const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput.value, content: contentInput.value })
    });
    const result = await response.json();

    showMessage(result.message, response.ok);

    if (response.ok) {
        resetForm();
        await loadNotes();
    }
});

// Düzenle: notun bilgilerini forma doldur
async function startEdit(id) {
    const result = await (await fetch(API_URL)).json();
    const note = result.data.find(n => n.id === id);
    if (!note) return;

    idInput.value = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;

    submitBtn.textContent = 'Güncelle';
    cancelBtn.classList.remove('hidden');

    // Forma kaydır ve başlığa odaklan
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleInput.focus();
}

// Yapıldı / geri al (PATCH /notes/:id/complete)
async function toggleNote(id, completed) {
    const response = await fetch(`${API_URL}/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });
    const result = await response.json();
    showMessage(result.message, response.ok);
    await loadNotes();
}

// Sil (DELETE)
async function deleteNote(id) {
    if (!confirm('Bu not silinsin mi?')) return;

    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const result = await response.json();
    showMessage(result.message, response.ok);

    // Silinen not düzenleniyorsa formu temizle
    if (idInput.value === String(id)) resetForm();

    await loadNotes();
}

// Formu yeni not moduna döndürür
function resetForm() {
    form.reset();
    idInput.value = '';
    submitBtn.textContent = 'Kaydet';
    cancelBtn.classList.add('hidden');
}

// Formun altında kısa süre görünen mesaj
let messageTimer;
function showMessage(text, success) {
    messageText.textContent = text;
    messageText.className = 'text-sm ' + (success ? 'text-emerald-600' : 'text-rose-600');
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { messageText.textContent = ''; }, 3000);
}

cancelBtn.addEventListener('click', resetForm);

// Durum filtresi butonları
statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        selectedStatus = tab.dataset.status;
        loadNotes();
    });
});

// Arama: her harf yazıldığında hemen değil, yazmayı bırakınca (300 ms sonra) ara
let searchTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadNotes, 300);
});

// Sayfa ilk açıldığında notları yükle
loadNotes();
