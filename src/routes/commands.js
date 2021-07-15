const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbFind, dbDeleteOne, dbInsert, dbNameByMJD } = require('../database.js');
const { execute }  = require('../utils/exec.js');
const { currentMJD }  = require('../utils/time.js');
const CosmosAgent = require('../utils/agent');
const { createEventFile } = require('../utils/file.js');


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
  res.sendStatus(400);
});

router.post('/agent/:node/:proc', (req, res) => {
  var cmd = req.body.command;
  const node = req.params.node;
  const proc = req.params.proc;
  CosmosAgent.AgentRequest(node, proc, cmd, 1000, (result) => {
    if(typeof result == 'object') {
      return res.json(result);
    } else {
      try {
        const output = JSON.parse(result);
        res.json({ output });
      } catch {
        return res.json({ output: result });
      }
    }
  });
});

/**  route POST /commands/:commandNode
 * INSERT to database REALM, collection commandNode:event
  test with :
    curl --data '{"command":{"event_name":"new_event"}}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/commands/testNode
*/
router.post('/:commandNode/', (req, res) => {
  const node = req.params.commandNode;
  const entry = req.body.command;
  if(!entry.event_utc || entry.event_utc == 0.){
    entry.event_utc = currentMJD(); 
  }
  dbInsert('current', `${node}:event`, entry, (stat) => {
    if(stat.error) res.json({"error":"Error inserting into database."});
    else res.json({"message":"Successfully inserted command"});
  });

});

/**  route POST /commands/:type/:node
 * execute command on targetNode
*/
router.post('/:type/:node/:proc', (req, res) => {
  const type = req.params.type;
  const node = req.params.node;
  const agent = req.params.proc;
  const event = req.body.event;
  if(!event.event_utc || event.event_utc == 0.){
    event.utc = currentMJD(); 
  }
  if (type === 'exec') {
    const cmd = `addcommand ${JSON.stringify(event)}`;
    CosmosAgent.AgentRequest(node, agent, cmd, 1000, (result) => {
      res.json({ 'status': result });
    });
  } else if (type === 'file') {
    createEventFile(node, event, (data) => {
      res.json(data);
    });
  } else {
    res.json( {'error': 'Type error' });
  }
  /*dbInsert('current', `${node}:event`, events, (stat) => {
    if(stat.error) res.json({"error":"Error inserting into database."});
    else res.json({"message":"Successfully inserted command"});
  });*/
});

/**  route GET /commands/:commandNode
 * FINDALL in database REALM, collection commandNode:event
test this with :
  curl --request GET \
    --header "Content-Type: application/json" \
    http://localhost:3000/commands/testNode
*/
router.get('/:commandNode/', (req, res) => {
  const node = req.params.commandNode;
  dbFind('current', `${node}:event`, {},{}, (stat, result) => {
    if(stat.error) res.json({"error":"Error finding."});
    else {
      res.json(result);
    }
  });
});

/**  route DELETE /commands/:commandNode
 * DELETE from database 'current' or 'YYYY-MM', collection commandNode:event
 * example request: {"event_name":"new_event2", "event_utc": }
 test this with :
  curl --data '{"event_name":"new_event2", "event_utc": }' \
    --request DELETE \
    --header "Content-Type: application/json" \
    http://localhost:3000/commands/testNode
*/
router.delete('/:commandNode/', (req, res) => {
  const node = req.params.commandNode;
  const event_name = req.body.event_name;
  const event_utc = (!req.body.event_utc || req.body.event_utc == 0) ? currentMJD() : req.body.event_utc;
  if(!event_name || event_name === undefined || event_utc === undefined){
    res.sendStatus(400);
    return;
  }
  else {
    const db = dbNameByMJD(event_utc);
    dbDeleteOne(db, `${node}:event`, { 'event_name': event_name }, (err, result) => {
      if (err) {
        res.json({"error":"Error deleting."});
      } else if (result.deletedCount === 1) {
        res.json({"status":"Success"});
      } else {
        res.json({"status":`No records matching "${event_name}"`});
      }
    });
  }
  
});

module.exports = router;
