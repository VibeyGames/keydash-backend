const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Single owner account — credentials set via environment variables
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const validUsername = username === process.env.DASHBOARD_USERNAME;
  const validPassword = await bcrypt.compare(password, process.env.DASHBOARD_PASSWORD_HASH);

  if (!validUsername || !validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ username: req.user.username });
});

module.exports = router;
