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

function startScheduler(client) {
    if (scheduler) {
        logger.warn("Scheduler already running, not starting again");
        return scheduler;
    }

    const postTime = process.env.QOTD_POST_TIME || config.defaultPostTime;
    const timezone = getTimezone();

    logger.info(`=== SCHEDULER STARTING ===`);
    logger.info(`Post Time: ${postTime}`);
    logger.info(`Timezone: ${timezone}`);
    logger.info(`Current server time: ${new Date().toISOString()}`);
    logger.info(`Current London time: ${getCurrentTimeString()}`);

    // Run check every 30 seconds instead of relying on cron timezone
    scheduler = setInterval(() => {
        const now = new Date();
        const londonTime = getCurrentTimeString(now);
        
        // Only log every 10 minutes to avoid spam
        if (now.getMinutes() % 10 === 0 && now.getSeconds() < 5) {
            logger.info(`[Scheduler check] London time: ${londonTime}, Target: ${postTime}`);
        }

        if (londonTime === postTime) {
            logger.info(`\n=== TIME MATCH! TRIGGERING QOTD ===`);
            logger.info(`London time: ${londonTime}, Post time: ${postTime}`);
            runDailyCheck(client).catch((error) => {
                logger.error(`Scheduler failed: ${error.message}`);
            });
        }
    }, 30000); // Check every 30 seconds

    logger.info(`QOTD scheduler started for ${postTime} in ${timezone}`);
    logger.info(`Using setInterval for reliable timezone handling`);
    return scheduler;
}

async function runDailyCheck(client) {
    const now = new Date();
    const currentTime = getCurrentTimeString(now);
    const todayKey = now.toISOString().slice(0, 10);

    logger.info(`\n=== CRON JOB TRIGGERED ===`);
    logger.info(`Current time: ${currentTime}, Today: ${todayKey}`);

    for (const guild of client.guilds.cache.values()) {
        const settings = getSettings(guild.id);

        logger.info(`[Guild: ${guild.name}] Checking...`);
        logger.info(`  - Settings exist: ${!!settings}`);
        logger.info(`  - Post time setting: "${settings?.post_time}"`);
        logger.info(`  - Current time: "${currentTime}"`);
        logger.info(`  - Time match: ${settings?.post_time === currentTime}`);
        logger.info(`  - Last post: ${settings?.last_post}`);
        logger.info(`  - Already posted today: ${settings?.last_post?.startsWith(todayKey)}`);

        if (!settings || !settings.post_time) {
            logger.warn(`  - SKIPPED: No settings or post_time`);
            continue;
        }

        if (settings.post_time !== currentTime) {
            logger.info(`  - SKIPPED: Time mismatch (${settings.post_time} !== ${currentTime})`);
            continue;
        }

        if (settings.last_post && settings.last_post.startsWith(todayKey)) {
            logger.warn(`  - SKIPPED: Already posted today`);
            continue;
        }

        logger.info(`  - POSTING QOTD...`);
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

    try {
        // Split the questions into general and beyblade
        const lines = question.split('\n').map(line => line.trim()).filter(Boolean);
        const generalQ = lines[0]?.replace('1. ', '') || '';
        const beybladeQ = lines[1]?.replace('2. ', '') || '';

        const formattedMessage = `<@&1528818863708307557>

🌍 **General Question of the Day**
"${generalQ}"
💬 Share your answer!

🌀 **Beyblade Question of the Day**
"${beybladeQ}"
💥 Let the battles begin!`;

        const sentMessage = await channel.send({
            content: formattedMessage
        });

        logger.info(`✅ Message sent successfully with ID: ${sentMessage.id}`);
        updateSettings(guildId, "last_post", new Date().toISOString());
        logger.info(`✅ Posted QOTD to ${guild.name} in #${channel.name}`);
        return true;
    }
    catch (error) {
        logger.error(`❌ Failed to send QOTD to ${guild.name}: ${error.message}`);
        logger.error(`Error details: ${JSON.stringify(error)}`);
        return false;
    }
}

module.exports = {
    startScheduler,
    runDailyCheck,
    postQotdToGuild
};