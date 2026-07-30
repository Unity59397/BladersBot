const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { getSettings } = require("../../services/database");
const config = require("../../config/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("View QOTD settings"),

    async execute(interaction) {
        const settings = getSettings(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle("⚙️ QOTD Configuration")
            .addFields(
                {
                    name: "Channel",
                    value: settings.channel_id ? `<#${settings.channel_id}>` : "Not set"
                },
                {
                    name: "Daily Time",
                    value: settings.post_time || config.defaultPostTime
                },
                {
                    name: "Timezone",
                    value: process.env.QOTD_TIMEZONE || config.timezone
                },
                {
                    name: "Last Post",
                    value: settings.last_post ? new Date(settings.last_post).toLocaleString() : "Not posted yet"
                }
            );

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
