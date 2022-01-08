import fetch from "node-fetch";
const rub2btc = (rub = 0) =>{
    if (rub === 0)
        return 0

    fetch('https://api.cryptonator.com/api/full/rub-btc')
        .then(r=>r.json())
        .then(result=>{
            console.log(result)
        })
}

export default rub2btc
