const webSocketServer = require('websocket').server;
const http = require('http');
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(process.env.WEBSOCKET_PORT);
const wsServer = new webSocketServer({
  httpServer: server
});

// I'm maintaining all active connections in this object
const clients = {}; // { userID : connection, ...}
const nodes = {}; // { nodename : [userID,...] ,... }
const clientNodeList = {}; // { userID : [nodename,...] , ...}

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const sendClient = (clientID, json) => {
  if(clients[clientID]){
    //console.log(`TOCLIENT ${clientID}: ${json}`);
    clients[clientID].sendUTF(json);
  }
}
/**
 * sending json to all connected clients
 * @param {string} json 
 */
const sendAllClients = (json) => {
  Object.keys(clients).forEach((id) => {
    sendClient(id, json);
  });
}

/**
 * sending json to clients in nodes[nodename]
 * @param {string} json 
 */
const sendToClients = (json, nodename) => {
  Object.keys(clients).forEach((id) => {
    if(nodes[nodename] && nodes[nodename].includes(id)) {
      sendClient(id, json);
    }
  });
}

/**
 * send message from forked process to client list
 * @param {object} msg 
 */
const sendChildMessageToClients = (msg) => {
  try{
    const json = JSON.parse(msg); 
    if(json.data && json.node){
      if(json.node === 'any') {
        sendAllClients(JSON.stringify(json.data));
      }
      else {
        sendToClients(JSON.stringify(json.data), json.node);
      }
    } 
  }
  catch(e){
    console.log(e);
  }
}

/**
 * send message to a forked process
 * @param {forked process} child 
 * @param {object} message 
 */
const sendToChildProcess = (child, message) => {
  child.send(message);
}


const { fork } = require('child_process');

// process: collect data loop 
const collect_data = fork('./src/process/collect_data.js');
collect_data.on('message', message => sendChildMessageToClients(message));

// process: file walk loop 
const file_walk = fork('./src/process/incoming_filewalk.js');
file_walk.on('message', (message) => sendChildMessageToClients(message));

// process: event queue loop 
const event_queue = fork('./src/process/event_queue.js');
event_queue.on('message', (message) => sendChildMessageToClients(message));

// process: file list loop ( list of outgoing/incoming files for hostNode )
const file_list = fork('./src/process/file_list.js');
file_list.on('message', (message) => sendChildMessageToClients(message));

// process: agent list loop
const agent_list = fork('./src/process/agent_list.js');
agent_list.on('message', (message) => {

  try {
    const msg = JSON.parse(message);
    if(msg.data){
      const agents = msg.data;
        try {
          Object.entries(clientNodeList).forEach(([id, nodeList]) => {
            if(nodeList){
              const agentList = agents.filter(e => nodeList.includes(e.node));
              const data = { node_type : 'list', agent_list: agentList };
              sendClient(id, JSON.stringify(data));
            }

          });
        }
        catch(e){ console.log(e); }
      
      const execList = agents.filter(e =>  e.agent === 'exec');

      // send data to other processes 
      sendToChildProcess(event_queue, JSON.stringify({ ExecNodes: execList }));
      sendToChildProcess(collect_data, JSON.stringify(msg.data));
    }
  }
  catch(e) {
    console.log(e);
    console.log(message)
  }
});

/**
 * update current list of clients & nodes
 * @param {string} clientID 
 * @param {Array} nodes 
 */
const updateClientNodeList = (clientID, clientNodes) => {
  if (clientNodeList[clientID]) {
    // remove clientID from each node in nodes if not in clientNodes
    clientNodeList[clientID].forEach((node) => {
      if (!clientNodes.includes(node)){
        nodes[node] = nodes[node].filter(id => id !== clientID);
      }
    });
  }
  
  clientNodes.forEach((node) => {
    if(!nodes[node]) nodes[node] = [clientID]; 
    else if(!nodes[node].includes(clientID)) nodes[node].push(clientID);
  });

  clientNodeList[clientID] = clientNodes; 
}

wsServer.on('request', function(request) {
  var userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  updateClientNodeList(userID, []);
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))

  connection.on('message', function(msg) {
    try {
      const json = JSON.parse(msg.utf8Data);

      updateClientNodeList(userID, json.nodes);

      // update child processes with node list 
      sendToChildProcess(file_walk, JSON.stringify({ nodes: Object.keys(nodes)}));
    }
    catch(e){
      console.log(e);
    }
  });

  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    updateClientNodeList(userID, []);
    delete clients[userID];
    delete clientNodeList[userID];

    // update child processes with node list 
    sendToChildProcess(file_walk, JSON.stringify({ nodes: Object.keys(nodes)}));
  });
});

module.exports = server;
