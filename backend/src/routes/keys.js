const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Keys are managed directly through Kinguin offers
// This route provides a unified view of all keys across offers
router.get('/', async (req, res) => {
  try {
    const kinguin = require('../services/kinguin');
    const stats = await kinguin.getOfferStats();
    res.json({ keys: stats.offers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch keys', detail: err.message });
  }
});

module.exports = router;
