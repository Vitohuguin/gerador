const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([\w._-]+)\s*=\s*(.+?)\s*$/);
    if (m) {
      const val = m[2].replace(/^['"]|['"]$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = val;
    }
  }
}

const { users, subscriptions, payments, usage } = require('./database.cjs');
const { CaktoClient } = require('./cakto.cjs');

const app = express();
app.use(helmet());
app.use(cookieParser());
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://promptforge-ai.vercel.app',
  'https://promptforge-ai.netlify.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

let cakto = null;
if (process.env.CAKTO_CLIENT_ID && process.env.CAKTO_CLIENT_SECRET) {
  cakto = new CaktoClient(process.env.CAKTO_CLIENT_ID, process.env.CAKTO_CLIENT_SECRET);
  console.log('🔌 Cakto API configurada');
}

const TOKEN_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function setAuthCookie(res, token) {
  res.cookie('token', token, TOKEN_COOKIE_OPTS);
}

function clearAuthCookie(res) {
  res.clearCookie('token', { path: '/' });
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  const token = (header?.startsWith('Bearer ') ? header.slice(7) : null) || cookieToken;
  if (!token) {
    console.warn('⚠️ Auth: token não encontrado (cookie:', !!cookieToken, 'header:', !!header);
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    let authUserId = null;

    try {
      const { data: { user: au }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && au) authUserId = au.id;
    } catch (e) {
      console.warn('⚠️ Auth: getUser falhou:', e.message);
    }

    if (!authUserId) {
      try {
        const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
        if (decoded && decoded.sub) authUserId = decoded.sub;
      } catch (e) {
        console.warn('⚠️ Auth: JWT verify falhou:', e.message);
      }
    }

    if (!authUserId) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const user = await users.findById(authUserId);
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, role: rest.email === ADMIN_EMAIL ? 'admin' : 'user' };
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validatePassword(password) {
  if (!password || password.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula';
  if (!/[a-z]/.test(password)) return 'Senha deve conter pelo menos uma letra minúscula';
  if (!/\d/.test(password)) return 'Senha deve conter pelo menos um número';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Senha deve conter pelo menos um caractere especial';
  return null;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MINUTES = 15;
const loginAttempts = new Map();

function checkLoginLockout(email) {
  const entry = loginAttempts.get(email.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.lockoutUntil) {
    loginAttempts.delete(email.toLowerCase());
    return null;
  }
  return Math.ceil((entry.lockoutUntil - Date.now()) / 1000);
}

function recordFailedAttempt(email) {
  const key = email.toLowerCase();
  const entry = loginAttempts.get(key) || { count: 0, lockoutUntil: 0 };
  entry.count++;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockoutUntil = Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000;
  }
  loginAttempts.set(key, entry);
}

function recordSuccessfulLogin(email) {
  loginAttempts.delete(email.toLowerCase());
}

// ===================== AUTH ROUTES =====================

app.post('/api/auth/register', rateLimit({ windowMs: 60000, max: 5, message: 'Muitas tentativas de cadastro. Aguarde.' }), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (signUpError) {
      return res.status(400).json({ error: 'Não foi possível completar o cadastro. Verifique os dados e tente novamente.' });
    }

    const authUser = signUpData.user;
    if (!authUser) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    let userRecord = await users.findById(authUser.id);
    if (!userRecord) {
      userRecord = await users.create({
        id: authUser.id,
        name,
        email: email.toLowerCase(),
        password: '',
        plan: 'none',
      }).catch(() => null);
    }

    const token = jwt.sign({ sub: authUser.id, email: email.toLowerCase() }, SUPABASE_JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    res.status(201).json({ token, user: sanitizeUser(userRecord || { id: authUser.id, name, email: email.toLowerCase(), plan: 'none' }) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar' });
  }
});

app.post('/api/auth/login', rateLimit({ windowMs: 60000, max: 10, message: 'Muitas tentativas de login. Aguarde.' }), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const lockoutRemaining = checkLoginLockout(email);
    if (lockoutRemaining) {
      return res.status(429).json({
        error: `Conta temporariamente bloqueada. Tente novamente em ${lockoutRemaining} segundos.`,
        code: 'ACCOUNT_LOCKED',
        retryAfter: lockoutRemaining,
      });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      recordFailedAttempt(email);
      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({ error: 'Confirme seu email antes de fazer login' });
      }
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }
      return res.status(401).json({ error: error.message });
    }

    recordSuccessfulLogin(email);

    let user = await users.findByEmail(email.toLowerCase());
    if (!user) {
      const authUser = data.user;
      user = await users.create({
        id: authUser.id,
        name: authUser.user_metadata?.name || email.split('@')[0],
        email: email.toLowerCase(),
        password: '',
        plan: 'none',
      });
    }

    const token = data.session.access_token;
    setAuthCookie(res, token);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno ao fazer login' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const updated = await users.update(req.user.id, req.body);
    res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// ===================== PLAN / CHECKOUT ROUTES =====================

const PLAN_OFFER_IDS = {};

async function ensureCaktoProducts() {
  if (!cakto) return;
  try {
    const products = await cakto.listProducts();
    const existing = products.results || [];
    const allOffers = await cakto.get('/public_api/offers/').catch(() => ({ results: [] }));
    const existingOffers = allOffers.results || [];

    const plans = [
      { id: 'starter', name: 'PromptForge Starter', price: 29.90, type: 'subscription' },
      { id: 'pro', name: 'PromptForge Pro', price: 47.00, type: 'subscription' },
    ];

    for (const plan of plans) {
      let product = existing.find(p => p.name === plan.name);
      if (!product) {
        product = await cakto.createProduct({
          name: plan.name,
          description: `Plano ${plan.name.replace('PromptForge ', '')} - PromptForge AI`,
          price: plan.price,
          type: plan.type,
          salesPage: process.env.FRONTEND_URL || '',
        });
        console.log(`✅ Produto Cakto criado: ${plan.name} (${product.id})`);

        const offer = await cakto.createOffer({
          product: product.id,
          name: `Assinatura ${plan.name.replace('PromptForge ', '')}`,
          price: plan.price,
          type: 'subscription',
          intervalType: 'month',
          interval: 1,
          recurrencePeriod: 30,
          quantityRecurrences: -1,
          trialDays: 7,
        });
        console.log(`✅ Oferta Cakto criada para: ${plan.name} (${offer.id})`);
        PLAN_OFFER_IDS[plan.id] = offer.id;
      } else {
        const offer = existingOffers.find(o => o.product === product.id);
        PLAN_OFFER_IDS[plan.id] = offer?.id || product.id;
      }
    }
    console.log('✅ Produtos Cakto sincronizados');
  } catch (err) {
    console.error('❌ Erro ao sincronizar produtos Cakto:', err.message);
  }
}

app.post('/api/plans/checkout', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId || !['starter', 'pro'].includes(planId)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    if (!cakto) {
      return res.status(400).json({ error: 'Cakto não configurado' });
    }

    const offerId = PLAN_OFFER_IDS[planId];
    if (!offerId) {
      return res.status(400).json({ error: 'Oferta Cakto não encontrada. Execute /api/plans/sync primeiro.' });
    }

    res.json({ checkoutUrl: `https://pay.cakto.com.br/${offerId}`, offerId });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Erro ao criar checkout: ' + err.message });
  }
});

app.post('/api/plans/sync', authMiddleware, async (req, res) => {
  try {
    if (!cakto) return res.status(400).json({ error: 'Cakto não configurado' });
    await ensureCaktoProducts();
    res.json({ ok: true, offers: PLAN_OFFER_IDS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subscription', authMiddleware, async (req, res) => {
  const [sub, history] = await Promise.all([
    subscriptions.findByUserId(req.user.id),
    payments.listByUser(req.user.id),
  ]);
  res.json({ subscription: sub || null, history });
});

app.post('/api/subscription/cancel', authMiddleware, async (req, res) => {
  try {
    const sub = await subscriptions.findByUserId(req.user.id);
    if (!sub) return res.status(400).json({ error: 'Nenhuma assinatura ativa' });

    if (sub.caktoSubscriptionId && cakto) {
      await cakto.cancelSubscription(sub.caktoSubscriptionId).catch(() => {});
    }

    await Promise.all([
      subscriptions.cancel(req.user.id),
      users.updatePlan(req.user.id, 'none'),
    ]);
    res.json({ ok: true, plan: 'none' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== WEBHOOK CAKTO =====================

function verifyWebhookSignature(req, res, next) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!secret) return next();
  const signature = req.headers['x-webhook-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'Assinatura do webhook ausente' });
  }
  const raw = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (signature !== expected) {
    console.warn('⚠️ Assinatura do webhook inválida');
    return res.status(401).json({ error: 'Assinatura do webhook inválida' });
  }
  next();
}

app.post('/api/webhooks/cakto', verifyWebhookSignature, async (req, res) => {
  try {
    const body = req.body;
    const eventType = body.event || '';
    const items = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : []);

    console.log(`📬 Webhook Cakto: ${eventType} (${items.length} item(ns))`);

    if (eventType === 'purchase_approved' || eventType === 'subscription_created' || eventType === 'subscription_renewed') {
      for (const item of items) {
        const customerEmail = item.customer?.email || '';
        const customerName = item.customer?.name || '';
        const orderValue = parseFloat(item.amount || 0);
        const paymentMethod = item.paymentMethod || item.paymentMethodName || '';
        const caktoOrderId = item.id || '';
        const caktoSubscriptionId = item.subscription || '';
        const productName = item.product?.name || '';

        let planId = 'pro';
        if (productName.toLowerCase().includes('starter')) planId = 'starter';
        else if (productName.toLowerCase().includes('agency')) planId = 'pro';

        if (item.offer_type === 'orderbump') continue;

        if (!customerEmail) {
          console.warn('⚠️ Webhook ignorado: sem email do cliente');
          continue;
        }

        let user = await users.findByEmail(customerEmail.toLowerCase());

        if (!user) {
          user = await users.create({
            id: uuidv4(),
            name: customerName || 'Cliente Cakto',
            email: customerEmail.toLowerCase(),
            password: '',
            plan: 'none',
          });
        }

        await users.updatePlan(user.id, planId);

        const periodStart = new Date().toISOString();
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        if (caktoSubscriptionId) {
          await subscriptions.create({
            id: uuidv4(),
            userId: user.id,
            planId,
            caktoSubscriptionId,
            status: 'active',
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            paymentMethod,
          });
        }

        await payments.create({
          id: uuidv4(),
          userId: user.id,
          planId,
          value: orderValue,
          method: paymentMethod,
          status: 'paid',
          caktoOrderId,
        });

        console.log(`✅ ${planId} liberado para ${user.email} (pedido: ${caktoOrderId})`);
      }
    }

    if (eventType === 'subscription_canceled') {
      for (const item of (Array.isArray(body.data) ? body.data : [body.data])) {
        const customerEmail = item.customer?.email || '';
        const user = customerEmail ? await users.findByEmail(customerEmail.toLowerCase()) : null;
        if (user) {
          await Promise.all([
            users.updatePlan(user.id, 'none'),
            subscriptions.cancel(user.id),
          ]);
          console.log(`❌ Assinatura cancelada para ${user.email}`);
        }
      }
    }

    if (eventType === 'chargeback' || eventType === 'refund') {
      for (const item of (Array.isArray(body.data) ? body.data : [body.data])) {
        const customerEmail = item.customer?.email || '';
        const user = customerEmail ? await users.findByEmail(customerEmail.toLowerCase()) : null;
        if (user) {
          await users.updatePlan(user.id, 'none');
          console.log(`⚠️ Plano removido (${eventType}) - ${user.email}`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ received: true });
  }
});

app.post('/api/auth/reset-password', rateLimit({ windowMs: 60000, max: 3, message: 'Muitas tentativas. Aguarde.' }), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

    await supabaseAnon.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    }).catch(() => {});

    res.json({ ok: true, message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
  }
});

app.post('/api/auth/update-password', rateLimit({ windowMs: 60000, max: 5, message: 'Muitas tentativas. Aguarde.' }), async (req, res) => {
  try {
    const { accessToken, password } = req.body;
    if (!accessToken || !password) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }
    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !user) {
      return res.status(401).json({ error: 'Link inválido ou expirado' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ ok: true, message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.delete('/api/auth/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    try { await supabaseAdmin.auth.admin.deleteUser(userId); } catch {}
    try { await supabaseAdmin.from('users').delete().eq('id', userId); } catch {}
    try { await supabaseAdmin.from('subscriptions').delete().eq('userId', userId); } catch {}
    try { await supabaseAdmin.from('payment_history').delete().eq('userId', userId); } catch {}
    clearAuthCookie(res);
    res.json({ ok: true, message: 'Conta excluída permanentemente' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
});

// ===================== ADMIN ROUTES =====================

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }
  next();
}

app.get('/api/admin/check', authMiddleware, (req, res) => {
  res.json({ isAdmin: req.user.email === ADMIN_EMAIL });
});

app.get('/api/admin/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, plan, company, phone, createdAt')
      .order('createdAt', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ users: data || [] });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

app.put('/api/admin/users/:id/plan', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!plan || !['none', 'starter', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido. Use: none, starter ou pro' });
    }

    const updated = await users.updatePlan(id, plan);
    if (!updated) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    console.error('Admin update plan error:', err);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
});

// ===================== NVIDIA / EXISTING ROUTES =====================

function generateMockPrompt(data) {
  const lang = data.language === 'en' ? 'English' : 'Português';
  const companyName = data.companyName || 'Empresa';
  const segment = data.segment || data.niche || 'Tecnologia';
  const city = data.city || '';
  const state = data.state || '';
  const country = data.country || 'Brasil';
  const location = [city, state, country].filter(Boolean).join(', ');
  const whatsapp = data.whatsapp || '';
  const phone = data.phone || '';
  const email = data.email || '';
  const instagram = data.instagram || '';
  const facebook = data.facebook || '';
  const googleMaps = data.googleMaps || '';
  const currentSite = data.currentSite || '';

  return `# PROMPT PROFISSIONAL — ${data.objective || 'Landing Page'}

## IDIOMA: ${lang}

## VISÃO GERAL
Projeto profissional de ${data.objective || 'Landing Page'} para a empresa **${companyName}**, segmento de ${segment}, seguindo boas práticas de UX/UI, SEO e performance.

## IDENTIDADE VISUAL
- **Estilo**: ${data.style || 'Moderno'}
- **Paleta**: ${data.primaryColor && data.secondaryColor ? `${data.primaryColor} / ${data.secondaryColor}` : (data.colorScheme || 'Roxo Tech')}
- **Tipografia**: ${data.font || 'Inter'}
- **Tema**: Dark/Light com glassmorphism

## DADOS DA EMPRESA
- **Nome**: ${companyName}
- **Slogan**: ${data.slogan || 'Não informado'}
- **Segmento**: ${segment}
- **Descrição**: ${data.businessDescription || 'Não informado'}
- **Localização**: ${location}
${whatsapp ? `- **WhatsApp**: ${whatsapp}` : ''}
${phone ? `- **Telefone**: ${phone}` : ''}
${email ? `- **E-mail**: ${email}` : ''}
${instagram ? `- **Instagram**: ${instagram}` : ''}
${facebook ? `- **Facebook**: ${facebook}` : ''}
${googleMaps ? `- **Google Maps**: ${googleMaps}` : ''}
${currentSite ? `- **Site Atual**: ${currentSite}` : ''}

## PÚBLICO-ALVO
${data.targetAudience || 'Profissionais que buscam presença digital de alto nível.'}

## ESTRUTURA
${(data.structures || ['Hero', 'Sobre', 'FAQ', 'Contato']).join(', ')}

## ANIMAÇÕES
${(data.animations || ['Scroll Reveal', 'Hover Effects']).join(', ')}

## FUNCIONALIDADES
${(data.functionalities || ['Responsivo', 'SEO']).join(', ')}

## STACK TECNOLÓGICA
${(data.technologies || ['React', 'Next.js', 'Tailwind CSS']).join(', ')}

## PLATAFORMA: ${data.platform || 'Lovable'}

## DIRETRIZES
- Lighthouse > 95
- SEO: Meta tags, Open Graph, JSON-LD
- Acessibilidade: WCAG 2.1 AA
- Mobile-first responsivo
- Animações suaves (prefers-reduced-motion)

## DESCRIÇÃO
${data.description || `Projeto de ${data.objective || 'Landing Page'} para ${companyName}.`}

${data.additionalContext ? `## CONTEXTO ADICIONAL\n${data.additionalContext}` : ''}

---
*Gerado pela PromptForge AI via NVIDIA AI*
`;
}

function generateMockContract(data) {
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

**CONTRATANTE:** ${data.clientName || 'Cliente'} (${data.clientDocument || 'CPF/CNPJ'})
**CONTRATADO:** ${data.companyName || 'Empresa'} (${data.companyDocument || 'CPF/CNPJ'})

**CLÁUSULA PRIMEIRA — ESCOPO**
${data.projectDescription || 'Serviços de desenvolvimento'}

**CLÁUSULA SEGUNDA — PRAZO**
Prazo: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString('pt-BR') : 'A definir'}

**CLÁUSULA TERCEIRA — VALOR**
Valor: R$ ${(data.totalValue || 0).toFixed(2)}
Pagamento: ${(data.paymentMethod || 'PIX').toUpperCase()}

**CLÁUSULA QUARTA — CONFIDENCIALIDADE**
Sigilo absoluto sobre informações compartilhadas.

**CLÁUSULA QUINTA — DIREITOS AUTORAIS**
Transferidos após pagamento integral.

**CLÁUSULA SEXTA — REVISÕES**
3 rodadas inclusas.

**CLÁUSULA SÉTIMA — RESCISÃO**
Notificação prévia de 15 dias.

**CLÁUSULA OITAVA — FORO**
Foro da comarca do contratado.

${data.additionalTerms ? `**DISPOSIÇÕES ADICIONAIS:**\n${data.additionalTerms}` : ''}
---
Local e data: ${new Date().toLocaleDateString('pt-BR')}

_________________________          _________________________
CONTRATANTE                        CONTRATADO
`;
}

function generateMockProposal(data) {
  return `# PROPOSTA COMERCIAL

Prezado(a) ${data.clientName || 'Cliente'},

Apresentamos nossa proposta para desenvolvimento do seu projeto.

## ESCOPO
${data.projectDescription || 'Projeto digital profissional.'}

## ENTREGÁVEIS
- Site completo responsivo
- Design system
- Documentação técnica
- 30 dias de suporte

## CRONOGRAMA
${data.timeline || '30 dias corridos'}

## INVESTIMENTO
**Valor:** R$ ${(data.totalValue || 0).toFixed(2)}
**Condições:** 50% entrada + 50% na entrega

## TECNOLOGIAS
${(data.technologies || ['React', 'Next.js', 'Tailwind CSS']).join(', ')}

${data.additionalNotes ? `## OBSERVAÇÕES\n${data.additionalNotes}` : ''}

---
Atenciosamente,
PromptForge AI
`;
}

async function callNvidia(messages, model = NVIDIA_MODEL, options = {}) {
  const urls = [`https://integrate.api.nvidia.com/v1/chat/completions`];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p ?? 0.9,
          max_tokens: options.max_tokens ?? 8192,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        return response.json();
      }
      const errText = await response.text();
      console.warn(`⚠️ NVIDIA API (${url}) retornou ${response.status}: ${errText.slice(0, 100)}`);
    } catch (e) {
      console.warn(`⚠️ Erro ao chamar ${url}: ${e.message}`);
    }
  }

  throw new Error('Todas as tentativas de API falharam');
}

async function callWithFallback(messages, mockFn, model = NVIDIA_MODEL) {
  if (!API_KEY || API_KEY.startsWith('nvapi-sua')) {
    console.log('ℹ️ Usando modo mock (sem API key)');
    return { content: mockFn() };
  }

  console.log('🤖 Tentando NVIDIA API...');
  try {
    const result = await callNvidia(messages, model);
    if (process.env.NODE_ENV !== 'production') {
      console.log('📦 Resposta bruta:', JSON.stringify(result).slice(0, 200));
    }
    const content = result.choices?.[0]?.message?.content;
    if (content) {
      console.log('✅ NVIDIA API respondeu!');
      return {
        content,
        id: result.id,
        tokens: result.usage?.total_tokens || 0,
        model: result.model || model,
      };
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ API retornou sem content:', JSON.stringify(result).slice(0, 100));
    }
  } catch (error) {
    console.warn(`⚠️ Fallback: ${error.message}`);
  }
  return { content: mockFn() };
}

app.get('/api/usage', authMiddleware, rateLimit({ windowMs: 60000, max: 30, message: 'Muitas consultas de uso. Aguarde.' }), async (req, res) => {
  try {
    const u = await usage.getOrCreate(req.user.id);
    const plan = req.user.plan || 'starter';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
    res.json({
      prompts: { used: u.promptsThisMonth || 0, limit: limits.prompts },
      contracts: { used: u.contractsThisMonth || 0, limit: limits.contracts },
      projects: { used: u.projectsCreated || 0, limit: limits.projects },
    });
  } catch {
    res.json({ prompts: { used: 0, limit: 100 }, contracts: { used: 0, limit: 20 }, projects: { used: 0, limit: 5 } });
  }
});

app.post('/api/generate-prompt', authMiddleware, rateLimit({ windowMs: 60000, max: 20, message: 'Muitas gerações de prompt. Aguarde um momento.' }), requirePlan, checkLimit, async (req, res) => {
  const data = req.body;

  const systemPrompt = `Você é um engenheiro de prompts world-class, especialista em criar prompts ULTRA-DETALHADOS e profissionais para ferramentas de geração de sites com IA (Lovable, Bolt.new, v0, Cursor, Claude Code, Replit).

SUAS RESPONSABILIDADES:
1. Gerar prompts que, quando copiados e colados em qualquer ferramenta de IA, resultem em um site profissional, completo e funcional.
2. Cada prompt deve conter TUDO que a IA precisa para construir o site do zero — sem ambiguidades, sem deixar nada para interpretação.
3. O prompt deve ser escrito em Markdown bem estruturado, com seções claras e detalhadas.

ESTRUTURA OBRIGÓRIA DO PROMPT (todas as seções devem estar presentes):

## 1. CONTEXTO DO PROJETO
- Descrição completa do projeto, incluindo nicho, objetivo e proposta de valor
- Quem é o público-alvo e quais são suas dores/necessidades
- Tom de voz e personalidade da marca

## 2. IDENTIDADE VISUAL
- Paleta de cores exata (primária, secundária, acento, fundo, texto) com códigos hex se possível
- Tipografia (fonte principal, secundária, tamanhos para H1, H2, H3, body, small)
- Estilo visual detalhado (não apenas "moderno", mas DESCREVER o que "moderno" significa neste contexto)
- Espaçamentos, bordas, sombras, gradientes
- Referências visuais (estilo de cards, botões, inputs)

## 3. LAYOUT E ESTRUTURA
Para CADA seção do site, especificar:
- Nome da seção
- Elementos visuais presentes (título, subtítulo, imagem, botão, ícone, etc.)
- Layout interno (grid, flex, colunas, alinhamento)
- Comportamento em mobile, tablet e desktop
- Conteúdo específico (textos, CTAs, dados)

## 4. COMPONENTES UI
Para cada tipo de componente:
- Header/Navbar: itens do menu, comportamento ao scroll, logo position, mobile hamburger
- Hero: headline, subheadline, CTA principal, CTA secundário, imagem/vídeo de fundo, partículas/elementos decorativos
- Cards: estilo, bordas, hover effects, sombras, conteúdo interno
- Botões: variantes (primary, secondary, ghost), tamanhos, hover states, ícones
- Footer: colunas, links, redes sociais, newsletter, copyright
- Formulários: campos, validação, estados (vazio, erro, sucesso), responsividade
- Seções de prova social: depoimentos, logos de clientes, estatísticas, badges

## 5. ANIMAÇÕES E INTERAÇÕES
Para cada animação, especificar:
- Tipo: scroll reveal, hover, click, page load, parallax
- Propriedades: opacidade, translateX/Y, scale, rotate
- Duração e easing
- Trigger (quando ativa)
- Respect prefers-reduced-motion

## 6. CONTEÚDO REAL
- Textos placeholder que façam sentido para o nicho (não "Lorem ipsum")
- CTAs persuasivos e específicos
- Dados de exemplo realistas (preços, nomes, estatísticas)
- Copywriting que converte

## 7. FUNCIONALIDADES TÉCNICAS
- Responsividade completa (mobile-first)
- Performance (Lazy loading, image optimization)
- SEO (meta tags, Open Graph, schema markup)
- Acessibilidade (WCAG 2.1 AA, aria-labels, contraste)
- Animações suaves e performáticas
- Dark/Light mode se aplicável

## 8. STACK TECNOLÓGICA
- Se as tecnologias foram especificadas, use EXATAMENTE essas
- Se a tecnologia for "auto" ou estiver vazia, ESCOLHA a melhor stack baseada no: nicho, objetivo, plataforma-alvo, complexidade e performance
- Justifique brevemente sua escolha de stack
- Framework específico a ser usado
- Bibliotecas de componentes
- Bibliotecas de animação
- Ferramentas de build
- Estrutura de pastas recomendada

## 9. FOCO POR PLATAFORMA
Adapte o prompt de acordo com a plataforma escolhida:

- **Lovable**: Design premium, UI/UX moderna, animações fluidas, experiência visual de alto nível e interfaces inspiradas em Awwwards.
- **Bolt.new**: Desenvolvimento full-stack completo com frontend, backend, banco de dados, autenticação e deploy integrados.
- **v0**: Geração de componentes React/Next.js utilizando Shadcn/UI, Tailwind CSS, acessibilidade e interfaces reutilizáveis.
- **Cursor**: Código completo, arquitetura escalável, componentização, boas práticas, refatoração inteligente e desenvolvimento pronto para produção.
- **Claude Code**: Explicações detalhadas, código organizado, componentes reutilizáveis, arquitetura limpa. Documente bem o código.
- **Replit**: Prototipagem rápida, projeto simples, dependências claras, execução online. Inclua package.json completo.
- **OpenCode**: Desenvolvimento de aplicações premium com design de nível Lovable, UI/UX moderna, animações elegantes, arquitetura limpa, código modular, TypeScript, performance, SEO, responsividade, acessibilidade e organização profissional, gerando projetos completos prontos para produção.
- **Windsurf**: Fluxo de trabalho contínuo, refatoração, sugestões de código, produtividade. Inclua configs de IDE.
- **GitHub Copilot**: Autocomplete inteligente, snippets, testes, documentação inline. Use comentários descritivos.

REGRAS:
- NUNCA use "Lorem ipsum" — sempre escreva conteúdo real e persuasivo
- NUNCA seja vago — cada detalhe deve ser EXPLÍCITO
- SEMPRE especifique comportamentos mobile
- SEMPRE inclua estados interativos (hover, focus, active, disabled)
- O prompt deve ter no mínimo 1500 palavras
- Seja tão específico que um desenvolvedor júnior consiga implementar apenas lendo o prompt
- Termina o prompt com uma nota indicando a plataforma-alvo`;

  const userPrompt = `Gere um prompt profissional completo para o seguinte projeto:

**Nicho:** ${data.niche || 'Não especificado'}
**Objetivo:** ${data.objective || 'Landing Page'}
**Estilo Visual:** ${data.style || 'Moderno'}
**Cores:** ${data.primaryColor && data.secondaryColor ? `${data.primaryColor} (primária) / ${data.secondaryColor} (secundária)` : (data.colorScheme || 'Personalizada')}
**Tipografia:** ${data.font || 'Inter'}
**Plataforma Alvo:** ${data.platform || 'Lovable'}
**Tecnologias:** ${(data.technologies || []).join(', ') || 'React, Tailwind CSS'}
**Animações Desejadas:** ${(data.animations || []).join(', ') || 'Scroll Reveal, Hover Effects'}
**Estrutura do Site:** ${(data.structures || []).join(', ') || 'Hero, Sobre, Funcionalidades, FAQ, Contato'}
**Funcionalidades:** ${(data.functionalities || []).join(', ') || 'Responsivo, SEO, Performance'}
**Público-Alvo:** ${data.targetAudience || 'Geral'}
**Descrição do Projeto:** ${data.description || 'Projeto profissional de site'}
${data.additionalContext ? `**Contexto Adicional:** ${data.additionalContext}` : ''}

**DADOS DA EMPRESA:**
- Nome: ${data.companyName || 'Não informado'}
- Slogan: ${data.slogan || 'Não informado'}
- Segmento: ${data.segment || 'Não informado'}
- Descrição do Negócio: ${data.businessDescription || 'Não informado'}
- País: ${data.country || 'Brasil'}
- Estado: ${data.state || 'Não informado'}
- Cidade: ${data.city || 'Não informado'}
- Bairro: ${data.neighborhood || 'Não informado'}
- Endereço: ${data.address || 'Não informado'}
- WhatsApp: ${data.whatsapp || 'Não informado'}
- Telefone: ${data.phone || 'Não informado'}
- E-mail: ${data.email || 'Não informado'}
- Site Atual: ${data.currentSite || 'Não informado'}
- Google Maps: ${data.googleMaps || 'Não informado'}
- Instagram: ${data.instagram || 'Não informado'}
- Facebook: ${data.facebook || 'Não informado'}
${data.customObjective ? `**Objetivo Customizado:** ${data.customObjective}` : ''}

IMPORTANTE: Use os dados da empresa para personalizar o conteúdo do site (textos, CTAs, contatos, localização). O prompt gerado deve ser EXTREMAMENTE detalhado, com textos reais (não placeholder), especificações técnicas precisas, e instruções suficientemente claras para que a ferramenta de IA escolhida consiga gerar o site completo sem precisar de mais informações. Adapte o estilo e estrutura do prompt para a plataforma-alvo.`;

  const result = await callWithFallback(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    () => generateMockPrompt(data)
  );

  try { await usage.increment(req.user.id, 'promptsThisMonth'); } catch {}

  res.json({
    id: result.id || 'mock',
    content: result.content,
    tokens: result.tokens || 1500,
    estimatedTime: 30,
    model: result.model || 'mock',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/generate-contract', authMiddleware, rateLimit({ windowMs: 60000, max: 15, message: 'Muitas gerações de contrato. Aguarde um momento.' }), requirePlan, checkLimit, async (req, res) => {
  const data = req.body;
  const result = await callWithFallback(
    [
      {
        role: 'system',
        content: `Você é um advogado especialista em contratos de prestação de serviços de tecnologia e desenvolvimento web. Gere contratos profissionais, completos e legalmente robustos para o Brasil.

ESTRUTURA OBRIGATÓRIA DO CONTRATO:
1. Cabeçalho com identificação das partes (contratante e contratado)
2. Objeto do contrato (descrição detalhada dos serviços)
3. Valor e condições de pagamento (detalhamento de parcelas, reajustes)
4. Prazo de execução (cronograma, marcos, entregas parciais)
5. Obrigações do contratado
6. Obrigações do contratante
7. Propriedade intelectual e direitos autorais
8. Confidencialidade e sigilo
9. Garantias e suporte pós-entrega
10. Revisões e rodadas de alterações
11. Rescisão contratual (multas, notificações)
12. Foro e legislação aplicável
13. Disposições gerais
14. Assinaturas

REGRAS:
- Use linguagem formal jurídica mas acessível
- Inclua cláusulas que protejam ambas as partes
- Seja específico sobre prazos, valores e entregáveis
- Inclua cláusula de reajuste baseada no IPCA
- Adicione cláusula de propriedade intelectual clara
- Formate com numeração romana para cláusulas`
      },
      {
        role: 'user',
        content: `Crie um contrato de prestação de serviços com:\nTipo: ${data.type || 'Desenvolvimento'}\nContratante: ${data.clientName || 'Cliente'} (${data.clientDocument || ''})\nContratado: ${data.companyName || 'Empresa'} (${data.companyDocument || ''})\nValor: R$ ${data.totalValue || 0}\nPagamento: ${data.paymentMethod || 'PIX'}\nPrazo: ${data.dueDate || 'A definir'}\nDescrição: ${data.projectDescription || 'Serviços'}\nCláusulas: ${(data.clauses || []).join(', ')}`
      },
    ],
    () => generateMockContract(data)
  );

  try { await usage.increment(req.user.id, 'contractsThisMonth'); } catch {}

  res.json({
    id: result.id || 'mock',
    content: result.content,
    tokens: result.tokens || 1000,
    estimatedTime: 20,
    model: result.model || 'mock',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/generate-proposal', authMiddleware, rateLimit({ windowMs: 60000, max: 10, message: 'Muitas gerações de proposta. Aguarde um momento.' }), requirePro, async (req, res) => {
  const data = req.body;
  const result = await callWithFallback(
    [
      {
        role: 'system',
        content: `Você é um especialista em vendas e propostas comerciais para agências e freelancers de tecnologia. Gere propostas comerciais profissionais, persuasivas e detalhadas.

ESTRUTURA OBRIGATÓRIA DA PROPOSTA:
1. Capa — Título impactante, dados do cliente e prestador
2. Sumário Executivo — Visão geral do projeto em 3-4 parágrafos
3. Entendimento do Projeto — Demonstre que entendeu a necessidade do cliente
4. Escopo Detalhado — Liste cada entrega com descrição, quantidade e valor
5. Cronograma — Timeline com fases e entregas
6. Investimento — Tabela de valores com detalhamento por fase
7. Condições Comerciais — Forma de pagamento, prazos, garantias
8. Por que nos escolher — Diferenciais e cases de sucesso
9. Próximos Passos — Call to action claro
10. Validez da proposta

REGRAS:
- Tom profissional mas caloroso
- Use dados reais e específicos (não genéricos)
- Inclua métricas e números quando possível
- Seja persuasivo mas honesto
- Formate com Markdown limpo e profissional`
      },
      {
        role: 'user',
        content: `Crie uma proposta comercial profissional para:\nCliente: ${data.clientName || 'Cliente'}\nDescrição: ${data.projectDescription || 'Projeto'}\nValor: R$ ${data.totalValue || 0}\nPrazo: ${data.timeline || '30 dias'}\nTecnologias: ${(data.technologies || []).join(', ')}`
      },
    ],
    () => generateMockProposal(data)
  );

  res.json({
    id: result.id || 'mock',
    content: result.content,
    tokens: result.tokens || 800,
    estimatedTime: 15,
    model: result.model || 'mock',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/improve-prompt', authMiddleware, rateLimit({ windowMs: 60000, max: 10, message: 'Muitas requisições de melhoria. Aguarde.' }), requirePro, async (req, res) => {
  const { content } = req.body;
  const result = await callWithFallback(
    [
      {
        role: 'system',
        content: `Você é um especialista em UX, UI, SEO e engenharia de prompts. Sua tarefa é MELHORAR um prompt existente para geração de sites com IA.

MELHORIAS OBRIGATÓRIAS:
1. UX/UI — Adicione: hierarquia visual, fluxo do usuário, microinterações, estados de componentes (hover, focus, active, disabled), spacing system consistente, grid responsivo
2. SEO — Adicione: meta title/description otimizados, Open Graph tags, schema markup JSON-LD, heading hierarchy semântica, alt texts para imagens
3. Performance — Adicione: lazy loading, image optimization (WebP/AVIF), critical CSS, font loading strategy, CLS prevention
4. Acessibilidade — Adicione: ARIA labels, contraste WCAG 2.1 AA, keyboard navigation, screen reader support, focus management
5. Copywriting — Melhore os textos para serem mais persuasivos, com CTAs claros e benefícios específicos
6. Estrutura — Adicione qualquer seção que esteja faltando e que seja importante para o nicho
7. Detalhamento — Transforme qualquer instrução vaga em instruções EXPLÍCITAS e acionáveis

REGRAS:
- Mantenha a essência e o objetivo original do prompt
- NUNCA remova funcionalidades existentes — apenas adicione
- Adicione no mínimo 30% mais conteúdo ao prompt
- Preserve o formato Markdown
- O resultado final deve ser MELHOR que o original em todas as dimensões`
      },
      {
        role: 'user',
        content: `Melhore este prompt adicionando detalhes de UX, UI, SEO, performance, acessibilidade e copywriting:\n\n${content}`
      },
    ],
    () => content + '\n\n✅ Prompt melhorado com diretrizes adicionais de UX/UI e SEO.'
  );
  res.json({ content: result.content });
});

app.post('/api/correct-prompt', authMiddleware, rateLimit({ windowMs: 60000, max: 10, message: 'Muitas requisições de correção. Aguarde.' }), requirePro, async (req, res) => {
  const { content } = req.body;
  const result = await callWithFallback(
    [
      {
        role: 'system',
        content: `Você é um revisor profissional especializado em prompts para IA. Sua tarefa é CORRIGIR e PADRONIZAR um prompt existente.

CORREÇÕES OBRIGATÓRIAS:
1. Português — Corrija erros gramaticais, ortográficos, de pontuação e concordância
2. Consistência — Padronize termos (ex: use sempre "seção" ou sempre "bloco", não misture)
3. Estrutura — Reorganize as seções em ordem lógica e hierárquica
4. Clareza — Reescreva frases ambíguas ou confusas de forma clara e objetiva
5. Formatação — Padronize listas, negritos, títulos e espaçamento em Markdown
6. Completude — Identifique seções incompletas e sinalize (ou complete se possível)
7. Redundância — Remova repetições desnecessárias mantendo a informação

FORMATO DE SAÍDA:
- Corrija o prompt inteiro
- Adicione no final uma seção "## Correções Realizadas" listando o que foi alterado
- Preserve todo o conteúdo original — apenas corrija e melhore`
      },
      {
        role: 'user',
        content: `Corrija erros de português, estrutura e consistência neste prompt:\n\n${content}`
      },
    ],
    () => content + '\n\n✅ Prompt corrigido e padronizado.'
  );
  res.json({ content: result.content });
});

app.post('/api/optimize-prompt', authMiddleware, rateLimit({ windowMs: 60000, max: 10, message: 'Muitas requisições de otimização. Aguarde.' }), requirePro, async (req, res) => {
  const { content } = req.body;
  const result = await callWithFallback(
    [
      {
        role: 'system',
        content: `Você é um especialista em otimização de prompts para IA. Sua tarefa é OTIMIZAR um prompt existente, reduzindo tokens desnecessários sem perder qualidade.

ESTRATÉGIAS DE OTIMIZAÇÃO:
1. Concisão — Remova palavras de enchimento ("realmente", "bastante", "muito") sem perder significado
2. Compactação — Transforme parágrafos longos em listas objetivas quando apropriado
3. Eliminação — Remova redundâncias e informações duplicadas
4. Essência — Mantenha TODA a informação técnica relevante, mesmo removendo texto
5. Priorização — Coloque as informações mais importantes primeiro
6. Formatação — Use Markdown eficientemente (listas > parágrafos para instruções)

REGRAS CRÍTICAS:
- NÃO remova nenhuma funcionalidade ou especificação técnica
- NÃO simplifique demais — a IA que receber o prompt precisa de detalhes
- Reduza em 20-40% o tamanho total
- Mantenha a pontuação de qualidade do prompt
- Preserve a estrutura de seções Markdown

FORMATO DE SAÍDA:
- Retorne o prompt otimizado
- Adicione no final uma métrica: "## Otimização: X% menor (Y tokens → Z tokens)"`
      },
      {
        role: 'user',
        content: `Otimize este prompt reduzindo tokens desnecessários e mantendo a qualidade:\n\n${content}`
      },
    ],
    () => content + '\n\n✅ Prompt otimizado (estrutura mais enxuta).'
  );
  res.json({ content: result.content });
});

app.post('/api/generate-alternative', authMiddleware, rateLimit({ windowMs: 60000, max: 10, message: 'Muitas requisições de alternativa. Aguarde.' }), requirePro, async (req, res) => {
  const { content } = req.body;
  const result = await callWithFallback(
    [
      {
        role: 'system',
        content: `Você é um criativo especialista em design de interfaces web. Sua tarefa é criar uma versão ALTERNATIVA de um prompt existente, com abordagem visual e estrutural COMPLETAMENTE DIFERENTE.

MUDANÇAS OBRIGATÓRIAS (todas devem ser aplicadas):
1. Layout — Mude completamente o layout (ex: se era single-column, mude para split-screen; se era grid, mude para scroll horizontal)
2. Paleta de Cores — Sugira uma paleta alternativa que transmita a mesma vibe mas visualmente distinta
3. Tipografia — Sugira combinação de fontes diferente
4. Estrutura — Reorganize a ordem das seções ou adicione/remova seções para criar uma experiência diferente
5. Estilo Visual — Mude o estilo (ex: se era minimalista, mude para bold/ousado; se era dark, mude para light clean)
6. Animações — Sugira tipos de animação diferentes
7. Hero — Redesenhe completamente a seção hero com conceito diferente

REGRAS:
- Mantenha TODAS as funcionalidades e conteúdo do prompt original
- A versão alternativa deve ser VISUALMENTE DISTINTA — alguém deveria notar a diferença imediatamente
- Preserve a qualidade e completude do prompt
- Não apenas mude cores — mude o CONCEITO visual
- Adicione um título "## Versão Alternativa — [Nome do Conceito]" no início`
      },
      {
        role: 'user',
        content: `Crie uma versão ALTERNATIVA com abordagem visual e estrutural completamente diferente para:\n\n${content}`
      },
    ],
    () => content + '\n\n## VERSÃO ALTERNATIVA\nAbordagem visual e estrutural diferente.'
  );
  res.json({ content: result.content });
});

const rateLimitStore = new Map();

function rateLimit({ windowMs = 60000, max = 10, message = 'Muitas requisições. Tente novamente em breve.' } = {}) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 0, resetAt: now + windowMs });
    }
    const entry = rateLimitStore.get(key);
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count++;
    if (entry.count > max) {
      return res.status(429).json({ error: message, code: 'RATE_LIMITED', retryAfter: Math.ceil((entry.resetAt - now) / 1000) });
    }
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 60000);

const PLAN_LIMITS = {
  starter: { prompts: 100, contracts: 20, projects: 5 },
  pro: { prompts: Infinity, contracts: Infinity, projects: Infinity },
};

async function requirePlan(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const plan = req.user.plan || 'none';
  if (plan === 'none') {
    return res.status(403).json({ error: 'Assine um plano para usar este recurso', code: 'PLAN_REQUIRED' });
  }
  next();
}

async function requirePro(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const plan = req.user.plan || 'none';
  if (plan !== 'pro') {
    return res.status(403).json({ error: 'Faça upgrade para o plano Pro para usar este recurso', code: 'PRO_REQUIRED' });
  }
  next();
}

async function checkLimit(req, res, next) {
  const plan = req.user.plan || 'starter';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  try {
    if (req.path === '/api/generate-prompt' || req.path === '/api/generate-contract') {
      const field = req.path === '/api/generate-prompt' ? 'promptsThisMonth' : 'contractsThisMonth';
      const limit = field === 'promptsThisMonth' ? limits.prompts : limits.contracts;
      if (limit === Infinity) return next();
      const count = await usage.getCount(req.user.id, field);
      if (count >= limit) {
        const label = field === 'promptsThisMonth' ? 'prompts' : 'contratos';
        return res.status(403).json({
          error: `Você atingiu o limite de ${limit} ${label}/mês do seu plano. Faça upgrade para continuar.`,
          code: 'LIMIT_REACHED',
        });
      }
    }
    next();
  } catch {
    next();
  }
}

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('/{*any}', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 PromptForge AI Backend: http://0.0.0.0:${PORT}`);
  if (API_KEY) {
    console.log(`🔑 NVIDIA API: ${API_KEY.slice(0, 8)}... Modelo: ${NVIDIA_MODEL} (com fallback mock)`);
  } else {
    console.log('ℹ️ Modo mock (sem API key)');
  }
  if (cakto) {
    await ensureCaktoProducts();
  } else {
    console.log('ℹ️ Cakto não configurado.');
  }
});
