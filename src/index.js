const express = require('express');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Websocket server & database driver
const wss = require('./websocket');
const client = require('./database');

// Express Modules
const namespaceRoute = require('./routes/namespace');
const commandsRoute = require('./routes/commands');
const queryRoute = require('./routes/query');
const execRoute = require('./routes/exec');
const nodesRoute = require('./routes/nodes');
const agentsRoute = require('./routes/agents');

// Express server
const app = express();
const port = 3000;

// Allow cross origin sharing
app.use(cors());

// Express module/middleware for route
app.use('/namespace', namespaceRoute);
app.use('/commands', commandsRoute);
app.use('/query', queryRoute);
app.use('/exec', execRoute);
app.use('//nodes', nodesRoute);
app.use('//agents', agentsRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;