// 
var cardTypes;

fetch ('http://localhost:3000/catalog/cardtype/possibleCardTypes',
    {headers: {
        'Content-Type' : 'text/plain'
    }}
).then ((response) => {
    if (response.ok) {
        return response.text();
    }}).then(function(text) {
        cardTypes = text.split(',');
        console.log(cardTypes);
        initialize();
    });

function initialize() {
    var category = document.querySelector('#category');
    var catetory_btn = document.querySelector('#category-button');
    for (let type of cardTypes) {
        opt = document.createElement('option');
        opt.setAttribute('value', type);
        opt.textContent = type;
        category.appendChild(opt);
    }
    category.addEventListener('change', function () {
        console.log(category);
        catetory_btn.click();
        //$('#category-button').trigger('click');
    })

}