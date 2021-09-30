let assets = [];
let page = 1;
const cnftUrl = 'https://api.cnft.io/market/listings';

export async function search({ pricemin, pricemax, traits, rarities, accessories }) {
    return new Promise((resolve) => {
        let pass = 0;

        async function fetchData(queryPage) {
            const query = {
                search: 'acedcd940e1dbb6d774b6504eddc03bcbae50d6cebb2099e99f68d26',
                // search: '',
                // project: 'AdaSlime',
                sort: 'date',
                order: 'desc',
                pricemin,
                pricemax,
                page: queryPage,
                // verified: false
            };
            
            let formBody = [];
            for (let p in query) {
                let encodedKey = encodeURIComponent(p);
                let encodedValue = encodeURIComponent(query[p]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            
            formBody = formBody.join("&");
            const response = await fetch(cnftUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: formBody
            });
            const data = await response.json();
            return data;
        }

        async function findNFTs() {
            const data = await fetchData(page);
            assets = [...assets, ...data.assets];
            if (pass === 0 && data.found > 25) {
                pass = 1;
                const totalPages = Math.ceil(data.found/25) - 1;
                assets = [...assets, ...data.assets];
                let promises = [];
                for (let i = 0; i <= totalPages; i++) {
                    page = page + 1;
                    promises.push(fetchData(page));
                }
                const results = await Promise.all(promises);
                assets = results.reduce((a, b) => {
                    return [...a, ...b.assets];
                }, assets);
            }

            const values = assets.filter((x) => x.sold === false)
            let valid = values.filter((x) => {
                const { rarity } = x.metadata.tags.find((a) => a.rarity);
                return rarities.includes(rarity);
            })

            if (traits.length) {
                valid = valid.filter((x) => {
                    const valueTraits = x.metadata.tags.find(a => a.traits);
                    return valueTraits.traits.some((a) => traits.includes(a));
                })
            }

            if (accessories.length) {
                valid = valid.filter((x) => {
                    const accessoriesValues = x.metadata.tags.find((a) => a.accessories);
                    return accessoriesValues?.accessories.some((a) => accessories.includes(a));
                })
            }

            const results =
                valid.sort((a, b) => a.price < b.price ? -1 : 1).map((x) => resultFactory(x, traits))
            page = 1;
            assets = [];
            resolve(results);
        }

        findNFTs();
    });
}

function resultFactory(result, traits) {
    const valueTraits = result.metadata.tags.find(a => a.traits);
    const valueAccessories = result.metadata.tags.find(a => a.accessories);
    const goodTraits = valueTraits.traits.reduce((a, b) => {
        if (traits.includes(b)) {
            return a + 1;
        } else {
            return a;
        }
    }, 0);
    const { rarity } = result.metadata.tags.find((x) => x.rarity);
    return {
        id: result.id,
        price: result.price,
        name: result.metadata.name,
        rarity,
        rareTraits: goodTraits,
        traits: valueTraits.traits,
        accessories: valueAccessories ? valueAccessories.accessories : [],
        thumbnail: result.metadata.thumbnail.replace('ipfs://', '')
    };
}
