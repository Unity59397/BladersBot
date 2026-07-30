const { EmbedBuilder } = require("discord.js");
const { getNextQuestion, recordQuestionUsage, saveQuestion } = require("./database");
const { generateQuestion } = require("./openai");
const logger = require("../utils/logger");
const config = require("../config/config");

async function getQuestionForGuild(guildId) {
    let questionText = await generateQuestion();

    if (!questionText) {
        questionText = getNextQuestion(guildId);
    }
    else {
        saveQuestion(guildId, questionText, "ai");
        logger.info(`Generated AI question set for ${guildId}: ${questionText}`);
    }

    if (!questionText) {
        return null;
    }

    recordQuestionUsage(guildId, questionText);
    return questionText;
}

function buildQotdEmbed(question, guildName) {
    const lines = String(question || "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    const description = lines.length > 0
        ? lines.map((line) => `• ${line}`).join("\n")
        : "No question available.";

    return new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle("✨ Question of the Day")
        .setDescription(description)
        .addFields({
            name: "💡 Prompt",
            value: "Pick one, or answer both if you want to challenge yourself."
        })
        .setFooter({
            text: `${config.botName} • Fresh questions for ${guildName}`
        })
        .setTimestamp();
}

module.exports = {
    getQuestionForGuild,
    buildQotdEmbed
};