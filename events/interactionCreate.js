const logger = require("../utils/logger");

module.exports = {
    name: "interactionCreate",

    async execute(interaction) {
        if (!interaction.isChatInputCommand())
            return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command)
            return;

        try {
            await command.execute(interaction);
        }
        catch (error) {
            logger.error(`Command error: ${error.message}`);
            logger.error(error.stack);

            try {
                // Check if interaction has been replied to or deferred
                if (interaction.replied) {
                    // If already replied, use followUp
                    await interaction.followUp({
                        content: "❌ Something went wrong.",
                        ephemeral: true
                    });
                }
                else if (interaction.deferred) {
                    // If deferred, use editReply
                    await interaction.editReply({
                        content: "❌ Something went wrong."
                    });
                }
                else {
                    // If neither, reply normally
                    await interaction.reply({
                        content: "❌ Something went wrong.",
                        ephemeral: true
                    });
                }
            }
            catch (replyError) {
                logger.error(`Failed to send error message: ${replyError.message}`);
            }
        }
    }
};