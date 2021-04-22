const { dbInsertByUTC } = require("../database");
const { agent_req } = require("../utils/exec");
const { SendToParentProcess } = require("./process");

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
                //dbInsertANY(soh);
                soh.node_type = [node, agent].join(":");
                // console.log(soh);
                SendToParentProcess(soh, node);

            }
        }
        catch(e){ 
            // console.log(`Error Parsing SOH ${node} ${agent} :${resp}`);
        }
    });
}

function collectAgentData(){
    agentList.forEach(e => collectData(e.agent, e.node));
}

setInterval(collectAgentData, 5000);