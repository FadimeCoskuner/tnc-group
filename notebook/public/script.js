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
    const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;

    const response = await fetch(url);
    const result = await response.json();

    renderNotes(result.data, search);
}

function renderNotes(notes, search) {
    countText.textContent = search
        ? `"${search}" için ${notes.length} not bulundu`
        : `${notes.length} not`;

    if (notes.length === 0) {
        noteList.innerHTML = `<p class="col-span-full text-center font-hand text-3xl text-stone-400 py-10">
            ${search ? 'Eşleşen not yok' : 'Henüz not yok, ilk notunu yaz ✍️'}
        </p>`;
        return;
    }

    noteList.innerHTML = notes.map(note => {
        // Her not id'sine göre hep aynı renk ve eğimi alır
        const color = noteColors[note.id % noteColors.length];
        const rotate = rotations[note.id % rotations.length];

        return `
            <div class="sticky-note ${color} relative p-5 pt-6 min-h-[200px] flex flex-col" style="transform: rotate(${rotate}deg)">
                <span class="tape"></span>

                <h3 class="font-hand text-3xl leading-tight">${escapeHtml(note.title)}</h3>
                <!-- whitespace-pre-line: notta alt satıra geçilmişse aynen gösterir -->
                <p class="mt-2 text-stone-700 whitespace-pre-line break-words flex-1">${escapeHtml(note.content)}</p>

                <div class="flex items-center justify-between mt-4 text-xs text-stone-600/80">
                    <span>${formatDate(note.updatedAt || note.createdAt)}${note.updatedAt ? ' · düzenlendi' : ''}</span>
                    <span class="flex gap-1">
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

// Arama: her harf yazıldığında hemen değil, yazmayı bırakınca (300 ms sonra) ara
let searchTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadNotes, 300);
});

// Sayfa ilk açıldığında notları yükle
loadNotes();
