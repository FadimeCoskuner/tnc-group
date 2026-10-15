// Sayfadaki elemanlar
const userList = document.getElementById('user-list');
const userForm = document.getElementById('user-form');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const deleteUserBtn = document.getElementById('delete-user-btn');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskUserSelect = document.getElementById('task-user');
const statusTabs = document.querySelectorAll('.status-tab');
const taskList = document.getElementById('task-list');
const toast = document.getElementById('toast');

// Sayfanın durumu
let users = [];               // tüm kullanıcılar
let allTasks = [];            // tüm görevler (menüdeki sayılar için)
let selectedUserId = null;    // null = "Tüm görevler"
let selectedStatus = 'all';   // 'all', 'true' (tamamlanan), 'false' (devam eden)

// Avatar renkleri: her kullanıcı id'sine göre bir renk
const avatarColors = ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];

// Kullanıcının yazdığı metni HTML'e güvenle koymak için (< > gibi karakterleri zararsız yapar)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// İsmin baş harfi ve renkli yuvarlak avatar
function avatar(user, size = 'w-8 h-8 text-sm') {
    const color = avatarColors[user.id % avatarColors.length];
    return `<span class="${size} ${color} rounded-full flex items-center justify-center font-semibold text-white shrink-0">
                ${escapeHtml(user.name.charAt(0).toUpperCase())}
            </span>`;
}

function getUser(id) {
    return users.find(u => u.id === id);
}

// ==============================
// Verileri sunucudan çek
// ==============================
async function loadData() {
    // İki isteği aynı anda gönder, ikisinin de bitmesini bekle
    const [usersRes, tasksRes] = await Promise.all([fetch('/users'), fetch('/tasks')]);
    users = (await usersRes.json()).data;
    allTasks = (await tasksRes.json()).data;

    // Seçili kullanıcı silinmişse "Tüm görevler"e dön
    if (selectedUserId !== null && !getUser(selectedUserId)) {
        selectedUserId = null;
    }

    renderUsers();
    renderTaskUserSelect();
    await loadTasks();
}

// Ekranda gösterilecek görevleri getir
async function loadTasks() {
    let tasks;

    if (selectedUserId === null) {
        // Tüm görevler: durum filtresini sunucuya soruyoruz -> /tasks?completed=true
        const url = selectedStatus === 'all' ? '/tasks' : `/tasks?completed=${selectedStatus}`;
        tasks = (await (await fetch(url)).json()).data;
    } else {
        // Bir kullanıcı seçili: /users/:id/tasks ile o kullanıcının görevlerini al
        tasks = (await (await fetch(`/users/${selectedUserId}/tasks`)).json()).data;

        // Bu endpoint'te durum filtresi olmadığı için burada filtreliyoruz
        if (selectedStatus !== 'all') {
            tasks = tasks.filter(t => String(t.completed) === selectedStatus);
        }
    }

    renderHeader();
    renderTasks(tasks);
}

// ==============================
// Ekrana çizme fonksiyonları
// ==============================

// Sol menü: "Tüm görevler" + her kullanıcı ve görev sayısı
function renderUsers() {
    const itemClass = (active) =>
        `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm ${active ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60'}`;

    let html = `
        <button onclick="selectUser(null)" class="${itemClass(selectedUserId === null)}">
            <span class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">📋</span>
            <span class="flex-1">Tüm görevler</span>
            <span class="text-xs text-slate-400">${allTasks.length}</span>
        </button>
        <p class="px-3 pt-4 pb-1 text-xs uppercase tracking-wider text-slate-500">Kullanıcılar</p>
    `;

    html += users.map(user => {
        const userTasks = allTasks.filter(t => t.userId === user.id);
        const doneCount = userTasks.filter(t => t.completed).length;
        return `
            <button onclick="selectUser(${user.id})" class="${itemClass(selectedUserId === user.id)}">
                ${avatar(user)}
                <span class="flex-1 min-w-0">
                    <span class="block truncate">${escapeHtml(user.name)}</span>
                    <span class="block text-xs text-slate-500 truncate">${escapeHtml(user.email)}</span>
                </span>
                <span class="text-xs text-slate-400">${doneCount}/${userTasks.length}</span>
            </button>`;
    }).join('');

    userList.innerHTML = html;
}

// Görev formundaki kullanıcı seçimi
function renderTaskUserSelect() {
    taskUserSelect.innerHTML = users
        .map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`)
        .join('');

    // Bir kullanıcı seçiliyse yeni görev ona eklensin
    if (selectedUserId !== null) {
        taskUserSelect.value = selectedUserId;
    }
}

// Başlık, ilerleme çubuğu ve filtre butonları
function renderHeader() {
    // İlerleme, filtreden bağımsız olarak seçili kişinin tüm görevlerine göre hesaplanır
    const scope = selectedUserId === null ? allTasks : allTasks.filter(t => t.userId === selectedUserId);
    const done = scope.filter(t => t.completed).length;
    const percent = scope.length === 0 ? 0 : Math.round((done / scope.length) * 100);

    if (selectedUserId === null) {
        pageTitle.textContent = 'Tüm görevler';
        pageSubtitle.textContent = `${users.length} kullanıcı, ${allTasks.length} görev`;
        deleteUserBtn.classList.add('hidden');
    } else {
        const user = getUser(selectedUserId);
        pageTitle.textContent = `${user.name} kullanıcısının görevleri`;
        pageSubtitle.textContent = user.email;
        deleteUserBtn.classList.remove('hidden');
    }

    progressText.textContent = `${done}/${scope.length} tamamlandı · %${percent}`;
    progressBar.style.width = `${percent}%`;

    // Aktif filtre butonunu beyaz yap
    statusTabs.forEach(tab => {
        const active = tab.dataset.status === selectedStatus;
        tab.className = 'status-tab px-4 py-1.5 text-sm rounded-lg ' +
            (active ? 'bg-white shadow-sm font-medium' : 'text-slate-600 hover:text-slate-900');
    });
}

// Görev listesi
function renderTasks(tasks) {
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="text-center text-slate-400 py-12">Burada görev yok 🎉</li>';
        return;
    }

    taskList.innerHTML = tasks.map(task => {
        const owner = getUser(task.userId);
        return `
            <li class="group bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                <!-- Yuvarlak onay kutusu: tıklanınca PATCH ile completed değişir -->
                <button onclick="toggleTask(${task.id}, ${!task.completed})"
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                        ${task.completed ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 hover:border-violet-500'}">
                    ${task.completed ? '✓' : ''}
                </button>

                <span class="flex-1 ${task.completed ? 'line-through text-slate-400' : ''}">${escapeHtml(task.title)}</span>

                <!-- "Tüm görevler" görünümünde görevin sahibini göster -->
                ${selectedUserId === null && owner ? `
                    <span class="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                        ${avatar(owner, 'w-6 h-6 text-xs')} ${escapeHtml(owner.name)}
                    </span>` : ''}

                <!-- Silme butonu: fare üzerine gelince görünür -->
                <button onclick="deleteTask(${task.id})"
                    class="text-slate-300 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100" title="Sil">
                    ✕
                </button>
            </li>`;
    }).join('');
}

// ==============================
// Kullanıcı işlemleri
// ==============================

// Sol menüden kullanıcı seçimi
async function selectUser(id) {
    selectedUserId = id;
    renderUsers();
    renderTaskUserSelect();
    await loadTasks();
}

// Yeni kullanıcı (POST /users)
userForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const response = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userNameInput.value.trim(), email: userEmailInput.value.trim() })
    });
    const result = await response.json();
    showToast(result.message, response.ok);

    if (response.ok) {
        userForm.reset();
        selectedUserId = result.data.id; // yeni kullanıcıyı seç
        await loadData();
    }
});

// Kullanıcıyı sil (DELETE /users/:id) -> görevleri de silinir
deleteUserBtn.addEventListener('click', async () => {
    const user = getUser(selectedUserId);
    if (!confirm(`${user.name} ve tüm görevleri silinsin mi?`)) {
        return;
    }

    const response = await fetch(`/users/${selectedUserId}`, { method: 'DELETE' });
    const result = await response.json();
    showToast(result.message, response.ok);

    selectedUserId = null;
    await loadData();
});

// ==============================
// Görev işlemleri
// ==============================

// Yeni görev (POST /tasks)
taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitleInput.value.trim(), userId: Number(taskUserSelect.value) })
    });
    const result = await response.json();
    showToast(result.message, response.ok);

    if (response.ok) {
        taskTitleInput.value = '';
        await loadData();
    }
});

// Tamamlandı / tamamlanmadı (PATCH /tasks/:id)
async function toggleTask(id, completed) {
    const response = await fetch(`/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });

    if (!response.ok) {
        const result = await response.json();
        showToast(result.message, false);
    }

    await loadData();
}

// Görevi sil (DELETE /tasks/:id)
async function deleteTask(id) {
    const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
    const result = await response.json();
    showToast(result.message, response.ok);
    await loadData();
}

// Durum filtresi butonları
statusTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
        selectedStatus = tab.dataset.status;
        await loadTasks();
    });
});

// Sağ altta kısa süre görünen mesaj
let toastTimer;
function showToast(text, success) {
    toast.textContent = text;
    toast.className = 'fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm text-white ' +
        (success ? 'bg-slate-900' : 'bg-red-600');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Sayfa ilk açıldığında verileri yükle
loadData();
