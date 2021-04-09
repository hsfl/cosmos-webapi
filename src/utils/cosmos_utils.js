const { agent_req } = require("./exec.js");

const AgentMessageType = {
    ALL : 1,
    BEAT : 2, 
    SOH : 3, 
    GENERIC : 4,
    TIME : 5
}

function getAnyExecSOH(callback){
    agent_req("any exec soh", (msg) => {
        try{
            var json = JSON.parse(msg);
            callback(json.output);
        }
        catch{
            callback({});
        }
    });
}


module.exports = {
    getAnyExecSOH
};