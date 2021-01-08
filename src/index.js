const express = require('express');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Websocket server & database driver
const wss = require('./websocket');
const client = require('./database');

// Express Modules
const namespace = require('./routes/namespace');
const commands = require('./routes/commands');
const query = require('./routes/query');

// Express server
const app = express();
const port = 3000;

// Allow cross origin sharing
app.use(cors());

// Express module/middleware for route
app.use('/namespace', namespace);
app.use('/commands', commands);
app.use('/query', query);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
