const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const { updateSettings } = require("../../services/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setchannel")
        .setDescription("Set the channel where QOTD will be posted")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The QOTD channel")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        if (!channel || !channel.isTextBased()) {
            await interaction.reply({
                content: "⚠️ Please select a text channel.",
                ephemeral: true
            });
            return;
        }

        updateSettings(interaction.guild.id, "channel_id", channel.id);

        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("✅ QOTD channel updated")
            .setDescription(`QOTD posts will now be sent to ${channel}.`);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
