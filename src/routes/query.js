const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbInsert, dbFindOne, dbFindQuery} = require('../database.js');
const { currentMJD } = require('../utils/time.js');
const CosmosAgent = require('../utils/agent');
const { ParseNamesToJSON } = require('../utils/data');

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

router.post('/soh/:nodeName/', (req, res) => {
    const start = req.body.beginDate;
    // start should be either a MJD time
    if(start === undefined || typeof start !== 'number'){
        res.sendStatus(400);
        return; 
    }

    const collection = `${req.params.nodeName}:soh`;
    const options = req.body.options ? req.body.options : {};
    const query = req.body.query ? req.body.query : {};

    dbFindQuery(start, collection, query, options, (resp) => {
        res.json(resp);
    });

});

router.post('/soh/current/:nodeName/', (req, res) => {
    const start = currentMJD();

    const collection = `${req.params.nodeName}:soh`;
    const options = req.body.options ? req.body.options : {};
    const query = req.body.query ? req.body.query : {};

    dbFindQuery(start, collection, query, options, (resp) => {
        res.json(resp);
    });

});

router.post('/namespace/:node/:proc', (req, res) => {
    const dbName = 'namespace';
    const collection = `${req.params.node}`;
    const options = req.body.options ? req.body.options : {};
    const query = req.body.query ? req.body.query : {};

    dbFindOne(dbName, collection, options, query, (stat, result) => {
      if (stat.error) {
        res.json({"error":"Error finding."});
      } else {
        if (result === null) {
          // If namespace is not found, ask agent via request
          console.log('here0');
          const cmd = 'all_names_types';
          const node = req.params.node;
          const proc = req.params.proc;
          CosmosAgent.AgentRequest(node, proc, cmd, 1000, (result) => {
            if(typeof result == 'object') {
              // Request error
              return res.json(result);
            } else {
              try {
                // Successful response
                const output = ParseNamesToJSON(result);
                dbInsert('namespace', node, output, () => {
                  res.json(output);
                });
              } catch {
                return res.json({ output: result });
              }
            }
          });
        } else {
          // Query successful
          res.json(result);
        }
      }
    });
});

module.exports = router;
