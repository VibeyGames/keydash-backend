const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const kinguin = require('../services/kinguin');

router.use(requireAuth);

// GET /api/orders — all orders from Kinguin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await kinguin.getOrders(page, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', detail: err.message });
  }
});

module.exports = router;
