const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { MongoClient } = require('mongodb');

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


// curl --header "Content-Type: application/json" --request POST --data '{"multiple": true}' http://localhost:3000/query/realmN/nodeProcess
router.post('/:realm/:nodeProcess', (req, res) => {
    const dbName = req.params.realm;
    const collectionName = req.params.nodeProcess;

    const options = req.body['options'] ? req.body['options'] : {};
    const multiple = req.body['multiple']? req.body['multiple'] : {};
    const query = req.body['query']? req.body['query'] : {};
    console.log(query);
    console.log(dbName);
    console.log(collectionName);
    

    const url = `${process.env.DB_URI}/${dbName}/${collectionName}`;
    console.log(url);
    MongoClient.connect(url, {useUnifiedTopology:true}, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);

        const collection = dbo.collection(collectionName);
        if(multiple === true)
        {
            collection.find(query, options).toArray(function(err, result){
                if(err) throw err; 
                console.log(JSON.stringify(result));
                
                if(result.length > 0)
                {
                    res.json(result);
                } 
                else {
                    res.json(emptyResponse);
                }
                db.close(); 
            });
        }
        else 
        {
            
            collection.findOne(query, options, function(err, result){
                if(err) throw err; 
                if(!result)
                {
                    res.json(emptyResponse);
                }
                else
                {
                    res.json(result);
                }
                
                db.close(); 
            });
        }
  });
  
  
});
/*
router.post('/', (req, res) => {


}); */

module.exports = router;
