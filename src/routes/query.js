const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbFind, dbFindOne , dbFindQuery} = require('../database.js');
const { currentMJD } = require('../utils/time.js');


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

router.post('/soh/:nodeName/', (req, res) => {
    
    const start = req.body.beginDate;
    console.log(req.body);
    if(!start || typeof start != 'number'){
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

/* TEST POST
curl --header "Content-Type: application/json" \
    --request GET \
    --data '{ nodes:['windev2'], beginDate: 59326.974548611324 }' \
    http://localhost:3000/query/soh
*/
router.post('/:realm/:nodeProcess/', (req, res) => {
    const dbName = req.params.realm;
    const collectionName = req.params.nodeProcess;

    const options = req.body['options'] ? req.body['options'] : {};
    const multiple = req.body['multiple']? req.body['multiple'] : false;
    const query = req.body['query']? req.body['query'] : {};
    if(multiple === true){
        dbFind(dbName, collectionName, query, options, (stat, resp) => {
            if(stat.success) {
                res.json(resp);
            }
            else{
                console.log(stat.error);
                res.json(emptyResponse);
            }
        });
    } 
    else {
        dbFindOne(dbName, collectionName, query, options, (stat, resp) => {
            if(stat.success) {
                res.json(resp);
            }
            else{
                console.log(stat.error);
                res.json(emptyResponse);
            }
        });
    }
});





module.exports = router;
