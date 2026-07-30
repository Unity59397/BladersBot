require("dotenv").config();

const { REST, Routes } = require("discord.js");

const setchannel = require("./commands/admin/setchannel");
const config = require("./commands/admin/config");
const daily = require("./commands/admin/daily");
const settime = require("./commands/admin/settime");

const commands = [
    setchannel.data.toJSON(),
    config.data.toJSON(),
    daily.data.toJSON(),
    settime.data.toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deploy() {
    try {
        console.log("⏳ Registering slash commands...");

        const target = process.env.GUILD_ID
            ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
            : Routes.applicationCommands(process.env.CLIENT_ID);

        await rest.put(target, { body: commands });

        console.log("✅ Slash commands registered!");
    }
    catch (error) {
        console.error(error);
    }
}

deploy();
