// Use the same Data Dragon version as the champion list page.
const version = '16.21.1';
const baseURL = `https://ddragon.leagueoflegends.com/cdn/${version}`;
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const page = Number(urlParams.get('page')) || 1;

// Page elements.
var elHero = document.getElementById("championHero");
var elName = document.getElementById("championName");
var elTitle = document.getElementById("championTitle");
var elLore = document.getElementById("championLore");
var elAbilities = document.getElementById("abilities");
var elBacklink = document.getElementById("backlink");

// Return to the same list page the user came from.
elBacklink.href = `index.html?page=${page}`;

// Load one champion's full data, including passive and spells.
const getChampion = async (championId) => {
    if (!championId) {
        elName.textContent = 'Champion not found';
        elTitle.textContent = '';
        elLore.textContent = 'No champion ID was provided in the URL.';
        elAbilities.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${baseURL}/data/en_US/champion/${encodeURIComponent(championId)}.json`);
        if (!response.ok) throw new Error('Champion detail request failed.');

        const result = await response.json();
        const champion = result.data[championId];

        if (!champion) throw new Error('Champion was not found in the API response.');

        // Use Data Dragon's splash art and champion information in the hero.
        elHero.style.backgroundImage =
            `url("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg")`;
        elName.textContent = champion.name;
        elTitle.textContent = champion.title;
        elLore.textContent = champion.lore || champion.blurb || '';

        var abilities = [
            {
                name: champion.passive.name,
                description: champion.passive.description,
                image: champion.passive.image.full,
                imageFolder: 'passive',
                type: 'PASSIVE'
            },

            ...champion.spells.map((spell, index) => ({
                name: spell.name,
                description: spell.description,
                cooldown: spell.cooldownBurn,
                range: spell.rangeBurn,
                cost: spell.costBurn,
                image: spell.image.full,
                imageFolder: 'spell',
                type: ['Q - Q', 'W - W', 'E - E', 'R - R'][index]
            }))
        ];

        elAbilities.innerHTML = '';

        abilities.forEach(ability => {
            var imageURL = `${baseURL}/img/${ability.imageFolder}/${ability.image}`;

            elAbilities.innerHTML += `
                <div class="col-6 col-sm-4 col-md text-center">
                    <div class="ability-card d-flex flex-column align-items-center gap-3"
                        tabindex="0"
                        role="button"
                        aria-expanded="false">

                        <img src="${imageURL}"
                            class="ability-image"
                            alt="${ability.name}">

                        <div class="ability-name">
                            ${ability.name}
                        </div>

                        <div class="ability-info">

                            <div class="small text-secondary mb-2">
                                ${ability.type}
                            </div>

                            <h6>${ability.name}</h6>

                            <div class="ability-description">
                                ${ability.description || 'No description available.'}
                            </div>

                            <div class="ability-stats">

                                ${ability.cooldown ?
                    `<div>Cooldown: <span>${ability.cooldown}s</span></div>` : ''}

                                ${ability.range ?
                    `<div>Range: <span>${ability.range}</span></div>` : ''}

                                ${ability.cost ?
                    `<div>Cost: <span>${ability.cost}</span></div>` : ''}

                            </div>
                        </div>

                    </div>
                </div>
            `;
        });

        // Ability popup interactions.
        var abilityCards = document.querySelectorAll('.ability-card');

        abilityCards.forEach(card => {

            // Show details when hovering.
            card.addEventListener('mouseenter', () => {
                card.classList.add('show');
                card.setAttribute('aria-expanded', 'true');
            });

            // Hide details when the mouse leaves.
            card.addEventListener('mouseleave', () => {
                card.classList.remove('show');
                card.setAttribute('aria-expanded', 'false');
            });

            // Show or hide details when clicked.
            card.addEventListener('click', () => {

                var isOpen = card.classList.contains('show');

                // Close other ability popups.
                abilityCards.forEach(other => {
                    other.classList.remove('show');
                    other.setAttribute('aria-expanded', 'false');
                });

                // Toggle the selected ability.
                if (!isOpen) {
                    card.classList.add('show');
                    card.setAttribute('aria-expanded', 'true');
                }
            });

            // Keyboard accessibility.
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    card.click();
                }
            });

        });

        // Close popup when clicking outside.
        document.addEventListener('click', event => {
            if (!event.target.closest('.ability-card')) {
                abilityCards.forEach(card => {
                    card.classList.remove('show');
                    card.setAttribute('aria-expanded', 'false');
                });
            }
        });

        document.title = `${champion.name} | League of Legends`;

    } catch (error) {
        elName.textContent = 'Unable to load champion';
        elTitle.textContent = '';
        elLore.textContent = 'Please check your connection and try again.';
        elAbilities.innerHTML = `
            <div class="col-12 text-center text-danger">
                Failed to load champion abilities.
            </div>
        `;
        console.error('API Error:', error);
    }
};

// Start loading the selected champion.
getChampion(id);