const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const { updateSettings } = require("../../services/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settime")
        .setDescription("Set the daily QOTD posting time")
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Time in HH:MM format, for example 09:00")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const timeValue = interaction.options.getString("time");
        const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);

        if (!match) {
            await interaction.reply({
                content: "⚠️ Please enter a valid time in HH:MM format.",
                ephemeral: true
            });
            return;
        }

        updateSettings(interaction.guild.id, "post_time", timeValue);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🕒 QOTD time updated")
            .setDescription(`QOTD posts will now be sent at ${timeValue} in your configured timezone.`);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
