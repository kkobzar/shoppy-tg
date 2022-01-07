/*
* TODO: menu from json && Menu validation
* TODO: btc payment
* TODO: yoomoney payment
* */
import {Telegraf, Markup} from 'telegraf'
import 'dotenv/config';
import store from 'store2'
import fs from 'fs';

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


}

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

bot.help((ctx) => ctx.reply('Contacts: @d33kei'))
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
        ctx.deleteMessage()
        store(ctx.chat.id,{city:cty})
        if (menu){
            menu.push([homeBnt])
            ctx.reply('Выбирай:',Markup.inlineKeyboard(menu))
        }else {
            ctx.reply('К сожалению в данном регионе нихуя нэма 😢', Markup.inlineKeyboard([homeBnt]))
        }
    })
}

//--- Products order bind

for (let prod of productList){
    console.log(prod)
    bot.action(prod,ctx=>{
        if (store.has(ctx.chat.id) && store.get(ctx.chat.id).city){
            ctx.deleteMessage()
            ctx.reply(`User id: ${ctx.chat.id}\nCity: ${store.get(ctx.chat.id).city} \nPay now`)
        }else {
            ctx.sendMessage(ctx.chat.id,'Ой...  Выберите город')
            showCityMenu(ctx)
        }
    })
}

bot.action('xtc-1',ctx=>{
    if (store.has(ctx.chat.id) && store.get(ctx.chat.id).city){
        ctx.deleteMessage()
        ctx.reply(`User id: ${ctx.chat.id}\nCity: ${store.get(ctx.chat.id).city} \nPay now`)
    }else {
        ctx.sendMessage(ctx.chat.id,'Ой...  Выберите город')
        showCityMenu(ctx)
    }
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
