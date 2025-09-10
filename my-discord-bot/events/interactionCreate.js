const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionType,
    EmbedBuilder
} = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // 1️⃣ User clicks Verify button → show form
        if (interaction.isButton() && interaction.customId === 'verify_button') {
            const modal = new ModalBuilder()
                .setCustomId('verify_modal')
                .setTitle('Verify Form');

            const nameInput = new TextInputBuilder()
                .setCustomId('nameInput')
                .setLabel('Your Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ageInput = new TextInputBuilder()
                .setCustomId('ageInput')
                .setLabel('Your Age')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(ageInput)
            );

            return await interaction.showModal(modal);
        }

        // 2️⃣ Modal submit → send request to staff
        if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'verify_modal') {
            const name = interaction.fields.getTextInputValue('nameInput');
            const age = interaction.fields.getTextInputValue('ageInput');

            const staffChannel = await client.channels.fetch(config.staffChannelId);
            if (!staffChannel) return interaction.reply({ content: 'Staff channel not found.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('Verification Request')
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '\u200B', value: `**${interaction.user.tag}** | \`${interaction.user.id}\``, inline: false },
                    { name: '\u200B', value: `**${name}** | ${age}`, inline: false }
                )
                .setColor('Blue')
                .setTimestamp();

            await staffChannel.send({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`verify_yes_${interaction.user.id}`)
                            .setLabel('✅ Approve')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`verify_no_${interaction.user.id}`)
                            .setLabel('❌ Deny')
                            .setStyle(ButtonStyle.Danger)
                    )
                ]
            });

            return interaction.reply({ content: 'Your verification request has been sent.', ephemeral: true });
        }

        // 3️⃣ Staff clicks Yes or No
        if (interaction.isButton()) {
            const [action, decision, userId] = interaction.customId.split('_');
            if (action !== 'verify') return;

            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            if (!member) return interaction.reply({ content: 'Member not found.', ephemeral: true });

            // ✅ Approve
            if (decision === 'yes') {
                await member.roles.add(config.verifiedRoleId).catch(() => null);
                return interaction.update({ content: `✅ ${member.user.tag} has been verified.`, components: [] });
            }

            // ❌ Deny → show modal for reason
            if (decision === 'no') {
                const modal = new ModalBuilder()
                    .setCustomId(`verify_deny_${userId}`)
                    .setTitle('Deny Reason');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reasonInput')
                    .setLabel('Reason for denial')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                return await interaction.showModal(modal);
            }
        }

        // 4️⃣ Handle Deny Modal
        if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('verify_deny_')) {
            const userId = interaction.customId.split('_')[2];
            const reason = interaction.fields.getTextInputValue('reasonInput');

            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            if (!member) return interaction.reply({ content: 'Member not found.', ephemeral: true });

            await member.send({
                content: `You were not verified. Reason [ ${reason} ]`
            }).catch(() => null);

            return interaction.reply({ content: `You denied ${member.user.tag}.\nReason: ${reason}`, ephemeral: true });
        }
    }
};
