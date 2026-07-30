const cron = require("node-cron");
const { getSettings, updateSettings } = require("./database");
const { getQuestionForGuild, buildQotdEmbed } = require("./questionService");
const logger = require("../utils/logger");
const config = require("../config/config");

let scheduler = null;

function getTimezone() {
    return process.env.QOTD_TIMEZONE || config.timezone;
}

function getCurrentTimeString(date = new Date()) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: getTimezone(),
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(date);
}

function buildCronExpression(postTime) {
    const [hour, minute] = postTime
        .split(":")
        .map((value) => Number(value));

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return "0 9 * * *";
    }

    return `${minute} ${hour} * * *`;
}

function startScheduler(client) {
    if (scheduler) {
        return scheduler;
    }

    const postTime = process.env.QOTD_POST_TIME || config.defaultPostTime;
    const cronExpression = buildCronExpression(postTime);

    scheduler = cron.schedule(cronExpression, () => {
        runDailyCheck(client).catch((error) => {
            logger.error(`Scheduler failed: ${error.message}`);
        });
    }, {
        timezone: getTimezone()
    });

    logger.info(`QOTD scheduler started for ${postTime} in ${getTimezone()} (${cronExpression})`);
    return scheduler;
}

async function runDailyCheck(client) {
    const now = new Date();
    const currentTime = getCurrentTimeString(now);
    const todayKey = now.toISOString().slice(0, 10);

    for (const guild of client.guilds.cache.values()) {
        const settings = getSettings(guild.id);

        if (!settings || !settings.post_time || settings.post_time !== currentTime) {
            continue;
        }

        if (settings.last_post && settings.last_post.startsWith(todayKey)) {
            continue;
        }

        await postQotdToGuild(client, guild.id);
    }
}

async function postQotdToGuild(client, guildId) {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        logger.warn(`Guild ${guildId} is not available for QOTD posting.`);
        return false;
    }

    const settings = getSettings(guildId);

    if (!settings.channel_id) {
        logger.warn(`No QOTD channel configured for ${guild.name}.`);
        return false;
    }

    let channel;

    try {
        channel = await guild.channels.fetch(settings.channel_id);
    }
    catch (error) {
        logger.error(`Unable to fetch channel ${settings.channel_id} for ${guild.name}: ${error.message}`);
        return false;
    }

    if (!channel || !channel.isTextBased()) {
        logger.warn(`Configured channel for ${guild.name} is missing or not message-capable.`);
        return false;
    }

    const question = await getQuestionForGuild(guildId);

    if (!question) {
        logger.warn(`No question available for ${guild.name}.`);
        return false;
    }

    const embed = buildQotdEmbed(question, guild.name);
    logger.info(`Embed object: ${JSON.stringify(embed.toJSON(), null, 2)}`);

    try {
        const sentMessage = await channel.send({
            content: `<@&1528818863708307557> 📣 **QOTD for ${guild.name}**\n\n${question}`
        });

        logger.info(`Message sent successfully with ID: ${sentMessage.id}`);
        updateSettings(guildId, "last_post", new Date().toISOString());
        logger.info(`Posted QOTD to ${guild.name} in #${channel.name}`);
        return true;
    }
    catch (error) {
        logger.error(`Failed to send QOTD to ${guild.name}: ${error.message}`);
        logger.error(`Error details: ${JSON.stringify(error)}`);
        return false;
    }
}

module.exports = {
    startScheduler,
    runDailyCheck,
    postQotdToGuild
};