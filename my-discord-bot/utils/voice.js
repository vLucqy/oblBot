const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('../config.json');

function connectToVoice(client) {
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) return console.log("❌ Guild not found!");

    const channel = guild.channels.cache.get(config.voiceChannelId);
    if (!channel) return console.log("❌ Voice channel not found!");

    try {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });
        console.log(`✅ Connected to voice channel: ${channel.name}`);
    } catch (err) {
        console.error("⚠️ Error connecting to voice:", err);
    }
}

module.exports = { connectToVoice };
