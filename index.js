/*
* TODO: menu from json && Menu validation
* TODO: btc payment
* TODO: yoomoney payment
* */
import {Telegraf, Markup} from 'telegraf'
import 'dotenv/config';
import store from 'store2'
import fs from 'fs';
import convertor from "./convertor.js";

if (process.env.BOT_TOKEN === undefined) {
    throw new TypeError('BOT_TOKEN must be provided!')
}

//---home button

const homeBnt = Markup.button.callback('🏡 Главная', 'main')

//---read menu
let menu = null
try{
    const menuFile = fs.readFileSync('./menu.json')

    menu = JSON.parse(menuFile)
}catch (e) {
    throw new TypeError(e)
}

//---get all products list
let productList = []
for (let cty in menu.products){
    if (!Object.entries(menu.products[cty]).length){
        continue;
    }
    for(let prod in menu.products[cty]){
        if (!productList.includes(prod)){
            productList.push(prod)
        }
    }
}

//---Get product info
function getProductInfo(city = '', product = '') {
    if (!city || !product)
        return false

    let foundProduct = false
    if (menu.products){
        for (let cty in menu.products){
            if(cty === city){
                for (let prd in menu.products[cty]){
                    if (product === prd){
                        foundProduct = menu.products[cty][prd]
                    }
                }
            }
        }
    }

    return foundProduct
}
//---Get product available areas
function getProductArea(city = '', product = '',ctx=null){
    if (!city || !product || ctx === null)
        return false

    let areasBtn = []
    //get available areas for product
    if (product.areas.length && menu.cities[store.get(ctx.chat.id).city]){
        for (let area of product.areas){
            let name = menu.cities[store.get(ctx.chat.id).city].districts.find(i=>i.key === area)
            console.log(name)
            areasBtn.push([Markup.button.callback(name.title,name.key)])
        }
    }

    if (areasBtn.length){
        areasBtn.push([homeBnt])
        return areasBtn
    }else {
        return false
    }
}

//---Get all districts

let districts =[]

for (let cty in menu.cities){
    for (let dstrct in menu.cities[cty].districts){
        //if (!districts.includes(menu.cities[cty].districts[dstrct].key)){
            districts.push(menu.cities[cty].districts[dstrct])
        //}
    }
}
//console.log(districts)

/*
*
* ---CITY MENU
*
* */

let citiesMenuArr = []

if (menu.cities){
    for (let city in menu.cities){
        if(menu.cities[city].title){
            citiesMenuArr.push([Markup.button.callback(menu.cities[city].title, city)])
        }else {
            citiesMenuArr.push([Markup.button.callback('No title', city)])
        }
    }
}

const cityMenu = Markup.inlineKeyboard(citiesMenuArr)

function showCityMenu(ctx) {
    ctx.reply(`Hello, ${ctx.chat.id}! \nChoose your city:`,cityMenu)
}

function showProductMenu(ctx,mnu){
    ctx.deleteMessage()
    if (mnu){
        ctx.reply('Выбирай:',Markup.inlineKeyboard(mnu))
    }else {
        ctx.reply('К сожалению в данном регионе нихуя нэма 😢', Markup.inlineKeyboard([homeBnt]))
    }
}

/*
* ---END CITY MENU
* */

/*
*
* ---PRODUCT MENU
*
* */

function getMenu(city = '') {
    if (!city)
        return false;

    let productMenuArr = []

    if (menu.products){
        for (let cty in menu.products){
            //if city index is same as param get all products
            if (cty === city){
                for (let prod in menu.products[cty]){
                    // check if product name is provided
                    if (menu.products[cty][prod].title === undefined){
                        productMenuArr.push([Markup.button.callback('🔞🥶🥵', prod)])
                    }else {
                        productMenuArr.push([Markup.button.callback(menu.products[cty][prod].title, prod)])
                    }
                }
            }
        }
    }

    if (productMenuArr.length){
        productMenuArr.push([homeBnt])
        return productMenuArr
    }else {
        return false
    }
}

/*
* ---END PRODUCT MENU
* */

const bot = new Telegraf(process.env.BOT_TOKEN)

//dev storage clear out on restart
store(false)
//===


bot.start((ctx) => {
    showCityMenu(ctx)
})

bot.help((ctx) => ctx.reply('( ͡° ͜ʖ ͡°)'))
bot.on('message', (ctx) => ctx.telegram.sendMessage(ctx.message.chat.id, ctx.message))
bot.action('delete', (ctx) => ctx.deleteMessage())

//---HOME BUTTON
bot.action('main', (ctx) => {
    ctx.deleteMessage()
    store(ctx.chat.id,false)
    showCityMenu(ctx)
})

//--- City available products bind
for (let cty in menu.cities){
    let menu = getMenu(cty)
    bot.action(cty,ctx=>{
        store(ctx.chat.id,{city:cty})
        showProductMenu(ctx,menu)
    })
}

//--- Products order bind

for (let prod of productList){
    bot.action(prod,ctx=>{
        if (store.has(ctx.chat.id) && store.get(ctx.chat.id).city){
            const product = getProductInfo(store.get(ctx.chat.id).city,prod)
            if (product){
                ctx.deleteMessage()
                //save product to local storage
                store.add(ctx.chat.id,{product:prod})
                //get areas
                const areaButtons = getProductArea(store.get(ctx.chat.id).city,product,ctx)
                if (areaButtons){
                    ctx.reply(`User id: ${ctx.chat.id}\nCity: ${store.get(ctx.chat.id).city} \n${product.content?product.content:''}\n`,Markup.inlineKeyboard(areaButtons))
                }else {
                    ctx.reply(`User id: ${ctx.chat.id}\nCity: ${store.get(ctx.chat.id).city} \n${product.content?product.content:''}\n`,Markup.inlineKeyboard([homeBnt]))
                }
            }
        }else {
            ctx.deleteMessage()
            //ctx.sendMessage(ctx.chat.id,'Ой...  Выберите город')
            showCityMenu(ctx)
        }
    })
}

/*
*
* CITY AREA BIND
*
* */
for (let area of districts){
    bot.action(area.key,ctx=>{
        if (!store.get(ctx.chat.id) || typeof store.get(ctx.chat.id).city === 'undefined'){
            showCityMenu(ctx)
            return
        }
        if (typeof store.get(ctx.chat.id).product === 'undefined' || !store.get(ctx.chat.id).product){
            showProductMenu(ctx,getMenu(store.get(ctx.chat.id).city))
            return
        }
        //console.log(convertor(1500))
    })
}


/*
*
* PAYMENT ( ͡° ͜ʖ ͡°)
*
* */

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
