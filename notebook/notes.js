// Not işlemleri modülü (fs modülü)
// Hem terminal sürümü (index.js) hem web sunucusu (server.js) bu dosyayı kullanır.
// Notlar notes.json dosyasında saklanır, program kapansa da kaybolmaz.

const fs = require('fs');
const path = require('path');

// Notların kaydedileceği dosya (bu klasörün içinde)
const FILE_PATH = path.join(__dirname, 'notes.json');

// Dosya yoksa ilk kez başlatılırken kullanılacak örnek notlar
const sampleNotes = [
    { id: 1, title: "Alışveriş", content: "Süt, ekmek, yumurta al", createdAt: "2026-10-13" },
    { id: 2, title: "Ders", content: "fs modülünü tekrar et", createdAt: "2026-10-13" },
    { id: 3, title: "Spor", content: "Akşam 30 dakika yürüyüş", createdAt: "2026-10-14" }
];

// Bugünün tarihi: "2026-10-15"
function today() {
    return new Date().toISOString().split('T')[0];
}

// Notları JSON olarak dosyaya kaydeder
// JSON.stringify(..., null, 2): dosyada girintili, okunaklı görünsün
function saveNotes(notes) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2), 'utf-8');
}

// Notları dosyadan okur ve dizi olarak döndürür
function readNotes() {
    // Dosya henüz yoksa örnek notlarla oluştur
    if (!fs.existsSync(FILE_PATH)) {
        saveNotes(sampleNotes);
    }

    const text = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(text); // yazıyı tekrar diziye çevir
}

// Yeni not ekler, eklenen notu döndürür
function addNote(title, content) {
    const notes = readNotes();

    const newNote = {
        // id: en büyük id'nin 1 fazlası
        id: notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1,
        title,
        content,
        createdAt: today()
    };

    notes.push(newNote);
    saveNotes(notes);
    return newNote;
}

// Notu günceller, güncellenen notu döndürür (bulunamazsa null)
function updateNote(id, title, content) {
    const notes = readNotes();
    const note = notes.find(n => n.id === id);

    if (!note) {
        return null;
    }

    note.title = title;
    note.content = content;
    note.updatedAt = today();

    saveNotes(notes);
    return note;
}

// Notu siler, silinen notu döndürür (bulunamazsa null)
function deleteNote(id) {
    const notes = readNotes();
    const index = notes.findIndex(n => n.id === id);

    if (index === -1) {
        return null;
    }

    const deleted = notes.splice(index, 1)[0];
    saveNotes(notes);
    return deleted;
}

module.exports = { readNotes, addNote, updateNote, deleteNote };
