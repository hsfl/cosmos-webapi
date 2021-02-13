const { agent_req } = require("../utils/exec");

function maintainEventQueue(){
    agent_req("any exec getcommand", (resp) => { 
        try {
            const event_list = JSON.parse(resp);
            if(event_list.output){
                const eventQueue = {
                    node_type: "event_queue",
                    queue: event_list.output
                };
                process.send(JSON.stringify(eventQueue));
            }
        }
        catch(e){}
    });
}

setInterval(maintainEventQueue, 5000);