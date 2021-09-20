import { search } from './search.js';

const rareTraits = [
    'Black Color', 'Sharp Bubble', 'Heart Bubble', 'Ghost Eyes','Ghost Mouth', 'Star Bubble'
];

const colors = [
    'White Color', 'Black Color', 'Purple Color', 'Red Color', 'Green Color',
    'Yellow Color', 'Blue Color', 'Pink Color'
];

const eyes = [
    'Ghost Eyes', 'Excited Eyes', 'Weird Eyes', 'Normal Eyes', 'Angry Eyes', 'Lazy Eyes', 'Happy Eyes'
];

const mouth = [
    'Ghost Mouth', 'Long Mouth','Smiling Mouth', 'Silly Mouth', 'Frowning Mouth',
    'Sad Open Mouth', 'Blank Mouth', 'Nervous Mouth'
];

const body = [
    'Round Body', 'Horned Body'
];

const bubble = [
    'Round Bubble', 'Sharp Bubble', 'Heart Bubble', 'Star Bubble'
];

const traits = [
    // Colors
    'White Color', 'Black Color', 'Purple Color', 'Red Color', 'Green Color',
    'Yellow Color', 'Blue Color', 'Pink Color',
    // Eyes
    'Ghost Eyes', 'Excited Eyes', 'Weird Eyes', 'Normal Eyes', 'Angry Eyes', 'Lazy Eyes', 'Happy Eyes',
    // Mouth
    'Ghost Mouth', 'Long Mouth','Smiling Mouth', 'Silly Mouth', 'Frowning Mouth',
    'Sad Open Mouth', 'Blank Mouth', 'Nervous Mouth',
    // Body
    'Round Body', 'Horned Body',
    // Normal
    'Round Bubble',
    // Extra
    'Sharp Bubble', 'Heart Bubble', 'Star Bubble'
];

const traitsContainer = document.getElementById('traits');
const resultsContainer = document.getElementById('results');
const searchBtn = document.getElementById('search');
const minPriceInput = document.getElementById('minprice');
const maxPriceInput = document.getElementById('maxprice');
const waiting = document.getElementById('waiting');
const rarities = document.getElementById('rarities');
const accessories = document.getElementById('accessories');

// traits containers
const colorTraits = document.getElementById('color-traits');
const eyeTraits = document.getElementById('eye-traits');
const mouthTraits = document.getElementById('mouth-traits');
const bodyTraits = document.getElementById('body-traits');
const bubbleTraits = document.getElementById('bubble-traits');

const spinner = document.createElement('wired-spinner');
spinner.spinning = true;

const traitsFragment = document.createDocumentFragment();
for (let trait of traits) {
    const checkbox = document.createElement('wired-checkbox');
    checkbox.classList.add('traits');
    if (rareTraits.includes(trait)) {
        checkbox.classList.add('rare');
    }
    checkbox.innerText = trait
    traitsFragment.appendChild(checkbox);
}

traitsContainer.appendChild(traitsFragment);

searchBtn.addEventListener('click', async () => {
    const values = [...document.querySelectorAll('.traits')].filter((x => x.checked)).map((a) => a.innerText);
    const rarityValues = [...rarities.querySelectorAll('wired-checkbox')].filter(x => x.checked).map((a) => a.innerText);
    const accessoryValues = [...accessories.querySelectorAll('wired-checkbox')].filter(x => x.checked).map((a) => a.innerText);
    const query = {
        pricemin: minPriceInput.value,
        pricemax: maxPriceInput.value,
        rarities: rarityValues,
        accessories: accessoryValues,
        traits: values
    };
    resultsContainer.innerHTML = '';
    waiting.appendChild(spinner);
    const results = await search(query);
    waiting.removeChild(spinner);
    slimeFactory(results);
});

function slimeFactory(results) {
    const fragment = document.createDocumentFragment();
    resultsContainer.innerHTML = `
        <h3>Total Results: ${results.length}</h3>
    `;
    for (let result of results) {
        const card = document.createElement('wired-card');
        const content = `
            <div class="card-content">
                <a href="https://www.cnft.io/token.php?id=${result.id}" target="_blank">
                    <wired-image class="slime" src="https://ipfs.blockfrost.dev/ipfs/${result.thumbnail}"></wired-image>
                </a>
                <div class="details">
                    Price: ${result.price/1000000} ada
                    <wired-divider></wired-divider>
                    Rarity: <label class="${result.rarity.toLowerCase()}">${result.rarity}</label>
                    <br />
                    Traits: ${result.traits.map((x) => {
                        return `
                            <label class="${rareTraits.includes(x) ? 'rare' : ''}">${x}</label>
                        `;
                    }).join(', ')}
                    <br />
                    <label class="${result.accessories.length ? 'accessories' : ''}">Accessories</label>:
                        ${result.accessories.length ? result.accessories.map((x) => {
                        return `<label>${x}</label>`
                    }).join(',') : 'None'}</label>
                </div>
            </div>
        `;
        card.innerHTML = content;
        fragment.appendChild(card);
    }
    resultsContainer.appendChild(fragment);
}
