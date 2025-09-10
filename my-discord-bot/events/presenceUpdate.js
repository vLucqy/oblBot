module.exports = {
    name: 'presenceUpdate',
    execute: async (oldPresence, newPresence, client, config) => {
        if (!newPresence || !newPresence.userId) return;

        const logChannel = await client.channels.fetch(config.logChannelId).catch(() => null);
        if (!logChannel) return;

        const oldStatus = oldPresence ? oldPresence.status : 'offline';
        const newStatus = newPresence.status;

        if (oldStatus === 'offline' && newStatus === 'online') {
            logChannel.send(`🟢 ${newPresence.user.tag} is now online!`);
        }
    }
};
