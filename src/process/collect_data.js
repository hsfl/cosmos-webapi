const { dbInsertANY } = require("../database");
const { nodeIsIncluded } = require("../utils/cosmos_utils");
const { agent_req } = require("../utils/exec");

function collectData(){
    agent_req("any exec soh", (resp) => { 
        try {
            const sohJson = JSON.parse(resp);
            if(sohJson.output){
                var soh = sohJson.output;
                var nodeName = soh.node_name;
                if(nodeName && nodeIsIncluded(nodeName)){
                    dbInsertANY(soh);
                    process.send(JSON.stringify(soh));
                }
            }
        }
        catch(e){}
    });
}

setInterval(collectData, 5000);