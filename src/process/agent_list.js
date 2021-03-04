const { agent_req } = require("../utils/exec");

/* agent list_json expects:
   {"agent_list":[
        {"agent_proc": "cpu", "agent_utc": 59258.1010316332, ...}
        {"agent_proc": "file", "agent_utc": 59258.1010316366,...}
    ]}
 */ 
function formatListFromRequest(resp){
    var list = {};
    list['node_type'] = "list";
    list['agent_list'] = [];
    try {
        const resp_json = JSON.parse(resp);
        const agentList = resp_json['agent_list'];
        agentList.forEach(a => {
            list['agent_list'].push({agent: a.agent_proc, utc: a.agent_utc});
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
        if(list['agent_list'] && list['agent_list'].length > 0){
            process.send(JSON.stringify(list));
        }
        
    });
}
  
setInterval(getAgentList, 5000);