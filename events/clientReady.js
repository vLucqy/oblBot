const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    name: 'clientReady',
    once: true,
    execute: async (client) => {
        console.log(`✅ Logged in as ${client.user.tag}`);

        // ===== Set Status =====
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (guild) {
            const updateStatus = () => {
                client.user.setActivity(`${guild.memberCount} members`, { type: ActivityType.Watching });
            };
            updateStatus();
            setInterval(updateStatus, 10 * 60 * 1000);
        }

        // ===== Join Voice 24/7 =====
        try {
            const voiceChannel = await client.channels.fetch(process.env.VOICE_CHANNEL_ID);
            if (voiceChannel && voiceChannel.isVoiceBased()) {
                joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: process.env.GUILD_ID,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: false
                });
                console.log(`✅ Connected to voice channel: ${voiceChannel.name}`);
            } else {
                console.log('❌ Voice channel not found or not a voice channel');
            }
        } catch (err) {
            console.log('❌ Error joining voice channel:', err);
        }

        // ===== Verify Button =====
        try {
            const verifyChannel = await client.channels.fetch(process.env.VERIFY_CHANNEL_ID);
            if (!verifyChannel) return console.log('❌ Verify channel not found');

            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Primary)
            );

            let message;
            if (process.env.VERIFY_MESSAGE_ID) {
                try {
                    message = await verifyChannel.messages.fetch(process.env.VERIFY_MESSAGE_ID);
                } catch {}
            }

            if (!message) {
                message = await verifyChannel.send({
                    content: 'Click the button below to verify yourself:',
                    components: [buttonRow]
                });
                console.log(`✅ Verify message sent. ID: ${message.id}`);
            } else {
                await message.edit({ components: [buttonRow] }).catch(() => {});
                console.log('✅ Verify button attached to existing message!');
            }
        } catch (err) {
            console.log('❌ Error sending verify message:', err);
        }
    }
};
