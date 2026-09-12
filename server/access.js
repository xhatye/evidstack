import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function database() {
  if (!getApps().length) {
    const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
    const missing = required.filter(name => !String(process.env[name] || '').trim());
    if (missing.length) {
      const error = new Error('Firebase Admin configuration is incomplete.');
      error.code = 'FIREBASE_CONFIG_MISSING';
      error.missing = missing;
      console.error('[evidstack-api] Missing Firebase Admin environment variables', { missing });
      throw error;
    }
    try {
      initializeApp({ credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }) });
    } catch (error) {
      console.error('[evidstack-api] Firebase Admin initialization failed', { name: error?.name || 'Error', code: error?.code || 'unknown' });
      throw error;
    }
  }
  return getFirestore();
}
const services = {
  async verify(token) { database(); return getAuth().verifyIdToken(token, true); },
  async account(uid) { return (await database().doc(`users/${uid}`).get()).data() || {}; },
  async reserve(uid, pro, billing) {
    // Billing endpoints do not call an AI provider and must never consume AI quota.
    if (billing) return;
    const now = Date.now();
    const db = database();
    const ref = db.doc(`_apiUsage/${uid}`);
    // Firestore reserves document IDs beginning with double underscores.
    // Keep the aggregate quota record under a valid, non-reserved ID.
    const globalRef = db.doc('_apiUsage/global');
    const readLimit = (name, fallback) => {
      const value = Number.parseInt(process.env[name] || '', 10);
      return Number.isInteger(value) && value > 0 ? value : fallback;
    };
    // These defaults keep a paid provider below a small monthly budget while
    // still leaving enough room for normal Pro use. They can be tightened in
    // Vercel without changing the application code.
    const userDailyLimit = pro ? readLimit('AI_PRO_DAILY_LIMIT', 20) : 1;
    const userMonthlyLimit = pro ? readLimit('AI_PRO_MONTHLY_LIMIT', 30) : 1;
    const globalDailyLimit = readLimit('AI_GLOBAL_DAILY_LIMIT', 10);
    const globalMonthlyLimit = readLimit('AI_GLOBAL_MONTHLY_LIMIT', 100);
    const burstLimit = readLimit('AI_BURST_LIMIT', 4);
    await db.runTransaction(async tx => {
      const old = (await tx.get(ref)).data() || {};
      const global = (await tx.get(globalRef)).data() || {};
      const day = Math.floor(now / 86400000), minute = Math.floor(now / 60000);
      const date = new Date(now);
      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const count = old.day === day ? old.count || 0 : 0;
      const burst = old.minute === minute ? old.burst || 0 : 0;
      const daily = global.day === day ? global.dailyCount || 0 : 0;
      const monthly = global.month === month ? global.monthlyCount || 0 : 0;
      const userMonthly = old.month === month ? old.monthlyCount || 0 : 0;
      if (burst >= burstLimit || count >= userDailyLimit || userMonthly >= userMonthlyLimit || daily >= globalDailyLimit || monthly >= globalMonthlyLimit) {
        throw new ApiError(429, 'AI usage limit reached. Please try again later.');
      }
      if (!pro && old.freeUsed) throw new ApiError(403, 'Your free AI request has been used. Upgrade to Pro to continue.');
      tx.set(ref, { day, minute, count: count + 1, burst: burst + 1,
        month, monthlyCount: userMonthly + 1, freeUsed: Boolean(old.freeUsed || !pro) }, { merge: true });
      tx.set(globalRef, { day, dailyCount: daily + 1, month, monthlyCount: monthly + 1, updatedAt: now }, { merge: true });
    });
  },
};
const json = (status, error) => Response.json({ error }, { status });
const MAX_BODY_BYTES = 32768;

// Accept both Vercel's Node request/response and Web Requests used by tests.
export function secure(handler, { free = false, billing = false, textFields = [] } = {}, deps = services) {
  return async (req, res) => {
    let response;
    let stage = 'request';
    try {
      stage = 'method';
      if (req.method !== 'POST') throw new ApiError(405, 'Method not allowed');
      const headers = new Headers(req.headers);
      const match = /^Bearer (\S+)$/.exec(headers.get('authorization') || '');
      if (!match) throw new ApiError(401, 'Sign in to continue.');
      let identity;
      stage = 'verify';
      try { identity = await deps.verify(match[1]); } catch { throw new ApiError(401, 'Your session has expired. Please sign in again.'); }
      if (!identity?.uid) throw new ApiError(401, 'Invalid session.');
      if (!headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Send JSON content.');
      const contentLength = headers.get('content-length');
      if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)) {
        throw new ApiError(413, 'Request too large.');
      }
      let text;
      if (req instanceof Request) text = await req.text();
      else if (req.body !== undefined) text = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      else {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += Buffer.byteLength(chunk); if (size > MAX_BODY_BYTES) throw new ApiError(413, 'Request too large.'); chunks.push(Buffer.from(chunk)); }
        text = Buffer.concat(chunks).toString();
      }
      if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new ApiError(413, 'Request too large.');
      let body;
      try { body = JSON.parse(text); } catch { throw new ApiError(400, 'Invalid JSON.'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Invalid request.');
      for (const key of ['goals', 'stack', 'compounds']) {
        if (textFields.includes(key) && typeof body[key] === 'string' && body[key].length <= 4000) continue;
        if (body[key] !== undefined && (!Array.isArray(body[key]) || body[key].length > 100 || body[key].some(value => typeof value !== 'string' || value.length > 500))) throw new ApiError(400, `Invalid ${key}.`);
      }
      for (const key of ['query', 'existing', 'restrictions']) {
        if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > 4000)) throw new ApiError(400, `Invalid ${key}.`);
      }
      if (body.logs !== undefined && (!Array.isArray(body.logs) || body.logs.length > 90 || body.logs.some(log => !log || typeof log !== 'object'))) throw new ApiError(400, 'Invalid logs.');
      if (body.conversationHistory !== undefined && (!Array.isArray(body.conversationHistory) || body.conversationHistory.length > 20 || body.conversationHistory.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 4000))) throw new ApiError(400, 'Invalid conversation history.');
      stage = 'account';
      const account = await deps.account(identity.uid);
      const pro = account.isPro === true && (!account.proExpiresAt || account.proExpiresAt > Date.now());
      if (!billing && !free && !pro) throw new ApiError(403, 'A Pro subscription is required.');
      stage = 'quota';
      await deps.reserve(identity.uid, pro, billing);
      // Never trust account identifiers submitted by the browser.
      body.uid = identity.uid; body.email = identity.email;
      const request = new Request('https://evidstack.com/api', { method: 'POST', headers, body: JSON.stringify(body) });
      stage = 'provider';
      response = await handler(request, { identity, account });
      if (response.status >= 500) response = json(502, 'The service is temporarily unavailable. Please try again later.');
    } catch (error) {
      if (!(error instanceof ApiError)) console.error('[evidstack-api] Request failed', {
        path: (() => { try { return new URL(req.url).pathname; } catch { return '/api'; } })(),
        stage,
        name: error?.name || 'Error',
        code: error?.code || 'unknown',
        message: error?.message || 'unknown',
        status: 503,
      });
      const message = error instanceof ApiError
        ? error.message
        : error?.code === 'FIREBASE_CONFIG_MISSING'
          ? 'This ProTool is not configured on the server yet. Please check the Vercel server settings.'
          : 'The service is temporarily unavailable. Please try again later.';
      response = json(error instanceof ApiError ? error.status : 503, message);
    }
    response.headers.set('Cache-Control', 'no-store');
    if (response.status === 405) response.headers.set('Allow', 'POST');
    if (response.status === 429) response.headers.set('Retry-After', '60');
    if (!res) return response;
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(await response.text());
  };
}

