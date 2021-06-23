const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbFind, dbDeleteOne, dbInsert, dbNameByMJD } = require('../database.js');
const { execute }  = require('../utils/exec.js');
const { currentMJD }  = require('../utils/time.js');
const CosmosAgent = require('../utils/agent');


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


/**  route POST /commands/:commandNode
 * INSERT to database REALM, collection commandNode:command
  test with :
    curl --data '{"command": {"event_name" : "test", "event_type": 0, "event_flag":0, "event_data":"a test command"}}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/commands/testNode
*/
router.post('/:commandNode/', (req, res) => {
  const node = req.params.commandNode;
  const entry = req.body.command;

  dbInsert('current', `${node}:command`, entry, (stat) => {
    if(stat.error) res.json({"error":"Error inserting into database."});
    else res.json({"message":"Successfully inserted command"});
  });

});

/**  route GET /commands/:commandNode
 * FINDALL in database REALM, collection commandNode:command
test this with :
  curl --request GET \
    --header "Content-Type: application/json" \
    http://localhost:3000/commands/testNode
*/
router.get('/:commandNode/', (req, res) => {
  const node = req.params.commandNode;
  dbFind('current', `${node}:command`, {},{}, (stat, result) => {
    if(stat.error) res.json({"error":"Error finding."});
    else {
      res.json(result);
    }
  });
});

/**  route DELETE /commands/:commandNode
 * DELETE from database 'current' , collection commandNode:command
 * example request: {"event_name":"new_event2"}
 test this with :
  curl --data '{"event_name":"new_event2"}' \
    --request DELETE \
    --header "Content-Type: application/json" \
    http://localhost:3000/commands/testNode
*/
router.delete('/:commandNode/', (req, res) => {
  const node = req.params.commandNode;
  const event_name = req.body.event_name;
  console.log(req.body);
  if(!event_name || event_name === undefined){
    res.sendStatus(400);
    return;
  }
  else {
    dbDeleteOne('current', `${node}:command`, { event_name }, (err) => {
      if(err) res.json({"error":"Error deleting."});                 
      else res.json({"message":"Successfully deleted command"});
    });
  }
  
});

module.exports = router;
