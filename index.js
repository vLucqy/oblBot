const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Config از Environment Variables
const config = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    prefix: process.env.PREFIX || "!",
    verifyChannelId: process.env.VERIFY_CHANNEL_ID,
    staffChannelId: process.env.STAFF_CHANNEL_ID,
    verifiedRoleId: process.env.VERIFIED_ROLE_ID,
    verifyMessageId: process.env.VERIFY_MESSAGE_ID, // برای verify message
    voiceChannelId: process.env.VOICE_CHANNEL_ID    // برای 24/7 voice
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ],
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter(f => f.endsWith('.js')) : [];
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.name && command.execute) client.commands.set(command.name, command);
}

// Message Handler
client.on('messageCreate', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try { command.execute(message, args); }
    catch (err) { console.error(err); message.reply('Error executing command'); }
});

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.existsSync(eventsPath) ? fs.readdirSync(eventsPath).filter(f => f.endsWith('.js')) : [];
for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client, config));
    else client.on(event.name, (...args) => event.execute(...args, client, config));
}

// Login
client.login(config.token);
