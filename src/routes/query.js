const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbConnect } = require('../database.js');


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
    --request GET \
    --data '{"multiple": true}' \
    http://localhost:3000/query/test/tc
*/
// TODO: update all calls to POST /query in cosmos-web with GET 
router.get('/:realm/:nodeProcess/', (req, res) => {
    const dbName = req.params.realm;
    const collectionName = req.params.nodeProcess;

    const options = req.body['options'] ? req.body['options'] : {};
    const multiple = req.body['multiple']? req.body['multiple'] : false;
    const query = req.body['query']? req.body['query'] : {};

    dbConnect(function(err, db) {
        if (err) throw err;

        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        
        if(multiple === true){
            collection.find(query, options).toArray(function(err, result){
                if(err) throw err;                 
                if(result.length > 0) res.json(result);
                else res.json(emptyResponse);
                db.close(); 
            });
        }
        else {
            collection.findOne(query, options, function(err, result){
                if(err) throw err; 
                if(!result) res.json(emptyResponse);
                else res.json(result);
                db.close(); 
            });
        }
  });
  
  
});


module.exports = router;
