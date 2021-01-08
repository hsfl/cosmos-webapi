const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();


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

router.get('/:commandNode', (req, res) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("users");
    dbo.collection("customers").findOne({
        name: req.params.name
    }, 
    function(err, result) {
        if (err) throw err;
        res.json(result);
        db.close();
    });
  });
});

router.post('/', (req, res) => {

  //! test this with :
  //! curl -d '{"command":"testCommand"}' -H "Content-Type: application/json" http://localhost:3000/commands/
  var cmd = req.body['command'];
  console.log(cmd);

  var spawn = require('child_process').spawn;
  var command = spawn(cmd);
  var result = '';
  command.stdout.on('data', function(data) {
       result += data.toString();
  });
  command.on('close', function(code) {
      res.send(result);
  });

});

module.exports = router;
