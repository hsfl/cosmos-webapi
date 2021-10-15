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

/**
 * generates unique userid for every client
 * @returns String unique ID for client
 */
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

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

  });
});

module.exports = server;
