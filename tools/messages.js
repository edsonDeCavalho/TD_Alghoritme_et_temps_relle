const moment = require("moment")

function formatMassage(username, message){
    return {
        username: username,
        message:message,
        time:moment().format('h:mm a')
    }
}

module.exports=formatMassage;