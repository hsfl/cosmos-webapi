const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { dbFindQuery} = require('../database.js');
const { currentMJD } = require('../utils/time.js');

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

/**
 * query SOH data by node and a start time (MJD)
 */
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

/**
 * query most recent soh data for a node
 */
router.post('/soh/current/:nodeName/', (req, res) => {
    const start = currentMJD();

    const collection = `${req.params.nodeName}:soh`;
    const options = req.body.options ? req.body.options : {};
    const query = req.body.query ? req.body.query : {};

    dbFindQuery(start, collection, query, options, (resp) => {
        res.json(resp);
    });

});


module.exports = router;
