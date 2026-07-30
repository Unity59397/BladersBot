const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const {
    getSettings
} = require("../services/database");



module.exports = {


data: new SlashCommandBuilder()

.setName("config")

.setDescription(
    "View QOTD settings"
),



async execute(interaction){


const settings =
getSettings(interaction.guild.id);



const embed = new EmbedBuilder()

.setTitle("⚙️ QOTD Configuration")

.addFields(

{
name:"Channel",
value:
settings.channel_id
?
` <#${settings.channel_id}>`
:
"Not set"
},


{
name:"Daily Time",
value:
settings.post_time
}

);


await interaction.reply({

embeds:[embed],

ephemeral:true

});


}


};