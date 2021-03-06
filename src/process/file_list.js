const { nodeIsIncluded } = require("../utils/cosmos_utils");
const { agent_req } = require("../utils/exec");
const hostNode = process.env.HOST_NODE;

function getFileList(type, json){
    var retList = {}; 
    var list = type === 'outgoing'? json.outgoing : json.incoming;
    list.forEach(node => {
        const nodeName = node.node; 
        if(node.count !== 0 && nodeIsIncluded(nodeName)){
            retList[String(nodeName)] = node.files;
        }
    });
    return retList;
}
function getOutgoingFileList(callback){
    agent_req(hostNode+ " file list_outgoing_json", (outgoing_resp) => { 
        try {
            const ofile_list = JSON.parse(outgoing_resp);
            if(ofile_list.output){
                var outgoingList = getFileList('outgoing', ofile_list.output);
                callback(outgoingList);
            }
            else {
                callback({});
            }
        }
        catch(e){
            callback({});
        }
    });
}
function getIncomingFileList(callback){
    agent_req(hostNode + " file list_incoming_json", (incoming_resp) => { 
        try {
            const ifile_list = JSON.parse(incoming_resp);
            if(ifile_list.output){
                var incomingList = getFileList('incoming', ifile_list.output);
                callback(incomingList);
            }
            else {
                callback({});
            }
        }
        catch(e){
            callback({});
        }
    });
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
                process.send(JSON.stringify(message));
            }
        });
    });
    
}

setInterval(maintainFileList, 5000);