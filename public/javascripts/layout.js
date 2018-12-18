// 
var cardTypes;

fetch ('http://localhost:3000/catalog/cardtypes',
    {headers: {
        'Content-Type' : 'text/plain'
    }}
).then ((response) => {
    if (response.ok) {
        response.text().then(function (text) {
            cardTypes = text.split(',');
            console.log(cardTypes);
            initialize();
        });
    }
    else {
        console.log('network request for CardType failed with response ' + res.status + ': ' + res.statusText);
    }
});

function initialize() {
    var category = document.querySelector('#category');
    var catetory_btn = document.querySelector('#category-button');
    var search_term = document.querySelector('#searchTerm');
    var search_btn = document.querySelector('#search-button');
    for (let type of cardTypes) {
        opt = document.createElement('option');
        opt.setAttribute('value', type);
        opt.textContent = type;
        category.appendChild(opt);
    };
    category.addEventListener('change', function () {
        console.log(category);
        //search_term.value = '';
        search_btn.click();
        //$('#category-button').trigger('click');
    });
    search_term.addEventListener('input', function () {
        if (search_term.value.trim() !== '') {
            search_btn.disabled = false;
        }
        else {
            search_btn.disabled = true;
        }
    });

}