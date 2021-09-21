let assets = [];
let page = 1;
const cnftUrl = 'https://api.cnft.io/market/listings';

export async function search({ pricemin, pricemax, traits, rarities, accessories }) {
    return new Promise((resolve) => {
        async function findSlimes() {
            const query = {
                search: 'acedcd940e1dbb6d774b6504eddc03bcbae50d6cebb2099e99f68d26',
                sort: 'date',
                order: 'desc',
                pricemin,
                pricemax,
                page
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
            console.log('page number', page);
            assets = [...assets, ...data.assets];
            if (data.assets.length < 1) {
                console.log('done', assets.length);
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
        
            } else {
                page = page + 1;
                findSlimes(traits)
            }
        }

        findSlimes();
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