const express = require('express');

const router = express.Router();

// define the home page route
router.get('/', (req, res) => {
  res.send('/namespace');
});

// define the about route
router.get('/agents', (req, res) => {
  res.send('/namespace/agents route');
});

module.exports = router;
