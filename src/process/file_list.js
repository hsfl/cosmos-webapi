const CosmosAgent = require('../utils/agent');
const hostNode = process.env.HOST_NODE;
const { SendToParentProcess } = require("./process");

var heartbeat = {}; 
process.on('message', (json) => {
    //! get the heartbeat of agent file
    try {
        const msg = JSON.parse(json);
        heartbeat = msg.agent_file_host;
    }
    catch(e) { console.error(e); }
}); 

function getFileList(type, json){
    var retList = {}; 
    var list = type === 'outgoing'? json.outgoing : json.incoming;
    list.forEach(node => {
        const nodeName = node.node; 
        if(node.count){
            retList[String(nodeName)] = node.files;
        }
    });
    return retList;
}

function getOutgoingFileList(callback){
    if(heartbeat.agent_addr && heartbeat.agent_port) {
        CosmosAgent.AgentReqByHeartbeat(heartbeat, list_outgoing_json, (outgoing_resp) => { 
            try {
                if(typeof outgoing_resp === 'string' && outgoing_resp.length > 0) {
                    const ofile_list = JSON.parse(outgoing_resp);
                    var outgoingList = getFileList('outgoing', ofile_list.output);
                    callback(outgoingList);
                } else callback({});
            }
            catch(e){
                callback({});
            }
        });
    }
    
}
function getIncomingFileList(callback){
    if(heartbeat.agent_addr && heartbeat.agent_port) {
        CosmosAgent.AgentReqByHeartbeat(heartbeat, list_outgoing_json, (incoming_resp) => { 

            try {
                if(typeof incoming_resp === 'string' && incoming_resp.length > 0) {
                    const ifile_list = JSON.parse(incoming_resp);
                    var incomingList = getFileList('incoming', ifile_list.output);
                    callback(incomingList);
                } else callback({});
            }
            catch(e){
                callback({});
            }
        });
    }
}

function maintainFileList(){
    getOutgoingFileList((outgoingFiles) => {
        getIncomingFileList((incomingFiles) => {
            if(Object.keys(outgoingFiles).length > 0 && Object.keys(outgoingFiles).length > 0){
                const message = {
                    node_type: "file",
                    outgoing: outgoingFiles,
                    incoming: incomingFiles
                }
                SendToParentProcess(message, hostNode);
            }
        });
    });
    
}

setInterval(maintainFileList, 5000);