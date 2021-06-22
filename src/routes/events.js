const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbFind, dbFindOne, dbInsert } = require('../database.js');
const { writeEventFile } = require('../utils/file.js');


const emptyResponse ={"error":"Empty Response."};
//! following line is for parsing JSON data in POST requests
router.use(bodyParser.json());

router.use((req, res, next) => {
  res.set('Content-type','application/json');
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, OPTIONS, DELETE');
  res.setHeader('Access-Control-Max-Age','1728000');
  res.setHeader('Access-Control-Allow-Headers','*');
  next();
});


/* TEST POST
curl --header "Content-Type: application/json" \
    --request POST \
    --data '{"event": {...}}' \
    http://localhost:3000/events
*/
//! 
/*
    "send an event to the node"
    1. creates .event file, puts it in node/outgoing/exec
        - relies on agent_file running on this machine to transfer the files to the node
    2. insert event in database node:events
*/
router.post('/:commandNode/', (req, res) => {
    const nodeName = req.params.commandNode;
    const event = req.body.event;
    if(!event) {
        res.sendStatus(400); 
        return; 
    }
    // write event to ~/cosmos/nodes/nodeName/outgoing/exec/nodeName_mjd.event
    writeEventFile(nodeName, event, (err) => {
        if(err) {
            console.log(err);
            res.sendStatus(400); 
            return; 
        }
        const dbName = 'current';
        const collectionName = `${nodeName}:events`;
        const doc = event;
        dbInsert(dbName, collectionName, doc, (resp) => {
            if(resp.error) res.sendStatus(500);
            res.json(JSON.stringify(resp));
        });
    })
    
});


module.exports = router;
