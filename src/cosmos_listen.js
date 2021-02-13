const COSMOS_ADDR = "225.1.1.1";
const COSMOS_PORT = 10020;
const { cosmosParseJSON , nodeIsIncluded } = require('./utils/cosmos_utils.js');
const { dbInsertANY } = require('./database.js');
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT  , path: '/live/all'});
const dgram = require('dgram');
const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

socket.bind(COSMOS_PORT);
socket.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  socket.close();
});

socket.on('listening', () => {
  socket.addMembership(COSMOS_ADDR);
  var address = socket.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

socket.on('message', (msg, rinfo) => {
    cosmosParseJSON(msg, (json) => {
        if(json.agent_node && json.agent_proc && json.agent_addr){
            if(nodeIsIncluded(json.agent_node)){
                // insert to db REALM, collection "any"
                dbInsertANY(json);
                if(json.agent_proc !== "exec"){
                    // send json on WS 
                }
            }
        }
        console.log(json);
    });

});




// 225.1.1.1 
// listen 10021