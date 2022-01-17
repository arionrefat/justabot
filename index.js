const { Client, Intents } = require('discord.js')
const { token, email, passwords } = require('./config.json')
const ticktick = require('ticktick-wrapper')

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
    if (msg.content === '!task') {
        msg.channel.sendTyping()

        if (titles.length == 0) msg.channel.send("No Tasks for now!")
        else{
            for (let i = 0; i < titles.length; i++) {
                if (dates[i] == null){
                    msg.channel.send(`${titles[i]}`)
                }
                else {
                    msg.channel.send(`${titles[i]} \t\t ${dates[i].replace(/T.*/g, '')}`)
                }
            }
        }
        msg.react('❤️')
    }
    else if (msg.content === '!update'){
        tickticktask()
        msg.react('👍')
        msg.channel.send("Done")
    }
    else if (msg.content === "!info"){
        msg.react('😘')
        msg.channel.send("https://github.com/arionrefat/justabot")
    }
})
