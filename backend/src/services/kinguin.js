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
  const res = await axios(config);
  return res.data;
}

async function getOffers(page = 1, limit = 20) {
  const data = await kinguinRequest('GET', `/offers?page=${page}&limit=${limit}`);
  return data._embedded?.offerList || data.results || data || [];
}

async function createOffer(productId, price) {
  return kinguinRequest('POST', '/offers', {
    productId,
    price: { amount: Math.round(price * 100), currency: 'EUR' }
  });
}

async function updateOfferPrice(offerId, price) {
  return kinguinRequest('PATCH', `/offers/${offerId}`, {
    price: { amount: Math.round(price * 100), currency: 'EUR' }
  });
}

async function addKeysToOffer(offerId, key) {
  return kinguinRequest('POST', `/offers/${offerId}/stock`, {
    body: key,
    mimeType: 'text/plain'
  });
}

async function getOrders(page = 1, limit = 20) {
  const data = await kinguinRequest('GET', `/orders?page=${page}&limit=${limit}`);
  return data._embedded?.orderList || data.results || data || [];
}

async function getOfferStats() {
  const offers = await getOffers(1, 100);
  const totalKeys = offers.reduce((sum, o) => sum + (o.availableStock || 0), 0);
  const activeListings = offers.filter(o => o.status === 'ACTIVE').length;
  const lowStock = offers.filter(o => (o.availableStock || 0) <= 5 && (o.availableStock || 0) > 0);
  const emptyStock = offers.filter(o => (o.availableStock || 0) === 0);
  return { totalKeys, activeListings, lowStock, emptyStock, offers };
}

module.exports = { getOffers, createOffer, updateOfferPrice, addKeysToOffer, getOrders, getOfferStats };
