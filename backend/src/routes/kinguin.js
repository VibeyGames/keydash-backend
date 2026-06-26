const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const kinguin = require('../services/kinguin');

router.use(requireAuth);

// GET /api/kinguin/stats — dashboard overview numbers
router.get('/stats', async (req, res) => {
  try {
    const stats = await kinguin.getOfferStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats from Kinguin', detail: err.message });
  }
});

// GET /api/kinguin/offers — all your listings
router.get('/offers', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await kinguin.getOffers(page, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers', detail: err.message });
  }
});

// POST /api/kinguin/offers — create a new listing
router.post('/offers', async (req, res) => {
  try {
    const { productId, price, keys } = req.body;
    if (!productId || !price) return res.status(400).json({ error: 'productId and price required' });
    const data = await kinguin.createOffer(productId, price, keys || []);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer', detail: err.message });
  }
});

// PATCH /api/kinguin/offers/:id/price — update price of a listing
router.patch('/offers/:id/price', async (req, res) => {
  try {
    const { price } = req.body;
    if (!price) return res.status(400).json({ error: 'price required' });
    const data = await kinguin.updateOfferPrice(req.params.id, price);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update price', detail: err.message });
  }
});

// POST /api/kinguin/offers/:id/keys — add keys to a listing
router.post('/offers/:id/keys', async (req, res) => {
  try {
    const { keys } = req.body;
    if (!keys || !keys.length) return res.status(400).json({ error: 'keys array required' });
    const data = await kinguin.addKeysToOffer(req.params.id, keys);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add keys', detail: err.message });
  }
});

module.exports = router;
