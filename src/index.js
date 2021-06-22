const express = require('express');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Websocket server & database driver
const client = require('./database');

global.heartbeats = [];
const wss = require('./websocket');

// Express Modules
const namespaceRoute = require('./routes/namespace');
const commandsRoute = require('./routes/commands');
const queryRoute = require('./routes/query');
const nodesRoute = require('./routes/nodes');
const agentsRoute = require('./routes/agents');
const eventsRoute = require('./routes/events');
const execRoute = require('./routes/exec');

// Express server
const app = express();
const port = process.env.API_PORT;

// Allow cross origin sharing
app.use(cors());

// Express module/middleware for route
//! route for getting namespace information
app.use('/namespace', namespaceRoute);

//! query commands available to node 
app.use('/commands', commandsRoute);

//! query db for soh records
app.use('/query', queryRoute);

//! list of nodes in nodes folder
app.use('//nodes', nodesRoute);

//! list of all agents in nodes folder
app.use('//agents', agentsRoute);

//! queue events
app.use('/event', eventsRoute);

//! execute commands directly on host
app.use('/exec', execRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;