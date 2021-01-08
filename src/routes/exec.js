const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbConnect } = require('../database.js');


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


/**  route POST /exec/:node
 * - INSERT to database REALM, collection node:executed
 * - generate .event file  
  test with :
    curl --data '{"event":{"event_name":"test_exec"}}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/exec/testNode
*/
router.post('/:node/', (req, res) => {
  const collectionName = req.params.node;
  const entry = req.body['event'];
  //  TODO : generate event file (write to cosmos/nodes/node/outgoing/exec/node_mjd.event)
 
  dbConnect(function(err, db) {
    if (err) throw err;

    var dbo = db.db(process.env.REALM);
    const collection = dbo.collection(`${collectionName}:executed`);
    // TODO?: write to  /cosmos/nodes/temp/exec/node_mjd.event
    collection.insertOne(entry, function(err) {
      if(err) res.json({"error":"Error inserting into database."});                 
      else res.json({"message":"Successfully inserted command"});
      db.close(); 
    });
  });
});

/**  route GET /exec/:node
 * FINDALL in database REALM, collection node:executed
test this with :
  curl --request GET \
    --header "Content-Type: application/json" \
    http://localhost:3000/exec/testNode
*/
router.get('/:node/', (req, res) => {
    const collectionName = req.params.node;
    dbConnect(function(err, db) {
      if (err) throw err;
  
      var dbo = db.db(process.env.REALM);
      const collection = dbo.collection(`${collectionName}:executed`);
  
      collection.find().toArray(function(err, result){
        if(err) throw err;                 
        if(result.length > 0) res.json(result);
        else res.json(emptyResponse);
        db.close(); 
      });
    });
  });

module.exports = router;
