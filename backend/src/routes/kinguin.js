const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const kinguin = require('../services/kinguin');

router.use(requireAuth);

router.get('/stats', async (req, res) => {
  try {
    const stats = await kinguin.getOfferStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', detail: err.message });
  }
});

router.get('/offers', async (req, res) => {
  try {
    const data = await kinguin.getOffers(1, 100);
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers', detail: err.message });
  }
});

router.post('/offers', async (req, res) => {
  try {
    const { productId, price } = req.body;
    if (!productId || !price) return res.status(400).json({ error: 'productId and price required' });
    const data = await kinguin.createOffer(productId, price);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer', detail: err.message });
  }
});

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

router.get('/offers/:id/calculate', async (req, res) => {
  try {
    const { price, productId } = req.query;
    if (!price || !productId) return res.status(400).json({ error: 'price and productId required' });
    const data = await kinguin.calculatePrice(productId, parseFloat(price));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate', detail: err.message });
  }
});

router.post('/offers/:id/keys', async (req, res) => {
  try {
    const { keys } = req.body;
    if (!keys || !keys.length) return res.status(400).json({ error: 'keys required' });
    const results = [];
    for (const key of keys) {
      const result = await kinguin.addKeysToOffer(req.params.id, key);
      results.push(result);
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add keys', detail: err.message });
  }
});

module.exports = router;
