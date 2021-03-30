const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbConnect } = require('../database.js');
const { agent_req, execute }  = require('../utils/exec.js');
const emptyResponse = {"error":"Empty Response."};

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

/**   route POST /commands/
 *   executes command
  test this with :
    curl --data '{"command":"ls -l"}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/commands/
*/

router.post('/', (req, res) => {

  var cmd = req.body['command'];
  if(!cmd || cmd === undefined){
    res.sendStatus(400);
  }
  else {
    var cmd_args = cmd.split(" ");
    var exec_cmd ="";
    var args =[];
    if(cmd_args.length == 1){
      exec_cmd = cmd; 
    }
    else {
      exec_cmd = cmd_args[0];
      args = cmd_args.slice(1);
    }
    execute(exec_cmd, args, (response, err) => {
      if(err){
        res.json(response);
      }
      else {
        res.json({output:response});
      }
    });
  }
});

/**   route POST /commands/
 *   executes command
  test this with :
    curl --data '{"command":"list"}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/commands/agent
*/

router.post('/agent', (req, res) => {

  var cmd = req.body['command'];
  agent_req(cmd, (result)=>{
    res.json(result);
  });

});

/**  route POST /commands/:commandNode
 * INSERT to database REALM, collection commandNode:commands
  test with :
    curl --data '{"command":{"event_name":"new_event"}}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/commands/testNode
*/
router.post('/:commandNode/', (req, res) => {
  const collectionName = req.params.commandNode;
  const entry = req.body['command'];
  dbConnect(function(err, db) {
    if (err) throw err;

    var dbo = db.db(process.env.REALM);
    const collection = dbo.collection(`${collectionName}:commands`);
    // TODO?: write to  /cosmos/nodes/temp/exec/node_mjd.event
    collection.insertOne(entry, function(err) {
      if(err) res.json({"error":"Error inserting into database."});                 
      else res.json({"message":"Successfully inserted command"});
      db.close(); 
    });
  });
});

/**  route GET /commands/:commandNode
 * FINDALL in database REALM, collection commandNode:commands
test this with :
  curl --request GET \
    --header "Content-Type: application/json" \
    http://localhost:3000/commands/testNode
*/
router.get('/:commandNode/', (req, res) => {
  const collectionName = req.params.commandNode;
  dbConnect(function(err, db) {
    if (err) throw err;

    var dbo = db.db(process.env.REALM);
    const collection = dbo.collection(`${collectionName}:commands`);

    collection.find().toArray(function(err, result){
      if(err) throw err;
      if(result.length > 0) res.json(result);
      else res.json(emptyResponse);
      db.close(); 
    });
  });
});

/**  route DELETE /commands/:commandNode
 * DELETE from database REALM, collection commandNode:commands
 * example request: { "event_name":"event_to_delete"}
 test this with :
  curl --data '{"event_name":"new_event2"}' \
    --request DELETE \
    --header "Content-Type: application/json" \
    http://localhost:3000/commands/testNode
*/
router.delete('/:commandNode/', (req, res) => {
  const collectionName = req.params.commandNode;
  const eventToDelete = req.body['event_name'];
  if(!eventToDelete || eventToDelete === undefined){
    res.sendStatus(400);
    return;
  }
  else {
    dbConnect(function(err, db) {
      if (err) throw err;
  
      var dbo = db.db(process.env.REALM);
      const collection = dbo.collection(`${collectionName}:commands`);
  
      collection.deleteOne({"event_name":`${eventToDelete}`},function(err){
        if(err) res.json({"error":"Error deleting."});                 
        else res.json({"message":"Successfully deleted command"});
        db.close(); 
      });
    });
  }
  
});

module.exports = router;
