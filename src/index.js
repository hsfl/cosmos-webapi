const express = require('express');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Websocket server & database driver
const client = require('./database');

// http server and module to start processes
global.heartbeats = {};
const wss = require('./websocket');
require('./process');

// Express Modules
const namespaceRoute = require('./routes/namespace');
const commandsRoute = require('./routes/commands');
const queryRoute = require('./routes/query');
const nodesRoute = require('./routes/nodes');
const agentsRoute = require('./routes/agents');
const telegrafRoute = require('./routes/telegraf');

// Express server
const app = express();
const port = process.env.API_PORT;

// Allow cross origin sharing
app.use(cors());

// Express module/middleware for route
app.use('/namespace', namespaceRoute);
app.use('/commands', commandsRoute);
app.use('/query', queryRoute);
app.use('//nodes', nodesRoute);
app.use('//agents', agentsRoute);
app.use('/telegraf', telegrafRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;