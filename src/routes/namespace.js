const express = require('express');
const router = express.Router();
const { listAllPieces , listAllNamespace} = require('../utils/file');

/**   route GET /namespace/all/
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:3000/namespace/all/
*/
router.get('/all', (req, res) => {
  res.json(listAllNamespace());
});

/**   route GET /namespace/pieces/
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:3000/namespace/pieces/
*/
router.get('/pieces', (req, res) => {
  res.json(listAllPieces());
});

module.exports = router;
