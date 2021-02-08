const COSMOS_BIN = '~/cosmos/bin/';

function execute(cmd, args, callback){
    var spawn = require('child_process').spawn;
    try{
        var command = spawn(cmd, args);
        var result = '';
        command.stdout.on('data', function(data) {
            result += data.toString();
        });
        command.on('close', function(code) {
            callback(result); 
        });
    }
    catch(err){
        var cmdStr = cmd; 
        if(!cmd) cmdStr = "";

        callback({ error: "invalid command ("+cmdStr+")"}, err);
    }
}

function exec_bash(cmd, callback){
    execute("/bin/bash", ['-c', cmd], callback);
    /*
    var spawn = require('child_process').spawn;
    console.log("running: "+ cmd);
    try{
        var command = spawn("/bin/bash", ['-c',cmd]);
        var result = '';
        command.stdout.on('data', function(data) {
            result += data.toString();
        });
        command.on('close', function(code) {
            callback(result); 
        });
    }
    catch(err){
        var cmdStr = cmd; 
        if(!cmd) cmdStr = "";

        callback({ error: "invalid command ("+cmdStr+")"});
    } */
}
function agent_req(cmd, callback){
    exec_bash(COSMOS_BIN + 'agent ' + cmd, callback)
}

module.exports = {
    execute, 
    exec_bash,
    agent_req
};