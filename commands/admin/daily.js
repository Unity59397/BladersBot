const {
    SlashCommandBuilder
} = require("discord.js");

const { postQotdToGuild } = require("../../services/scheduler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Manually post today's QOTD"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const posted = await postQotdToGuild(interaction.client, interaction.guild.id);

        await interaction.editReply({
            content: posted
                ? "✅ QOTD posted successfully."
                : "⚠️ QOTD could not be posted. Check the configured channel and permissions."
        });
    }
};
