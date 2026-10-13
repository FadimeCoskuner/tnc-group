// normal function
function topla(a, b) {
    return a + b;
}

function cikar(a, b) {
    return a - b;
}   

function carp(a, b) {
    return a * b;
}

function bol(a, b) {
    if (b === 0) {
        throw new Error("Bölen sıfır olamaz.");
    }   
    return a / b;
}       

function selamla(isim) {
    return `Merhaba, ${isim}!`;
}

// arrow function
const toplaArrow = (a, b) => a + b;
const cikarArrow = (a, b) => a - b; 
const carpArrow = (a, b) => a * b;
const bolArrow = (a, b) => {
    if (b === 0) {
        throw new Error("Bölen sıfır olamaz.");
    }   
    return a / b;
}       

console.log(topla(5, 3)); // 8
console.log(cikar(5, 3)); // 2
console.log(carp(5, 3)); // 15
console.log(bol(6, 3)); // 2
console.log(selamla("Fadime")); // Merhaba, Fadime!
console.log(toplaArrow(5, 3)); // 8
console.log(cikarArrow(5, 3)); // 2
console.log(carpArrow(5, 3)); // 15
console.log(bolArrow(6, 3)); // 2   