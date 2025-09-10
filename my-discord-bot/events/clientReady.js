const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('../config.json');

module.exports = {
    name: 'clientReady',
    once: true,
    execute: async (client) => {
        console.log(`✅ Logged in as ${client.user.tag}`);

        // ===== Set Status =====
        const guild = client.guilds.cache.get(config.guildId);
        if (guild) {
            const updateStatus = () => {
                client.user.setActivity(`${guild.memberCount} members`, { type: ActivityType.Watching });
            };
            updateStatus();
            setInterval(updateStatus, 10 * 60 * 1000);
        }

        // ===== Join Voice 24/7 =====
        try {
            const voiceChannel = await client.channels.fetch(config.voiceChannelId);
            if (voiceChannel && voiceChannel.isVoiceBased()) {
                joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator
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
            const verifyChannel = await client.channels.fetch(config.verifyChannelId);
            if (!verifyChannel) return console.log('❌ Verify channel not found');

            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Primary)
            );

            let message;
            if (config.verifyMessageId) {
                try {
                    message = await verifyChannel.messages.fetch(config.verifyMessageId);
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
