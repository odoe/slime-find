import { search } from './search.js';

const traits = [
    'Sharp Bubble', 'Heart Bubble', 'Ghost Eyes','Ghost Mouth', 'Black Color', 'Star Bubble'
];

const traitsContainer = document.getElementById('traits');
const resultsContainer = document.getElementById('results');
const searchBtn = document.getElementById('search');
const minPriceInput = document.getElementById('minprice');
const maxPriceInput = document.getElementById('maxprice');
const waiting = document.getElementById('waiting');

const spinner = document.createElement('wired-spinner');
spinner.spinning = true;

const traitsFragment = document.createDocumentFragment();
for (let trait of traits) {
    const checkbox = document.createElement('wired-checkbox');
    checkbox.classList.add('traits')
    checkbox.innerText = trait
    checkbox.checked = true;
    traitsFragment.appendChild(checkbox);
}

traitsContainer.appendChild(traitsFragment);

searchBtn.addEventListener('click', async () => {
    const values = [...document.querySelectorAll('.traits')].filter((x => x.checked)).map((a) => a.innerText);
    const query = {
        pricemin: minPriceInput.value,
        pricemax: maxPriceInput.value,
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
            <div>
                <wired-link href="${result.id}" target="_blank">${result.id}</wired-link>
                <br />
                Price: ${result.price/1000000} ada
                <hr />
                Rare Traits: ${result.traits.map((x) => {
                    return `
                        <label class="${traits.includes(x) ? 'rare' : ''}">${x}</label>
                    `;
                }).join(', ')}
                <br />
            </div>
        `;
        card.innerHTML = content;
        fragment.appendChild(card);
    }
    resultsContainer.appendChild(fragment);
}
