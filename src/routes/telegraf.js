const express = require('express');
const router = express.Router();

const { getSOHs } = require('../process');

/**   route GET /telegraf/
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:8082/telegraf/
*/
router.get('/', (req, res) => {
  getSOHs().then((response) => {
    res.json(response);
  });
});

module.exports = router;
