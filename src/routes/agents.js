const express = require('express');
const router = express.Router();
const { listAllAgents } = require('../utils/file');

/**   route GET //agents
 *  - list all agents for each node in the nodes folder
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:3000//agents/
*/
router.get('/', (req, res) => {

  res.json(listAllAgents());

});





module.exports = router;
