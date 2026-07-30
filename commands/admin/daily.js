const {
    SlashCommandBuilder
} = require("discord.js");

const { postQotdToGuild } = require("../../services/scheduler");
const logger = require("../../utils/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Manually post today's QOTD"),

    async execute(interaction) {
        try {
            // Immediately defer with flags instead of ephemeral
            await interaction.deferReply({ flags: 64 }); // 64 = ephemeral flag

            logger.info(`${interaction.user.tag} triggered /daily command`);

            // Generate and post question
            const posted = await postQotdToGuild(interaction.client, interaction.guild.id);

            // Send response
            const responseMessage = posted
                ? "✅ QOTD posted successfully to the channel!"
                : "⚠️ QOTD could not be posted. Check channel configuration.";
            
            logger.info(`Sending response: ${responseMessage}`);
            
            try {
                await interaction.editReply({
                    content: responseMessage
                });
                logger.info(`Response sent successfully`);
            } catch (replyErr) {
                logger.error(`Failed to send response: ${replyErr.message}`);
                // Try alternative method
                try {
                    await interaction.followUp({
                        content: responseMessage
                    });
                    logger.info(`Response sent via followUp`);
                } catch (followErr) {
                    logger.error(`FollowUp also failed: ${followErr.message}`);
                }
            }

            logger.info(`/daily command completed for ${interaction.guild.name}`);
        } catch (error) {
            logger.error(`/daily command failed: ${error.message}`);
            
            try {
                if (interaction.deferred) {
                    await interaction.editReply({
                        content: `⚠️ Error: ${error.message}`
                    });
                } else if (!interaction.replied) {
                    await interaction.reply({
                        content: `⚠️ Error: ${error.message}`,
                        flags: 64
                    });
                }
            } catch (replyError) {
                logger.error(`Failed to send error response: ${replyError.message}`);
            }
        }
    }
};