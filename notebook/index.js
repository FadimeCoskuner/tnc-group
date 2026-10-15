// Not Defteri: terminal sürümü
// Not işlemleri notes.js modülünde, burada sadece terminal komutları var.
//
// Kullanım (terminalde, notebook klasöründe):
//   node index.js                              -> notları listeler
//   node index.js add "Başlık" "Not içeriği"   -> yeni not ekler
//   node index.js done 2                       -> 2 numaralı notu yapıldı / yapılmadı yapar
//   node index.js delete 2                     -> 2 numaralı notu siler
//
// Web arayüzü için: node server.js

const { readNotes, addNote, setCompleted, deleteNote } = require('./notes');

// Notları kutu içinde, düzenli şekilde konsola yazdırır
function listNotes() {
    const notes = readNotes();
    const width = 50; // kutunun iç genişliği

    // Kutunun bir satırı: metni sağdan boşlukla doldurur
    const line = (text) => '│ ' + text.padEnd(width) + ' │';

    const doneCount = notes.filter(n => n.completed).length;

    console.log('┌' + '─'.repeat(width + 2) + '┐');
    console.log(line(`📒 NOT DEFTERİ  (${doneCount}/${notes.length} yapıldı)`.padEnd(width - 1)));
    console.log('├' + '─'.repeat(width + 2) + '┤');

    if (notes.length === 0) {
        console.log(line('Henüz not yok.'));
    }

    notes.forEach((note, i) => {
        // [x] yapıldı, [ ] yapılmadı
        const box = note.completed ? '[x]' : '[ ]';
        console.log(line(`${box} #${note.id}  ${note.title}`.padEnd(width - 10) + note.createdAt));
        console.log(line(`        ${note.content}`));

        // Notların arasına ince çizgi (sonuncudan sonra değil)
        if (i < notes.length - 1) {
            console.log('│ ' + '·'.repeat(width) + ' │');
        }
    });

    console.log('└' + '─'.repeat(width + 2) + '┘');
}

// ==============================
// Terminalden gelen komutu çalıştır
// ==============================
// process.argv: ["node", "index.js", komut, değer1, değer2]
const [command, arg1, arg2] = process.argv.slice(2);

switch (command) {
    case 'add': {
        if (!arg1 || !arg2) {
            console.log('⚠️  Başlık ve içerik zorunludur.');
            console.log('   Örnek: node index.js add "Alışveriş" "Süt al"');
            break;
        }
        const note = addNote(arg1, arg2);
        console.log(`✅ Not eklendi: #${note.id} ${note.title}\n`);
        listNotes();
        break;
    }
    case 'done': {
        const note = setCompleted(Number(arg1));
        if (!note) {
            console.log(`⚠️  ${arg1} numaralı not bulunamadı.`);
            break;
        }
        console.log(note.completed
            ? `✔️  Tamamlandı: #${note.id} ${note.title}\n`
            : `↩️  Yapılacaklara geri alındı: #${note.id} ${note.title}\n`);
        listNotes();
        break;
    }
    case 'delete': {
        const deleted = deleteNote(Number(arg1));
        if (!deleted) {
            console.log(`⚠️  ${arg1} numaralı not bulunamadı.`);
            break;
        }
        console.log(`🗑️  Not silindi: #${deleted.id} ${deleted.title}\n`);
        listNotes();
        break;
    }
    case undefined:
        listNotes();
        break;
    default:
        console.log(`⚠️  Bilinmeyen komut: ${command}`);
        console.log('   Kullanılabilir komutlar: add, done, delete (komut yazmazsan notlar listelenir)');
}
