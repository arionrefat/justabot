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

        let time = new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        })

        let [nowHours, nowMinutes] = time.split(':')
        nowHours = parseInt(nowHours, 10)
        nowMinutes = parseInt(nowMinutes, 10)

        let today = `${nowHours}:${nowMinutes}`
        let like = `${hours}:${minutes}`
        let a = moment(today, 'hh:m')
        let b = moment(like, 'hh:m')
        let diffHours = b.diff(a, 'hours')
        let diffMinutes = b.diff(a, 'minutes')

        if (diffHours == 0) {
            return `${diffMinutes} ${diffMinutes == 1 ? 'Minute' : 'Minutes'}`
        } else {
            return `${diffHours} ${diffHours == 1 ? 'Hour' : 'Hours'}: ${diffMinutes - 60 * diffHours} ${diffMinutes == 1 ? 'Minute' : 'Minutes'}`
        }
    }

    if (msg.content === '!task') {
        msg.channel.sendTyping()
        if (titles.length == 0) msg.channel.send('No Tasks for now!')
        else {
            for (let i = 0; i < titles.length; i++) {
                if (dates[i] == null) {
                    msg.channel.send(`${titles[i]}`)
                } else {
                    let date = dates[i].match(/^.................../g)
                    date = date[0].replace(/T/g, ' ')
                    date = moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
                    let time = moment.utc(date).toDate();
                    time = moment(time).local().format('YYYY-MM-DD HH:mm:ss');
                    time = time.replace(/^.........../g, '');
                    time = timeConverter(time)

                    msg.channel.send(`${titles[i]} \t ${dates[i].replace(/T.*/g, '')} \t ${time}`)
                }
            }
        }
        msg.react('🕒')
    } else if (msg.content === '!timeleft') {
        msg.channel.sendTyping()

        let todateDate = new Date().toLocaleDateString()

        let timeNow = new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        })

        msg.channel.send(`Date and time today: ${todateDate} \t ${timeNow}`)

        if (titles.length == 0) msg.channel.send('No Tasks for now!')
        else {
            for (let i = 0; i < titles.length; i++) {
                if (dates[i] == null) {
                    msg.channel.send(`${titles[i]}`)
                } else {
                    let today = new Date().toLocaleDateString()
                    let date = dates[i].replace(/T.*/g, '')
                    let a = moment(today, 'M/DD/YYYY')
                    let b = moment(date, 'YYYY-M-D')
                    let diffDays = b.diff(a, 'days')

                    date = dates[i].match(/^.................../g)
                    date = date[0].replace(/T/g, ' ')
                    date = moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
                    let time = moment.utc(date).toDate();
                    time = moment(time).local().format('YYYY-MM-DD HH:mm:ss');
                    time = time.replace(/^.........../g, '');
                    time = time.match(/^...../g)

                    if (diffDays == 0) {
                        let timeleft = timeLeft(time[0])
                        msg.channel.send(`${titles[i]} \t ${dates[i].replace(/T.*/g, '')} \t ${timeleft} left`)
                    } else {
                        msg.channel.send(`${titles[i]} \t ${dates[i].replace(/T.*/g, '')} \t ${diffDays} ${diffDays == 1 ? 'Day' : 'Days'} left`)
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
