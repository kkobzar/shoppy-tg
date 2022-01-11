import fetch from "node-fetch";

function rub2btc(rub = 0){
    if (rub === 0)
        return 0

    return new Promise((resolve, reject)=>{
        fetch('https://api.cryptonator.com/api/full/rub-btc')
            .then(r=>r.json())
            .then(result=>{
                if (!result.success){
                    reject('api error')
                }
                let res = result.ticker.price * rub;
                //return res.toFixed(7);
                resolve(res.toFixed(7))
            })
    })
}

export function rub2xlm(rub=0){
    if (rub === 0)
        return 0

    return new Promise((resolve, reject)=>{
        fetch('https://api.cryptonator.com/api/full/rub-xlm')
            .then(r=>r.json())
            .then(result=>{
                if (!result.success){
                    reject('api error')
                }
                let res = result.ticker.price * rub;
                resolve(res.toFixed(7))
            })
    })
}

const convertor = {
    rub2btc,
    rub2xlm
}

export default convertor

/*export function rub2btc(rub = 0){
    if (rub === 0)
        return 0

    return new Promise((resolve, reject)=>{
        fetch('https://api.cryptonator.com/api/full/rub-btc')
            .then(r=>r.json())
            .then(result=>{
                if (!result.success){
                    reject('api error')
                }
                let res = result.ticker.price * rub;
                //return res.toFixed(7);
                resolve(res.toFixed(7))
            })
    })
}*/

/*export function rub2xml(rub=0){
    if (rub === 0)
        return 0

    return new Promise((resolve, reject)=>{

    })
}*/
