const express = require('express');
const router = express.Router();
const { listAllNodes } = require('../utils/file');


/**   route GET //nodes
 * - list nodes in nodes folder 
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:3000//nodes/
*/
router.get('/', (req, res) => {

  res.json(listAllNodes());

});





module.exports = router;
