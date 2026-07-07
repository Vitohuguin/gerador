const CAKTO_BASE = 'https://api.cakto.com.br';

class CaktoClient {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async authenticate() {
    if (Date.now() < this.tokenExpiresAt) return;

    const response = await fetch(`${CAKTO_BASE}/public_api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cakto auth failed: ${err}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  }

  async request(method, path, body = null) {
    await this.authenticate();

    const opts = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(`${CAKTO_BASE}${path}`, opts);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cakto API error ${response.status}: ${err}`);
    }
    return response.json();
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  del(path) { return this.request('DELETE', path); }

  async listProducts() {
    return this.get('/public_api/products/');
  }

  async createProduct({ name, description, price, type, salesPage }) {
    return this.post('/public_api/products/', {
      name, description, price, type,
      salesPage: salesPage || '',
    });
  }

  async listOffers(productId) {
    return this.get(`/public_api/products/${productId}/offers/`);
  }

  async createOffer({ product, name, price, type, intervalType, interval, recurrencePeriod, quantityRecurrences, trialDays }) {
    return this.post('/public_api/offers/', {
      product,
      name,
      price,
      type,
      intervalType: intervalType || 'month',
      interval: interval || 1,
      recurrence_period: recurrencePeriod || 30,
      quantity_recurrences: quantityRecurrences ?? -1,
      trial_days: trialDays || 0,
      max_retries: 3,
      retry_interval: 1,
      status: 'active',
    });
  }

  async createCheckoutSession(offerId, customerEmail, customerName) {
    return this.post('/public_api/checkouts/', {
      offer: offerId,
      customer_email: customerEmail,
      customer_name: customerName,
    });
  }

  async createCustomer({ name, email, document }) {
    return this.post('/public_api/customers/', {
      name,
      email,
      document: document || '',
    });
  }

  async listSubscriptions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/public_api/subscriptions/${qs ? '?' + qs : ''}`);
  }

  async cancelSubscription(subscriptionId) {
    return this.post(`/public_api/subscriptions/${subscriptionId}/cancel/`);
  }

  async createWebhook({ name, url, products, events }) {
    return this.post('/public_api/webhook/', {
      name, url, products, events,
    });
  }
}

module.exports = { CaktoClient };
