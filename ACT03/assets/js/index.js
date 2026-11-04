// Data Dragon version and champion-list endpoint.
const version = '16.21.1';
const api = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;

// Read the requested page from the URL.
const urlParams = new URLSearchParams(window.location.search);
var page = Number(urlParams.get('page')) || 1;
var perPageLoad = 20;
var totalChampions = 0;
var lastPage = 1;

// Page elements used by the functions below.
var elParent = document.getElementById("parent");
var elPagination = document.getElementById("pagination");
var elPaginationNav = document.getElementById("paginationNav");

// Search elements and variables.
var allChampions = [];
var filteredChampions = [];
var isSearching = false;

var elSearchForm = document.getElementById("searchForm");
var elSearchInput = document.getElementById("searchInput");

function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Build the Prev, page-number, and Next controls.
function renderPagination() {

    var startPage = Math.max(1, Math.min(page, lastPage - 4));
    var endPage = Math.min(startPage + 4, lastPage);

    var paginationHTML = `
<li class="page-item">
    <a class="page-link" href="#" onclick="prev(); return false;">Prev</a>
</li>
`;

    // Previous ellipsis
    if (startPage > 1) {
        paginationHTML += `
    <li class="page-item disabled">
        <span class="page-link page-ellipsis">...</span>
    </li>
`;
    }

    // Page numbers
    for (var i = startPage; i <= endPage; i++) {
        paginationHTML += `
    <li class="page-item ${i === page ? 'active' : ''}">
        <a class="page-link" href="#" onclick="goToPage(${i}); return false;">
            ${i}
        </a>
    </li>
`;
    }

    // Next ellipsis
    if (endPage < lastPage) {
        paginationHTML += `
    <li class="page-item disabled">
        <span class="page-link page-ellipsis">...</span>
    </li>
`;
    }

    paginationHTML += `
<li class="page-item">
    <a class="page-link" href="#" onclick="next(); return false;">Next</a>
</li>
`;

    elPagination.innerHTML = paginationHTML;
}


// Get the champion list, sort it, then display only the current page.
const getChampions = async () => {
    elParent.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-light"></div>
            <div class="mt-2 text-secondary">Loading champions...</div>
        </div>
    `;

    try {
        var response = await fetch(api);
        if (!response.ok) throw new Error('Champion list request failed.');

        var result = await response.json();

        allChampions = Object.values(result.data);
        allChampions.sort((a, b) => a.name.localeCompare(b.name));

        // Use filtered champions when searching.
        var champions = isSearching ? filteredChampions : allChampions;

        totalChampions = champions.length;
        lastPage = Math.ceil(totalChampions / perPageLoad);

        if (lastPage < 1) lastPage = 1;
        if (page < 1 || page > lastPage) page = 1;

        elParent.innerHTML = '';

        // Hide pagination when searching.
        if (isSearching) {
            elPaginationNav.classList.remove('show');
            elPagination.innerHTML = '';
        } else {
            renderPagination();
        }

        // Display message when no champions are found.
        if (champions.length === 0) {
            elParent.innerHTML = `
                <div class="col-12 text-center text-secondary py-5">
                    No champions found.
                </div>
            `;
            return;
        }

        var start = perPageLoad * (page - 1);
        var end = Math.min(start + perPageLoad, totalChampions);

        for (var i = start; i < end; i++) {
            var champion = champions[i];
            var id = champion.id;
            var name = champion.name;
            var title = champion.title;
            var tags = champion.tags;

            var picture = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`;

            elParent.innerHTML += `
                <div class="col-12 col-md-6">
                    <a href="vw_champion.html?id=${encodeURIComponent(id)}&page=${page}"
                        class="text-decoration-none text-dark">
                        <div class="card shadow-sm rounded-4">
                            <div class="row g-0 h-100">
                                <div class="col-5 d-flex flex-column justify-content-center align-items-end champ-name p-2">
                                    <div class="h1 text-end mb-2">${capitalizeFirstLetter(name)}</div>
                                    <div class="small text-secondary text-end">${capitalizeFirstLetter(title)}</div>
                                    <div class="small text-secondary text-end mt-2">${tags.join(' / ')}</div>
                                </div>

                                <div class="col-7 p-0 position-relative overflow-hidden">
                                    <div class="champ-image-shadow"></div>
                                    <img src="${picture}" class="w-100 h-100 champ-image" alt="${name}">
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }

        // Keep the current page in the address bar.
        if (!isSearching) {
            window.history.replaceState(null, '', '?page=' + page);
        }

    } catch (error) {
        elParent.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                Failed to load champions. Please try again.
            </div>
        `;
        console.error('API Error:', error);
    }
};

// Search champions by name or role.
elSearchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var searchValue = elSearchInput.value.trim().toLowerCase();

    // Empty search displays all champions.
    if (searchValue === '') {
        isSearching = false;
        filteredChampions = [];
        page = 1;
        getChampions();
        return;
    }

    // Filter by champion name or role.
    filteredChampions = allChampions.filter(champion =>
        champion.name.toLowerCase().includes(searchValue) ||
        champion.tags.some(role => role.toLowerCase().includes(searchValue))
    );

    isSearching = true;
    page = 1;

    getChampions();
});

// Show pagination only when the bottom trigger is visible.
const paginationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            elPaginationNav.classList.add('show');
        } else {
            elPaginationNav.classList.remove('show');
        }
    });
}, { threshold: 0 });

paginationObserver.observe(document.getElementById("paginationTrigger"));

function goToPage(number) {
    if (isSearching) return;

    page = number;
    getChampions();
}

// Previous Page
function prev() {
    if (isSearching) return;

    page -= 1;

    if (page < 1) {
        page = lastPage;
    }

    getChampions();
}

// Next Page
function next() {
    if (isSearching) return;

    page += 1;

    if (page > lastPage) {
        page = 1;
    }

    getChampions();
}

// Initial page load.
getChampions();