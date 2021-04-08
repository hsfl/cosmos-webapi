const { dbInsertANY } = require("../database");
const { agent_req } = require("../utils/exec");
const { ChildSendMessage } = require("process");

var agentList = [];

// receive the agent list from parent process 
process.on('message', (message) => {
    try {
        const agents = JSON.parse(message);
        agentList = agents; 
    }
    catch(e) { console.error(e); }
}); 

function collectData(agent, node){
    agent_req([node, agent, "soh"].join(" "), (resp) => { 
        try {
            const sohJson = JSON.parse(resp);
            if(sohJson.output){
                var soh = sohJson.output;
                var nodeName = soh.node_name;
                if(nodeName){
                    dbInsertANY(soh);
                    ChildSendMessage(soh, nodeName);
                }
            }
        }
        catch(e){ 
            // console.error(e); 
        }
    });
}

function collectAgentData(){
    agentList.forEach(e => collectData(e.agent_proc, e.agent_node));
}

setInterval(collectAgentData, 5000);