import { Client, Intents } from 'discord.js'
import ticktick from 'ticktick-wrapper'
import moment from 'moment'
const { utc } = moment
import 'dotenv/config'

const TOKEN = process.env.TOKEN
const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

client.once('ready', () => {
    console.log('Bot Ready')
})

client.login(TOKEN)

let titles = {}
let dates = {}

const tickticktask = async () => {
    await ticktick.login({
        email: {
            username: EMAIL,
            password: PASSWORD,
        },
    })

    const tasks = await ticktick.tasks.getUncompleted()
    titles = tasks.map((t) => t.title)
    dates = tasks.map((t) => t.dueDate)
}

const timeLeft = (timeStr) => {
    let [hours, minutes] = timeStr.split(':')
    hours = parseInt(hours, 10)
    minutes = parseInt(minutes, 10)

    const time = new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    })

    let [nowHours, nowMinutes] = time.split(':')
    nowHours = parseInt(nowHours, 10)
    nowMinutes = parseInt(nowMinutes, 10)

    const today = `${nowHours}:${nowMinutes}`
    const timestr = `${hours}:${minutes}`
    const a = moment(today, 'hh:m')
    const b = moment(timestr, 'hh:m')
    const diffHours = b.diff(a, 'hours')
    const diffMinutes = b.diff(a, 'minutes')

    if (diffHours == 0) {
        return `${diffMinutes} ${diffMinutes == 1 ? 'Minute' : 'Minutes'}`
    } else {
        return `${diffHours} ${diffHours == 1 ? 'Hour' : 'Hours'}: ${diffMinutes - 60 * diffHours} ${diffMinutes == 1 ? 'Minute' : 'Minutes'}`
    }
}

const timeConverter = (timeStr) => {
    let [hours, minutes] = timeStr.split(':')
    hours = parseInt(hours, 10)

    const suffix = hours >= 12 ? 'PM' : 'AM'
    hours = ((hours + 11) % 12) + 1

    return `${hours}:${minutes}${suffix}`
}

const localtimechanger = (dateTime) => {
    let date = dateTime.match(/^.................../g)
    date = date[0].replace(/T/g, ' ')
    date = utc(date).format('YYYY-MM-DD HH:mm:ss')
    let time = utc(date).toDate()
    time = moment(time).local().format('YYYY-MM-DD HH:mm:ss')
    time = time.replace(/^.........../g, '')
    return time
}

tickticktask()

client.on('messageCreate', (msg) => {
    if (msg.content === '!task') {
        msg.channel.sendTyping()
        if (titles.length == 0) msg.channel.send('No Tasks for now!')
        else {
            for (let i = 0; i < titles.length; i++) {
                if (dates[i] == null) {
                    msg.channel.send(`${titles[i]}`)
                } else {
                    let time = localtimechanger(dates[i])
                    time = timeConverter(time)
                    msg.channel.send(`${titles[i]} \t ${dates[i].replace(/T.*/g, '')} \t ${time}`
                    )
                }
            }
        }
        msg.react('🕒')
    } else if (msg.content === '!timeleft') {
        msg.channel.sendTyping()

        let todateDate = new Date().toLocaleDateString()
        msg.channel.send(`Date today: ${todateDate}`)

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
                    let time = localtimechanger(dates[i])
                    time = timeConverter(time)

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
