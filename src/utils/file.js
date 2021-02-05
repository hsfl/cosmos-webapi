const fs = require('fs');
const path = require('path');
const nodes_folder = process.env.NODES_PATH; 

function getDirectories(srcpath)
{
    return fs.readdirSync(srcpath)
        .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function listAllNodes() {
    return getDirectories(nodes_folder);
}
function getNodeDir(nodeName){
    return nodeDir =  path.join(nodes_folder, nodeName);
}

function listAllAgents(){
    var json = {};
    const nodeNames = listAllNodes(); 
    nodeNames.forEach(nodeName => {
        var nodeDir =  getNodeDir(nodeName);
        if(getDirectories(nodeDir).includes("incoming")) {
            json[nodeName] = getDirectories(path.join(nodeDir,"incoming"));
        }   
        
    }); 
    return json; 
}

function listAllPieces(){
    var json = {};
    const nodeNames = listAllNodes(); 
    const allAgents = listAllAgents(); 
    nodeNames.forEach(nodeName => {
        var nodeDir =  getNodeDir(nodeName);
        const node ={"pieces":{}, "agents" :[]};
        if(nodeName in allAgents) {
            node['agents'] = allAgents[nodeName];
        }
        var pieceFile = path.join(nodeDir, "pieces.ini");

        if (fs.existsSync(pieceFile)) {
            try {
                let rawdata = fs.readFileSync(pieceFile);
                try {
                    node["pieces"]  = JSON.parse(rawdata);
                        
                } catch(e){
                    node["pieces"] = {};
                }
            } catch(err){
                console.error(err);
            }
        }

        json[nodeName] = node; 

    }); 
    return json; 
}
//! deviceName ex: "device_txr_rssi_000"
//! didx is "000"
function get_didx(deviceName){
    var didx = "";
    var last_ = deviceName.lastIndexOf('_');
    if(last_ >= 0){
        didx = deviceName.substr(last_+1);
    }
    return didx; 
}

//! deviceName ex: "device_txr_rssi_000"
//! devType is "txr"
function getDeviceType(deviceName){
    var devType = "";
    var devSplit = deviceName.split("_");
    if(devSplit.length > 0){
        devType = devSplit[1];
    }
    return devType; 
}
/**  reads devices_specific and formats them into :
 * {'1': ['device_cpu_maxload_000', 'device_cpu_maxgib_000],
 *  '2': ['device_cpu_maxload_001', 'device_cpu_maxgib_001'],
 *  ... }
 * such that each array contains the same devType and didx 
 */
function getDevices(nodeName) {
    var values = {};
    const nodeDir = getNodeDir(nodeName);
    const devspecFile = path.join(nodeDir, "devices_specific.ini");
    var deviceList = [];
    if (fs.existsSync(devspecFile)) {
        let rawdata = fs.readFileSync(devspecFile);
        try {
            let json = JSON.parse(rawdata);
            for(var device in json){
                deviceList.push(device);
            }
        }
        catch(err){}
    }
    var map = {}; 
    deviceList.forEach(device => {
        var didx = get_didx(device);
        const type = getDeviceType(device)
        if(map[type] && map[type][didx]){
                map[type][didx].push(device);
        }
        else {
            map[type] ={};
            map[type][didx]= [device];
        }
    });
    let i = 1; 
    for(type in map){
        var tmp = map[type];
        for(didx in map[type]){
            values[i.toString()] = map[type][didx];
            i++; 
        }
    }
    return values; 
}

/** listAllNamespace returns object of entire namespace
 *  {"nodeName":{ "agents":[...], "pieces":[...],"values":{...}},
 *  "nodeName":{ "agents":[...], "pieces":[...],"values":{...}},
 *  ... }
 */
function listAllNamespace(){
    var namespace = listAllPieces(); 
    const nodeNames = listAllNodes(); 
    for(let i = 0; i < nodeNames.length; i++) {
        namespace[nodeNames[i]]["values"] = getDevices(nodeNames[i]); 
    }
    return namespace;
}

module.exports = {
    listAllNodes,
    listAllAgents,
    listAllPieces,
    listAllNamespace
};