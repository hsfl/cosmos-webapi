const { agent_req } = require("./exec.js");

const AgentMessageType = {
    ALL : 1,
    BEAT : 2, 
    SOH : 3, 
    GENERIC : 4,
    TIME : 5
}

function nodeIsIncluded(node){
    const included = process.env.INCLUDE_NODES; 
    const excluded = process.env.EXCLUDE_NODES; 
    if(included.includes(node)){
        return true; 
    }
    else if(excluded.includes(node)){
        return false;
    }
    if(included.includes("*")){
        return true;
    }
    return false; 
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
    nodeIsIncluded,
    getAnyExecSOH
};