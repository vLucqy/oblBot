// commands/time.js
module.exports = {
    name: 'time',
    description: 'Shows current time in Tehran',
    async execute(message, args) {
        const now = new Date();

        // تنظیم ساعت به تایم‌زون تهران (Asia/Tehran)
        const tehranTime = now.toLocaleString('en-GB', {
            timeZone: 'Asia/Tehran',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        message.reply(`🕒 Current time in Tehran: **${tehranTime}**`);
    }
};
