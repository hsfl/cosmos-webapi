const express = require('express');

const router = express.Router();

// define the home page route
router.get('/all', (req, res) => {
  res.send('/namespace/all');
});

// define the about route
router.get('/pieces', (req, res) => {
  res.send('/namespace/pieces ');
});

module.exports = router;
