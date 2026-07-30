const fs = require("fs");
const path = require("path");


module.exports = function(client){


    client.commands = new Map();


    const commandFolder =
    path.join(__dirname,"../commands");


    const folders =
    fs.readdirSync(commandFolder);


    for(const folder of folders){


        const folderPath =
        path.join(
            commandFolder,
            folder
        );


        if(!fs.statSync(folderPath).isDirectory())
            continue;



        const files =
        fs.readdirSync(folderPath)
        .filter(file =>
            file.endsWith(".js")
        );


        for(const file of files){


            const command =
            require(
                `${folderPath}/${file}`
            );


            client.commands.set(
                command.data.name,
                command
            );


        }

    }


};