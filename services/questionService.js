const { EmbedBuilder } = require("discord.js");
const { getNextQuestion, recordQuestionUsage, saveQuestion } = require("./database");
const { generateQuestion } = require("./openai");
const logger = require("../utils/logger");
const config = require("../config/config");

async function getQuestionForGuild(guildId) {
    let question = await generateQuestion();

    if (!question) {
        question = getNextQuestion(guildId);
    }
    else {
        saveQuestion(guildId, question, "ai");
        logger.info(`Generated AI question for ${guildId}: ${question}`);
    }

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