// Almacena los artículos marcados
let markedItems = [];

// Elementos del DOM
const searchBtn = document.getElementById('searchBtn');
const compareLink = document.getElementById('compareLink');
const backToSearchLink = document.getElementById('backToSearch');
const appPage = document.getElementById('app');
const comparisonPage = document.getElementById('comparisonPage');

// Event Listeners
searchBtn.addEventListener('click', performSearch);
compareLink.addEventListener('click', showComparisonPage);
backToSearchLink.addEventListener('click', showSearchPage);

function performSearch() {
    const query = document.getElementById('search').value;
    fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Reemplaza 'TU_TOKEN' con tu token de autorización si es necesario
            'Authorization': 'Bearer TU_TOKEN'
        }
    })
    .then(response => response.json())
    .then(data => {
        const results = document.getElementById('results');
        results.innerHTML = '';

        // Ordenar los resultados por precio
        data.results.sort((a, b) => a.price - b.price);

        data.results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item';

            // Obtener el número de unidades del título
            const units = extractUnitsFromTitle(item.title);
            const unitPrice = units > 0 ? (item.price / units).toFixed(2) : "N/A";

            div.innerHTML = `
                <input type="checkbox" class="item-checkbox" id="item-${item.id}" ${isItemMarked(item) ? 'checked' : ''}>
                <label for="item-${item.id}">
                    <h3>${item.title}</h3>
                    <img src="${item.thumbnail}" alt="${item.title}">
                    <p>Precio Total: $${item.price.toFixed(2)}</p>
                    <p>Precio Unitario: $${unitPrice}</p>
                </label>
            `;

            const checkbox = div.querySelector('.item-checkbox');
            checkbox.addEventListener('change', () => toggleMarkItem(item, checkbox));

            results.appendChild(div);
        });

        updateCompareLink();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function extractUnitsFromTitle(title) {
    const patterns = [
        /\bX\s?(\d+)\s?U\b/i,
        /\bX\s?(\d+)\s?u\b/i,
        /\b(\d+)\s?unidades\b/i,
        /\b(\d+)\s?Unidades\b/i,
        /\b(\d+)\s?u\b/i,
        /\b(\d+)\s?U\b/i,
        /\b(\d+)\s?\bu\b/i,
        /\b(\d+)\s?\bU\b/i,
        /\b(\d+)\s?pcs\b/i,
        /\b(\d+)\s?PCS\b/i,  
        /\b(\d+)\s?pieces\b/i,
        /\b(\d+)\s?Pieces\b/i,
        /\b(\d+)\s?pack\b/i,
        /\b(\d+)\s?Pack\b/i,
        /\b(\d+)\s?packs\b/i,
        /\b(\d+)\s?Packs\b/i,
        /\b(\d+)\s?cajas\b/i,
        /\b(\d+)\s?Cajas\b/i,
        /\b(\d+)\s?set\b/i,
        /\b(\d+)\s?Set\b/i,        
        /\b(\d+)\s?sets\b/i,
        /\b(\d+)\s?Sets\b/i,
        /\b(\d+)x\b/i,
        /\b(\d+)X\b/i,
        /\bX\s?(\d+)\s?Un\b/i,
        /\bX\s?(\d+)\s?Uni\b/i,
        /\bX\s?(\d+)\s?Unidades\b/i
    ];

    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 1; // Si no se encuentra ninguna coincidencia, asumimos 1 unidad
}

function toggleMarkItem(item, checkbox) {
    const index = markedItems.findIndex(i => i.id === item.id);
    if (checkbox.checked && index === -1) {
        markedItems.push(item);
    } else if (!checkbox.checked && index !== -1) {
        markedItems.splice(index, 1);
    }
    updateCompareLink();
}

function isItemMarked(item) {
    return markedItems.some(i => i.id === item.id);
}

function updateCompareLink() {
    compareLink.style.display = markedItems.length > 0 ? 'block' : 'block';
}

function showComparisonPage() {
    appPage.style.display = 'none';
    comparisonPage.style.display = 'block';
    displayComparisonResults();
}

function showSearchPage() {
    appPage.style.display = 'block';
    comparisonPage.style.display = 'none';
    updateSearchPageCheckboxes();
}

function displayComparisonResults() {
    const comparisonResults = document.getElementById('comparisonResults');
    comparisonResults.innerHTML = '';

    markedItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';

        const units = extractUnitsFromTitle(item.title);
        const unitPrice = units > 0 ? (item.price / units).toFixed(2) : "N/A";

        div.innerHTML = `
            <input type="checkbox" class="item-checkbox" id="compare-${item.id}" checked>
            <label for="compare-${item.id}">
                <h3>${item.title}</h3>
                <img src="${item.thumbnail}" alt="${item.title}">
                <p>Precio Total: $${item.price.toFixed(2)}</p>
                <p>Precio Unitario: $${unitPrice}</p>
            </label>
        `;

        const checkbox = div.querySelector('.item-checkbox');
        checkbox.addEventListener('change', () => toggleMarkItem(item, checkbox));

        comparisonResults.appendChild(div);
    });
}

function updateSearchPageCheckboxes() {
    const searchResults = document.getElementById('results');
    const checkboxes = searchResults.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        const itemId = checkbox.id.split('-')[1];
        checkbox.checked = markedItems.some(item => item.id === itemId);
    });
}