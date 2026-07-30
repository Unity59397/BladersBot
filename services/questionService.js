const { EmbedBuilder } = require("discord.js");
const { getNextQuestion, recordQuestionUsage, saveQuestion } = require("./database");
const { generateQuestion } = require("./openai");
const logger = require("../utils/logger");
const config = require("../config/config");

async function getQuestionForGuild(guildId) {
    logger.info(`[getQuestionForGuild] Starting for guild ${guildId}`);
    
    let questionText = await generateQuestion();
    logger.info(`[getQuestionForGuild] Generated question: "${questionText}"`);

    if (!questionText) {
        logger.warn(`[getQuestionForGuild] Generated question was empty, trying fallback`);
        questionText = getNextQuestion(guildId);
        logger.info(`[getQuestionForGuild] Fallback question: "${questionText}"`);
    }
    else {
        saveQuestion(guildId, questionText, "ai");
        logger.info(`[getQuestionForGuild] Saved AI question for ${guildId}`);
    }

    if (!questionText) {
        logger.error(`[getQuestionForGuild] No question available at all!`);
        return null;
    }

    logger.info(`[getQuestionForGuild] About to record usage. Question: "${questionText}"`);
    recordQuestionUsage(guildId, questionText);
    logger.info(`[getQuestionForGuild] Returning question: "${questionText}"`);
    return questionText;
}

function buildQotdEmbed(question, guildName) {
    const questionText = String(question || "").trim();

    if (!questionText) {
        return new EmbedBuilder()
            .setColor(config.embedColor || 0x3498db)
            .setTitle("✨ Question of the Day")
            .setDescription("No question available.");
    }

    logger.info(`Building embed with text length: ${questionText.length}`);

    const embed = new EmbedBuilder()
        .setColor(config.embedColor || 0x3498db)
        .setTitle("✨ Question of the Day")
        .setDescription(questionText)
        .addFields({
            name: "💡 How to respond",
            value: "Pick one, or answer both if you want to challenge yourself!"
        })
        .setFooter({
            text: `${config.botName || "QOTD Bot"} • Questions for ${guildName}`
        })
        .setTimestamp();

    logger.info(`Embed created successfully`);
    return embed;
}

module.exports = {
    getQuestionForGuild,
    buildQotdEmbed
};