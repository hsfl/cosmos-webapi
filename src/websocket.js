const webSocketServer = require('websocket').server;
const http = require('http');
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(process.env.WEBSOCKET_PORT);
const wsServer = new webSocketServer({
  httpServer: server
});

// I'm maintaining all active connections in this object
const clients = {};

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const sendMessage = (json) => {
  // We are sending the current data to all connected clients
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
  });
}

wsServer.on('request', function(request) {
  var userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))

  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    delete clients[userID];
  });
});

const { fork } = require('child_process');

// process: agent list loop
const agent_list = fork('./src/process/agent_list.js');
agent_list.on('message', (message) => {
  sendMessage(message);
});

// process: collect data loop 
const collect_data = fork('./src/process/collect_data.js');
collect_data.on('message', (message) => {
  sendMessage(message);
});

// process: file walk loop 
const file_walk = fork('./src/process/incoming_filewalk.js');
file_walk.on('message', (message) => {
  sendMessage(message);
});

// process: event queue loop 
const event_queue = fork('./src/process/event_queue.js');
event_queue.on('message', (message) => {
  sendMessage(message);
});

// process: file list loop ( list of outgoing/incoming files for hostNode )
const file_list = fork('./src/process/file_list.js');
file_list.on('message', (message) => {
  sendMessage(message);
});

module.exports = server;
