const { reset } = require("nodemon");
const { dbInsertANY, dbFind } = require("../database");
const { nodeIsIncluded } = require("../utils/cosmos_utils");
const { agent_req } = require("../utils/exec");

function collectData(){
    dbFind(process.env.REALM, 'env', {agent_list:{$exists:true}}, res => {
		res.agent_list.forEach(agent => {
            agent_req([agent.node, agent.agent, 'soh2'].join(' '), (resp) => { 
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
        });
    });
    
}

setInterval(collectData, 5000);