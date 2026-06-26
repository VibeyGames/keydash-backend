const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const kinguinRoutes = require('./routes/kinguin');
const keysRoutes = require('./routes/keys');
const ordersRoutes = require('./routes/orders');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/kinguin', kinguinRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/orders', ordersRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KeyDash backend running on port ${PORT}`));
