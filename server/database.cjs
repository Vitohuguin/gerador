const { createClient } = require('@supabase/supabase-js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'usage.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS usage_tracking (
    userId TEXT PRIMARY KEY,
    promptsThisMonth INTEGER NOT NULL DEFAULT 0,
    contractsThisMonth INTEGER NOT NULL DEFAULT 0,
    projectsCreated INTEGER NOT NULL DEFAULT 0,
    periodStart TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

function getAdmin() {
  return admin;
}

const users = {
  async findByEmail(email) {
    const { data } = await getAdmin().from('users').select('*').eq('email', email).maybeSingle();
    return data || null;
  },
  async findById(id) {
    const { data } = await getAdmin().from('users').select('*').eq('id', id).maybeSingle();
    return data || null;
  },
  async create({ id, name, email, password, plan }) {
    const { data } = await getAdmin().from('users').insert({ id, name, email, password, plan }).select().single();
    return data;
  },
  async updatePlan(id, plan) {
    const { data, error } = await getAdmin().from('users').update({ plan }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const allowed = ['name', 'avatar', 'company', 'phone', 'bio', 'location', 'website'];
    const filtered = {};
    for (const k of allowed) {
      if (updates[k] !== undefined) filtered[k] = updates[k];
    }
    if (Object.keys(filtered).length === 0) return this.findById(id);
    const { data } = await getAdmin().from('users').update(filtered).eq('id', id).select().single();
    return data;
  },
};

const subscriptions = {
  async findByUserId(userId) {
    const { data } = await getAdmin()
      .from('subscriptions').select('*').eq('userId', userId).order('createdAt', { ascending: false }).limit(1).maybeSingle();
    return data || null;
  },
  async create({ id, userId, planId, caktoSubscriptionId, status, currentPeriodStart, currentPeriodEnd, paymentMethod }) {
    const { data } = await getAdmin().from('subscriptions').insert({
      id, userId, planId, caktoSubscriptionId: caktoSubscriptionId || '',
      status: status || 'active',
      currentPeriodStart: currentPeriodStart || '',
      currentPeriodEnd: currentPeriodEnd || '',
      paymentMethod: paymentMethod || '',
    }).select().single();
    return data;
  },
  async cancel(userId) {
    await getAdmin().from('subscriptions')
      .update({ status: 'canceled', cancelAtPeriodEnd: 1, updatedAt: new Date().toISOString() })
      .eq('userId', userId).eq('status', 'active');
  },
};

const payments = {
  async create({ id, userId, planId, value, method, status, caktoOrderId }) {
    await getAdmin().from('payment_history').insert({
      id, userId, planId, value, method: method || '', status: status || 'paid', caktoOrderId: caktoOrderId || '',
    });
  },
  async listByUser(userId) {
    const { data } = await getAdmin()
      .from('payment_history').select('*').eq('userId', userId).order('createdAt', { ascending: false });
    return data || [];
  },
};

function now() { return new Date().toISOString(); }

const USAGE_FIELDS = ['promptsThisMonth', 'contractsThisMonth', 'projectsCreated'];

const usage = {
  getOrCreate(userId) {
    let row = sqlite.prepare('SELECT * FROM usage_tracking WHERE userId = ?').get(userId);
    if (!row) {
      sqlite.prepare('INSERT INTO usage_tracking (userId, promptsThisMonth, contractsThisMonth, projectsCreated, periodStart) VALUES (?, 0, 0, 0, ?)').run(userId, now());
      row = sqlite.prepare('SELECT * FROM usage_tracking WHERE userId = ?').get(userId);
    }
    return row;
  },
  increment(userId, field) {
    if (!USAGE_FIELDS.includes(field)) throw new Error('Campo inválido');
    this.getOrCreate(userId);
    sqlite.prepare(`UPDATE usage_tracking SET "${field}" = "${field}" + 1 WHERE userId = ?`).run(userId);
    const row = sqlite.prepare(`SELECT "${field}" FROM usage_tracking WHERE userId = ?`).get(userId);
    return row[field] || 0;
  },
  getCount(userId, field) {
    if (!USAGE_FIELDS.includes(field)) throw new Error('Campo inválido');
    const row = sqlite.prepare(`SELECT "${field}" FROM usage_tracking WHERE userId = ?`).get(userId);
    return row ? (row[field] || 0) : 0;
  },
};

module.exports = { users, subscriptions, payments, usage };
