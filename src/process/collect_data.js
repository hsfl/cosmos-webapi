const { dbInsertByUTC } = require("../database");
const { agent_req } = require("../utils/exec");
const {currentMJD } = require('../utils/time');
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
                if(!soh.node_utc){
                    soh.node_utc = currentMJD();
                }
                if(!soh.node_name) soh.node_name = node; 
                if(!soh.agent_name) soh.agent_name = agent;
                soh.node_type = [node, agent].join(":");
                dbInsertByUTC(`${node}:soh`, soh, (resp) => {
                    SendToParentProcess(soh, node);
                });
            }
        }
        catch(e){ 
            // console.log(e);
            // console.log(`Error Parsing SOH ${node} ${agent} :${resp}`);
        }
    });
}

function collectAgentData(){
    agentList.forEach(e => collectData(e.agent, e.node));
}

setInterval(collectAgentData, 5000);