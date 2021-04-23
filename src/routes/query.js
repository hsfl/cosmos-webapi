const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbFindQuery} = require('../database.js');

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

module.exports = router;
