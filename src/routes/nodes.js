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

/**   route GET //nodes
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:3000//nodes/
*/
router.get('/', (req, res) => {

  res.send("//nodes");

});





module.exports = router;
