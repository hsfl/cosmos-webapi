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
  const event_utc = req.body.event_utc;
  console.log(req.body);
  if(!event_name || event_name === undefined || event_utc === undefined){
    res.sendStatus(400);
    return;
  }
  else {
    const db = dbNameByMJD(event_utc);
    dbDeleteOne(db, `${node}:event`, {event_name, event_utc}, (err) => {
      if(err) res.json({"error":"Error deleting."});                 
      else res.json({"message":"Successfully deleted command"});
    });
  }
  
});

module.exports = router;
