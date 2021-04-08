const { listAllNodes, getNodeDir, gzLineByLine } = require("../utils/file");
const { nodeIsIncluded  } = require("../utils/cosmos_utils");
const { dbFind , dbInsert , dbFindAndReplace } = require("../database");
const { SendToParentProcess } = require("./process");
const fs = require('fs');
const path = require('path');

var nodelist = [];
// receive list of nodes from parent process 
process.on('message', (message) => {
    try {
        const json = JSON.parse(message);
        nodelist = json.nodes; 
    }
    catch(e) { console.error(e); }
}); 

function makeDirectory(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function listFilesInDirWithExtension(directory, extension){
    // returns all files in directory that include extension
    return fs.readdirSync(directory).filter(file => 
        file.includes(extension));
}

function getTelemetryFileList(nodeName) {
    // returns a list of filenames in nodes/nodeName/incoming/soh with .telemetry in the filename
    const nodeDir = getNodeDir(nodeName);
    const sohDir = path.join(nodeDir, 'incoming/soh');
    if (fs.existsSync(sohDir)) {
        var sohFileList = listFilesInDirWithExtension(sohDir, ".telemetry");
        sohFileList = sohFileList.map(i=> path.join(sohDir, i));
        return sohFileList; 
    }
    return []; 
}

function getEventFileList(nodeName) {
    // returns a list of filenames in nodes/nodeName/incoming/exec with .event in the filename
        const nodeDir = getNodeDir(nodeName);
        const execDir = path.join(nodeDir, 'incoming/exec');
        if (fs.existsSync(execDir)) {
            var execFileList = listFilesInDirWithExtension(execDir, ".event");
            execFileList = execFileList.map(i => path.join(execDir, i));
            return execFileList; 
        }
        return []; 
}

function ingestTelemetryFile(filePath, nodeName) {
    gzLineByLine(filePath, (line) => {
        try{
            var json = JSON.parse(line);
            const node_type = nodeName + ":soh";
            
            if(json.node_utc) {
                // findOne in db REALM, collection "any" where node_utc == json.node_utc
                const qFields = {node_utc: json.node_utc};
                let dbRes = dbFind(process.env.REALM, "any", qFields);
                
                json.node_type = node_type;
                if(!dbRes){
                    dbInsert(process.env.REALM, "any", json);
                }
            }
        }
        catch (e){}
    }, (err) => {
        moveIncomingFile(filePath, 'corrupt');
    }, () => {
        moveIncomingFile(filePath, 'archive');
    });
}

function ingestEventFile(filePath, nodeName) {
    // each .event file should come with a .out file
    const eventOutFile = filePath.replace('.event', '.out');
    var eventJson, outContent; 
    // open event file
    gzLineByLine(filePath, (line) => {
        try{
            eventJson = JSON.parse(line);
            if(!eventJson.event_utc){
                eventJson = null; 
            }
            else if(!eventJson.event_name){
                eventJson = null;
            }
        }
        catch (e){}
    }, (err) => { // onError- both files move to corrupt
        moveIncomingFile(filePath, 'corrupt');
        if(fs.existsSync(eventOutFile)){
            moveIncomingFile(eventOutFile, 'corrupt');
        }
    }, () => { // callback
        if(eventJson) {
            moveIncomingFile(filePath, 'archive');
            
            if(fs.existsSync(eventOutFile)){
                // open .out file
                gzLineByLine(eventOutFile, (line) => {
                    outContent += line; 
                }, (err) => {
                    moveIncomingFile(eventOutFile, 'corrupt');
                }, () => {
                    moveIncomingFile(eventOutFile, 'archive');
                    if(outContent) {
                        const node_type = nodeName + ":executed";
                        eventJson['output'] = outContent;
                        eventJson['node_type'] = node_type;
                        const query = {
                            event_utc: eventJson.event_utc,
                            event_name: eventJson.event_name
                        };
                        dbFindAndReplace(process.env.REALM, "any", query, true, eventJson );
                        // process.send(JSON.stringify(eventJson)); // send event to main
                        SendToParentProcess(eventJson, nodeName);
                    }
                });
            } 
            else {
                const node_type = nodeName + ":executed";
                eventJson['node_type'] = node_type;
                const query = {
                    event_utc: eventJson.event_utc,
                    event_name: eventJson.event_name
                };
                dbFindAndReplace(process.env.REALM, "any", query, true, eventJson );
                //process.send(JSON.stringify(eventJson)); // send event to main
                SendToParentProcess(eventJson, nodeName);
            }
        }
        else {
            moveIncomingFile(filePath, 'corrupt');
            if(fs.existsSync(eventOutFile)){
                moveIncomingFile(eventOutFile, 'corrupt');
            }
        }
    });
}

function moveIncomingFile(filePath, newDirName){
    // FROM .../nodes/nodeName/incoming/agent/.telemetry
    // TO .../nodes/nodeName/newDirName/agent/.telemetry
    let path_list = filePath.split(path.sep);
    path_list[path_list.length - 3] = newDirName;
    // make directories 
    const newDirPath = path_list.slice(0, path_list.length - 2).join('/');
    makeDirectory(newDirPath);
    const fileDir = path_list.slice(0, path_list.length - 1).join('/');
    makeDirectory(fileDir);
    
    const newFileName = path_list.join('/');
    fs.renameSync(filePath, newFileName, (err) => {
        console.error(`could not rename ${filePath} to ${newFileName}`);
    });
}


function fileWalkTelemetry() {
    const nodeNames = listAllNodes(); 
    nodeNames.forEach( nodeName => {
        if(nodeIsIncluded(nodeName)){
            const sohFileList = getTelemetryFileList(nodeName);
            sohFileList.forEach((file)=>{ 
                ingestTelemetryFile(file, nodeName);
            });
        }
    });
}

function fileWalkEvent() {
    const nodeNames = listAllNodes(); 
    nodeNames.forEach( nodeName => {
        if(nodeIsIncluded(nodeName)){
            const execFileList = getEventFileList(nodeName);
            execFileList.forEach((file) => { 
                ingestEventFile(file, nodeName);
            });
        }
    });

}
  
setInterval(fileWalkTelemetry, 50000);
setInterval(fileWalkEvent, 300000);
