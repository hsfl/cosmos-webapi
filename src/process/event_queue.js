const { SendToParentProcess } = require("./process");
const CosmosAgent = require('../utils/agent');

var heartbeats = {};

// receive list of exec agents from parent process
process.on('message', (json) => {
    try {
        const msg = JSON.parse(json);
        heartbeats = msg.exec_agents;
    }
    catch(e) { console.error(e); }
}); 
function maintainEventQueue(node){
    CosmosAgent.AgentReqByHeartbeat(heartbeats[node], 'getcommand', 1000, (resp) => {
        try {
            if(typeof resp == 'string') {
                const eventQueue = {
                    node_type: "event_queue",
                    queue: resp
                };
                SendToParentProcess(eventQueue, node);
            }
                
        }
        catch(e){ console.log(e); }
    });
}
function allEventQueue(){
    Object.keys(heartbeats).forEach(nodeName => maintainEventQueue(nodeName));
}

setInterval(allEventQueue, 5000);