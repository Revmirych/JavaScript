// Адрес из задания
let url = 'https://students.netoservices.ru/nestjs-backend/slow-get-courses';

// Адрес в локальной папке
//let url = 'slow-get-courses';

const cacheKeyName = 'valute';

function showValute(valute) {
    let html = '';
    for (let item in valute) {
        html += '<div class="item">' +
            '<div class="item__code">' + valute[item].CharCode + '</div>' +
            '<div class="item__value">' + valute[item].Value + '</div>' +
            '<div class="item__currency">руб.</div>' +
            '</div>';
    }
    document.getElementById('items').innerHTML = html;
}

function ready() {
    if (localStorage.getItem(cacheKeyName) !== null) {
        showValute(localStorage.getItem(cacheKeyName));
    }
    fetch(url, {method: 'get'})
        .then(response => response.json())
        .then(result => {
            showValute(result.response.Valute);
            localStorage.setItem(cacheKeyName, result.response.Valute);
        })
        .catch(e => {
            document.getElementById('items').innerHTML = 'Произошла ошибка: ' + e;
        })
        .finally(() => {
            document.getElementById('loader').classList.remove('loader_active');
        })
}

document.addEventListener("DOMContentLoaded", ready);
