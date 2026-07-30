const {
    SlashCommandBuilder
} = require("discord.js");



module.exports = {


data: new SlashCommandBuilder()

.setName("daily")

.setDescription(
    "Manually post today's QOTD"
),



async execute(interaction){


await interaction.reply({

content:
"⚠️ Question generation has not been connected yet.",

ephemeral:true

});


}


};