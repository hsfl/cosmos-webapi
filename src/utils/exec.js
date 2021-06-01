const COSMOS_BIN = process.env.COSMOS_DIR + 'bin/';


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
}

module.exports = {
    execute, 
    exec_bash,
};