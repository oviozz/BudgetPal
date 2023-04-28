


const data = JSON.parse(localStorage.getItem('preLoadData'));
const receipt_search_lists = document.querySelector('.receipt-search-cards');

CreateItems(data)
function CreateItems(data){
    console.log('working')

    data.forEach((item) => {
        receipt_search_lists.innerHTML += `
            <li class="receipt-child-card">
                <div class="left-item-name">
                  <h3 class="search-item-title">${item.name}</h3>
                  <p class="search-item-store">${item.store_name}</p>
                </div>
        
                <div class="search-price-container">
                  <h2 class="search-item-price">$ ${item.price}</h2>
                  <p class="search-item-date">${item.timestamp}</p>
                </div>
            </li>`

    })

}

const receipt_search = document.querySelector('#receipt-search-bar');


receipt_search.addEventListener("input", (event) => {
    // Get the user's search query
    const query = event.target.value.toLowerCase();

    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(query)
    );

    receipt_search_lists.innerHTML = "";

    filteredData.forEach((item) => {
        receipt_search_lists.innerHTML += `
            <li class="receipt-child-card">
                <div class="left-item-name">
                  <h3 class="search-item-title">${item.name}</h3>
                  <p class="search-item-store">${item.store_name}</p>
                </div>
        
                <div class="search-price-container">
                  <h2 class="search-item-price">$ ${item.price}</h2>
                  <p class="search-item-date">${item.timestamp}</p>
                </div>
            </li>`
    });
});