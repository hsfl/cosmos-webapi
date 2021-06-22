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

/**   route POST /exec/
 *   executes command
  test this with :
    curl --data '{"command":"ls -l"}' \
      --request POST \
      --header "Content-Type: application/json" \
      http://localhost:3000/exec/
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

router.post('/agent', (req, res) => {
  res.sendStatus(400);
});

//! calls an agent request
router.post('/agent/:node/:proc', (req, res) => {
  var cmd = req.body.command;
  const node = req.params.node;
  const proc = req.params.proc;
  console.log(`agent:${proc} node:${node} cmd:${cmd}`);
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

module.exports = router;
