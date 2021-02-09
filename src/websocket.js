const WebSocket = require('ws');
const { dbInsertANY } = require('./database.js');
const { getAnyExecSOH , nodeIsIncluded } = require('./utils/cosmos_utils.js');

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', function connection(ws, req) {
    const ip = req.socket.remoteAddress;
    console.log(ip);
  });

if(process.env.COLLECT === 'soh'){
    const interval = setInterval(() => {
        getAnyExecSOH((res) => {
            const json = res; 
            if(json && json.node_name){
                console.log(json.node_name)
                if(nodeIsIncluded(json.node_name)){
                    dbInsertANY(json);
                    
                    // send res on WS 
                }
                
            }
            
        })
    }, 5000);
}

wss.on('close', () => {
    clearInterval(interval);
});
module.exports = wss;
