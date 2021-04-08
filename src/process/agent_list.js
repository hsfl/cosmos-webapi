const { agent_req } = require("../utils/exec");
const { SendToParentProcess } = require("./process");

/* agent list_json expects:
   {"agent_list":[
        {"agent_proc": "cpu", "agent_utc": 59258.1010316332, ...}
        {"agent_proc": "file", "agent_utc": 59258.1010316366,...}
    ]}
 */ 
function formatListFromRequest(resp){
    var list = [];
    try {
        const resp_json = JSON.parse(resp);
        const agentList = resp_json['agent_list'];
        agentList.forEach(a => {
            list.push({agent: a.agent_proc, utc: a.agent_utc, node: a.agent_node});
        });
        return list; 
    }
    catch(e){
        return {}; 
    }
}

function getAgentList() {
    agent_req("list_json", (resp) => {
        const list = formatListFromRequest(resp);
        if(list && list.length > 0){
            SendToParentProcess(list, "any");
        }
        
    });
}
  
setInterval(getAgentList, 5000);