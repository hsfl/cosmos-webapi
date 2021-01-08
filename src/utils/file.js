const fs = require('fs');
const path = require('path');
const nodes_folder = process.env.NODES_PATH; 

function getDirectories(srcpath)
{
    return fs.readdirSync(srcpath)
        .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function listAllNodes() {
    /*
    const nodenames = [];
    console.log(getDirectoryNames(nodes_folder));
    getDirectories(nodes_folder).forEach(nodeDir =>{
        nodenames.push(nodeDir.split("/").slice(-1)[0]);
    }); */
    return getDirectories(nodes_folder);
}

function listAllAgents(){
    var json = {};
    const nodeNames = listAllNodes(); 
    nodeNames.forEach(nodeName => {
        var nodeDir =  path.join(nodes_folder, nodeName);
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
        var nodeDir =  path.join(nodes_folder, nodeName);
        const node ={"pieces":{}, "agents" :[]};
        if(nodeName in allAgents) {
            node['agents'] = allAgents[nodeName];
        }
        var pieceFile = path.join(nodeDir, "pieces.ini");

        try {
            if (fs.existsSync(pieceFile)) {
                try {
                    let rawdata = fs.readFileSync(pieceFile);
                    try {
                        node["pieces"]  = JSON.parse(rawdata);
                         
                    } catch(e){
                        console.error(e);
                        console.log(pieceFile);
                        return;
                    }
                } catch(err){
                    console.error(err);
                }
            }
        } catch(err) {
            console.error(err);
        }
        json[nodeName] = node; 

    }); 
    return json; 
}
function listAllNamespace(){
    return {};
}

module.exports = {
    listAllNodes,
    listAllAgents,
    listAllPieces,
    listAllNamespace
};