const { agent_req } = require("../utils/exec");
const { SendToParentProcess } = require("./process");

const execNodes = [];

// receive list of exec agents from parent process
process.on('message', (message) => {
    try {
        const json = JSON.parse(message);
        json.ExecNodes.forEach((agent) => {
            execNodes.push(agent.node);
        });
    }
    catch(e) { console.error(e); }
}); 
function maintainEventQueue(node){
    agent_req([node,"exec","getcommand"].join(" "), (resp) => {
        try {
            const event_list = JSON.parse(resp);
            if(event_list.output){
                const eventQueue = {
                    node_type: "event_queue",
                    queue: event_list.output
                };
                SendToParentProcess(eventQueue, node);
            }
        }
        catch(e){}
    });
}
function allEventQueue(){
    execNodes.forEach(node => maintainEventQueue(node));
}

setInterval(allEventQueue, 5000);