const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT , path: '/live/all/'});
const { fork } = require('child_process');

wss.on('connection', function connection(ws) {
  console.log("client connected");

});

const agent_list = fork('./src/process/agent_list.js');
agent_list.on('message', (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

const collect_data = fork('./src/process/collect_data.js');
collect_data.on('message', (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

const file_walk = fork('./src/process/incoming_filewalk.js');
file_walk.on('message', (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

});

const event_queue = fork('./src/process/event_queue.js');
event_queue.on('message', (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

});

const file_list = fork('./src/process/file_list.js');
file_list.on('message', (message) => {
  //console.log(message);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});



module.exports = wss;
