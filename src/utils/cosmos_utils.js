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

function cosmosParseJSON(message, callback) {
    const msg = String(message);
    var json_start = 0; 
    var json_end = 0; 
    if(msg.charAt(1) === '{'){
        json_start = 1;
    } else if(msg.charAt(3) === '{') {
        json_start = 3; 
    }
    json_end = msg.lastIndexOf('}') +1;
    if(json_start > 0 && json_end > 0 ) {
        var jmess = msg.slice(json_start, json_end);
        const json = JSON.parse(jmess);
        callback(json);
    }
    else {
        console.log(message);
    }
    
}

module.exports = {
    cosmosParseJSON,
    nodeIsIncluded,
    getAnyExecSOH
};