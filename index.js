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

//--- City menu
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

//--- Product menu

function getMenu(city = '') {
    if (!city)
        return false;

    let productMenuArr = []

    if (menu.products){
        for (let cty in menu.products){
            if (cty === city){
                for (let prod in menu.products[cty]){
                    //console.log(menu.products[cty][prod].title)
                    //console.log(cty)
                    //console.log(prod)
                    productMenuArr.push([Markup.button.callback(menu.products[cty][prod].title, prod)])
                }
                //console.log(menu.products)
            }
        }
    }
    //console.log(productMenuArr)

    if (productMenuArr.length){
        return productMenuArr
    }else {
        return false
    }
}


const bot = new Telegraf(process.env.BOT_TOKEN)

//dev storage clear out on restart
store(false)
//===


bot.start((ctx) => {
    showCityMenu(ctx)
})
bot.help((ctx) => ctx.reply('Help message'))
bot.on('message', (ctx) => ctx.telegram.sendMessage(ctx.message.chat.id, ctx.message))
bot.action('delete', (ctx) => ctx.deleteMessage())
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
