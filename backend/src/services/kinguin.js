const axios = require('axios');

const KINGUIN_AUTH_URL = 'https://id.kinguin.net/auth/token';
const KINGUIN_API_URL = 'https://gateway.kinguin.net/sales-manager-api/api/v1';

async function getToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.KINGUIN_CLIENT_ID);
  params.append('client_secret', process.env.KINGUIN_SECRET_KEY);

  const res = await axios.post(KINGUIN_AUTH_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return res.data.access_token;
}

async function kinguinRequest(method, path, data = null) {
  const token = await getToken();
  const config = {
    method,
    url: `${KINGUIN_API_URL}${path}`,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  };
  if (data) config.data = data;
  try {
    const res = await axios(config);
    return res.data;
  } catch (err) {
    console.error('Kinguin API error:', err.response?.data || err.message);
    throw err;
  }
}

async function getOffers(page = 1, limit = 20) {
  return kinguinRequest('GET', `/offers?page=${page}&limit=${limit}&status=ACTIVE`);
}

async function createOffer(productId, price, keys = []) {
  return kinguinRequest('POST', '/offers', {
    productId,
    price: { amount: Math.round(price * 100), currency: 'EUR' },
    keys
  });
}

async function updateOfferPrice(offerId, price) {
  return kinguinRequest('PATCH', `/offers/${offerId}`, {
    price: { amount: Math.round(price * 100), currency: 'EUR' }
  });
}

async function addKeysToOffer(offerId, keys) {
  return kinguinRequest('POST', `/offers/${offerId}/stock`, {
    body: keys.join('\n'),
    mimeType: 'text/plain'
  });
}

async function getOrders(page = 1, limit = 20) {
  return kinguinRequest('GET', `/orders?page=${page}&limit=${limit}`);
}

async function getOfferStats() {
  try {
    const offers = await getOffers(1, 100);
    const results = offers.results || offers || [];
    const totalKeys = results.reduce((sum, o) => sum + (o.availableStock || o.qty || 0), 0);
    const activeListings = results.filter(o => o.status === 'ACTIVE').length;
    const lowStock = results.filter(o => (o.availableStock || 0) <= 5 && (o.availableStock || 0) > 0);
    const emptyStock = results.filter(o => (o.availableStock || 0) === 0);
    return { totalKeys, activeListings, lowStock, emptyStock, offers: results };
  } catch (err) {
    console.error('getOfferStats error:', err.message);
    throw err;
  }
}

module.exports = { getOffers, createOffer, updateOfferPrice, addKeysToOffer, getOrders, getOfferStats };
