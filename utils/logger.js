function timestamp(){

    return new Date()
    .toLocaleTimeString();

}


function info(message){

    console.log(
        `[${timestamp()}] INFO ${message}`
    );

}


function error(message){

    console.error(
        `[${timestamp()}] ERROR ${message}`
    );

}


module.exports = {
    info,
    error
};