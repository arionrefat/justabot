const { Client, Intents } = require('discord.js')
const { token, email, passwords } = require('./config.json')
const ticktick = require('ticktick-wrapper')
const moment = require('moment')

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

client.once('ready', () => {
    console.log('Bot Ready')
})

client.login(token)

const tickticktask = async () => {
    await ticktick.login({
        email: {
            username: email,
            password: passwords,
        },
    })
    const tasks = await ticktick.tasks.getUncompleted()
    titles = tasks.map((t) => t.title)
    dates = tasks.map((t) => t.dueDate)
}

tickticktask()

client.on('messageCreate', (msg) => {
    const addSix = (timeStr) => {
        const sixthhour = 6
        const [hours, minutes] = timeStr.split(':')
        hours = parseInt(hours, 10)

        if (hours + sixthhour == 24) {
            hours = '00'
        } else if (hours > 18) {
            hours = sixthhour - (24 - hours)
        } else {
            hours = hours + sixthhour
        }

        return `${hours}:${minutes}`
    }

    const timeConverter = (timeStr) => {
        let [hours, minutes] = timeStr.split(':')
        hours = parseInt(hours, 10)

        const suffix = hours >= 12 ? 'PM' : 'AM'
        hours = ((hours + 11) % 12) + 1

        return `${hours}:${minutes}${suffix}`
    }

    const timeLeft = (timeStr) => {
        let [hours, minutes] = timeStr.split(':')
        hours = parseInt(hours, 10)
        minutes = parseInt(minutes, 10)

        return `${24 - hours}:${60 - minutes}`
    }

    if (msg.content === '!task') {
        msg.channel.sendTyping()
        if (titles.length == 0) msg.channel.send('No Tasks for now!')
        else {
            for (let i = 0; i < titles.length; i++) {
                if (dates[i] == null) {
                    msg.channel.send(`${titles[i]}`)
                } else {
                    time = dates[i].match(/T...../g)
                    time = timeConverter(addSix(time[0].replace(/T/g, '')))
                    msg.channel.send( `${titles[i]} \t ${dates[i].replace(/T.*/g, '')} \t ${time}`)
                }
            }
        }
        msg.react('🕒')
    } else if (msg.content === '!timeleft') {
        msg.channel.sendTyping()
        if (titles.length == 0) msg.channel.send('No Tasks for now!')
        else {
            for (let i = 0; i < titles.length; i++) {
                if (dates[i] == null) {
                    msg.channel.send(`${titles[i]}`)
                } else {
                    const dateOS = new Date()
                    let today = dateOS.getFullYear() + '-' + (dateOS.getMonth() + 1) + '-' + dateOS.getDate()
                    todayDate = today.replace(/T.*/g, '')
                    date = dates[i].replace(/T.*/g, '')
                    let a = moment(todayDate,'YYYY-M-D');
                    let b = moment(date,'YYYY-M-D');
                    let diffDays = b.diff(a, 'days');

                    if (diffDays == 0) {
                        time = dates[i].match(/T...../g)
                        let timeleft = timeLeft( addSix(time[0].replace(/T/g, '')))
                        msg.channel.send( `${titles[i]} \t ${dates[i].replace( /T.*/g, '')} \t ${timeleft} Hours left`)
                    } else {
                        msg.channel.send( `${titles[i]} \t ${dates[i].replace( /T.*/g, '')} \t ${diffDays} Days left`)
                    }
                }
            }
        }
        msg.react('😱')
    } else if (msg.content === '!update') {
        tickticktask()
        msg.react('👍')
        msg.channel.send('Done')
    } else if (msg.content === '!helprefat') {
        msg.react('😘')
        msg.channel.send('!task - show tasks')
        msg.channel.send('!timeleft - show remaining time')
        msg.channel.send('!update - update tasks')
        msg.channel.send('https://github.com/arionrefat/justabot')
    }
})
