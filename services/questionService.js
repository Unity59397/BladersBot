const { EmbedBuilder } = require("discord.js");
const { getNextQuestion, recordQuestionUsage } = require("./database");
const config = require("../config/config");

function getQuestionForGuild(guildId) {
    const question = getNextQuestion(guildId);

    if (!question) {
        return null;
    }

    recordQuestionUsage(guildId, question);
    return question;
}

function buildQotdEmbed(question, guildName) {
    return new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle("✨ Question of the Day")
        .setDescription(`**${question}**`)
        .addFields({
            name: "💡 Prompt",
            value: "Take a moment to reflect and share your answer in the thread or chat."
        })
        .setFooter({
            text: `${config.botName} • Fresh question for ${guildName}`
        })
        .setTimestamp();
}

module.exports = {
    getQuestionForGuild,
    buildQotdEmbed
};