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
            //console.log(cardTypes);
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
    var lastCategory = localStorage.getItem("category");
    var lastSearchTerm = localStorage.getItem("searchTerm");
    for (let type of cardTypes) {
        opt = document.createElement('option');
        opt.setAttribute('value', type);
        opt.textContent = type;
        if (type === lastCategory) {
            opt.setAttribute('selected', true);
        }
        category.appendChild(opt);
    };
    search_term.value = lastSearchTerm? lastSearchTerm : "";

    category.addEventListener('change', function () {
        localStorage.setItem("category", category.value);
       //console.log(category);
        //search_term.value = '';
        //search_btn.click();
        //$('#category-button').trigger('click');
    });
    search_term.addEventListener('input', function () {
        // if (search_term.value.trim() !== '') {
        //     search_btn.disabled = false;
        // }
        // else {
        //     search_btn.disabled = true;
        // }
        localStorage.setItem("searchTerm", search_term.value.trim());
    });

}

function testclick () {
    var hiddenInput = document.querySelector('#hiddenFormInput');
    if (hiddenInput) {
      hiddenInput.parentNode.removeChild(hiddenInput);
    }
    var checkedCards = localStorage.getItem('checkedCardList');
    if (checkedCards) {
      let input = document.createElement('input');
      input.setAttribute('id', 'hiddenFormInput');
      input.setAttribute('name', 'checkedCardList');
      input.setAttribute('value', checkedCards);
      input.setAttribute('type', 'hidden');
      document.querySelector('#analysis-form').appendChild(input);
    }
  }