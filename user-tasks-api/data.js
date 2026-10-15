// Ortak veriler: hem users hem tasks modülü bu dosyayı kullanır
// Diziler const: içerikleri push/splice ile değişir ama dizinin kendisi değişmez,
// böylece iki modül de hep aynı diziyi görür

const users = [
    { id: 1, name: "Ayşe", email: "ayse@mail.com" },
    { id: 2, name: "Mehmet", email: "mehmet@mail.com" },
    { id: 3, name: "Zeynep", email: "zeynep@mail.com" }
];

// Her görevin userId alanı, görevin hangi kullanıcıya ait olduğunu gösterir
const tasks = [
    { id: 1, title: "Market alışverişi yap", completed: false, userId: 1 },
    { id: 2, title: "Node.js ödevini bitir", completed: true, userId: 1 },
    { id: 3, title: "Spor salonuna git", completed: false, userId: 2 },
    { id: 4, title: "Kitap oku", completed: false, userId: 3 },
    { id: 5, title: "Faturaları öde", completed: true, userId: 3 }
];

// Bir dizideki en büyük id'nin 1 fazlasını döndürür
function getNextId(list) {
    return list.length > 0 ? Math.max(...list.map(item => item.id)) + 1 : 1;
}

// Diğer dosyalarda require ile kullanabilmek için dışa aktarıyoruz
module.exports = { users, tasks, getNextId };
