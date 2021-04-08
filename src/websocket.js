const webSocketServer = require('websocket').server;
const http = require('http');
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(process.env.WEBSOCKET_PORT);
const wsServer = new webSocketServer({
  httpServer: server
});

// I'm maintaining all active connections in this object
const clients = {}; // userID : connection
const nodes = {}; // nodename : [userID,...]
const clientNodeList = {}; // userID : [nodename,...] 

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const sendClient = (clientID, json) => {
  if(clients[clientID]){
    console.log(`sending to cliend ${clientID}: ${json}`);
    clients[clientID].sendUTF(json);
  }
}
/**
 * sending json to all connected clients
 * @param {string} json 
 */
const sendAllClients = (json) => {
  Object.entries(clients).forEach(([id,connection]) => {
    console.log(`sending to ${id}`);
    console.log(json);
    connection.sendUTF(json);
  });
}

/**
 * sending json to clients in nodes[nodename]
 * @param {string} json 
 * @param {string} nodename 
 */
const sendToClients = (json, nodename) => {
  Object.entries(clients).forEach(([id,connection]) => {
    console.log(`sending to cliend ${id}: ${json}`);
    if(nodes[nodename].contains(id)) connection.sendUTF(json)
  });
}

/**
 * send message to a forked process
 * @param {forked process} child 
 * @param {object} message 
 */
const sendToChildProcess = (child, message) => {
  console.log("sending to child", message);
  child.send(message);
}


const { fork } = require('child_process');

// process: collect data loop 
const collect_data = fork('./src/process/collect_data.js');
collect_data.on('message', (message) => {
  sendToClients(message.data, message.nodename);
});

// process: file walk loop 
const file_walk = fork('./src/process/incoming_filewalk.js');
file_walk.on('message', (message) => {
  sendToClients(message.data, message.nodename);
});

// process: event queue loop 
const event_queue = fork('./src/process/event_queue.js');
event_queue.on('message', (message) => {
  sendToClients(message.data, message.nodename);
});

// process: file list loop ( list of outgoing/incoming files for hostNode )
const file_list = fork('./src/process/file_list.js');
file_list.on('message', (message) => {
  sendAllClients(message.data);
});

// process: agent list loop
const agent_list = fork('./src/process/agent_list.js');
agent_list.on('message', (message) => {

  try {
    const agents = JSON.parse(message);
    if(agents){
        try {
          Object.entries(clientNodeList).forEach(([id, nodeList]) => {
            const agentList = agents.filter(e => nodeList.includes(e.node));
            const msg = { node_type : 'list', agent_list: agentList };
            sendClient(id, JSON.stringify(msg));
          });
        }
        catch(e){ console.log(e); }
      
      const execList = agents.filter(e =>  e.agent === 'exec');

      // send data to other processes 
      sendToChildProcess(event_queue, JSON.stringify({ ExecNodes: execList }));
      sendToChildProcess(collect_data, message);
    }
  }
  catch(e) {
    console.log(e);
    console.log(message)
  }
});


wsServer.on('request', function(request) {
  var userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  clientNodeList[userID] = [];
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))

  connection.on('message', function(msg) {
    try {
      const json = JSON.parse(msg.utf8Data);
      

      // get the client's node list 
      clientNodeList[userID] = json.nodes;
      console.log(clientNodeList);
      for(node in msg.nodes){
        if(!nodes.includes(node)) nodes[node] = [];
        nodes[node].push(userID);
      }

      // update child processes with node list 
      sendToChildProcess(file_walk, { nodes: Object.keys(nodes)});
    }
    catch(e){
      console.log(e);
      console.log(msg);
    }
  });

  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    delete clients[userID];
    delete clientNodeList[userID];

    // delete userID from nodes
    for(node in nodes){
      node = node.filter((id) => {return id !== userID});
    }

    // update child processes with node list 
    sendToChildProcess(file_walk, { nodes: Object.keys(nodes)});
  });
});

module.exports = server;
