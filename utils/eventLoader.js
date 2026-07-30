const fs = require("fs");
const path = require("path");

console.log("Event loader started");

module.exports = function(client){


    const eventFolder =
    path.join(__dirname,"../events");


    const eventFiles =
    fs.readdirSync(eventFolder)
    .filter(file =>
        file.endsWith(".js")
    );


    for(const file of eventFiles){


        const event =
        require(
            `../events/${file}`
        );


        if(event.once){

            client.once(
                event.name,
                (...args)=>
                event.execute(...args)
            );

        }

        else {

            client.on(
                event.name,
                (...args)=>
                event.execute(...args)
            );

        }


    }


};