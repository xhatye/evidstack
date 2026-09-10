import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function database() {
  if (!getApps().length) initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }) });
  return getFirestore();
}
const services = {
  async verify(token) { database(); return getAuth().verifyIdToken(token, true); },
  async account(uid) { return (await database().doc(`users/${uid}`).get()).data() || {}; },
  async reserve(uid, pro, billing) {
    const now = Date.now();
    const ref = database().doc(`_apiUsage/${uid}`);
    await database().runTransaction(async tx => {
      const old = (await tx.get(ref)).data() || {};
      const day = Math.floor(now / 86400000), minute = Math.floor(now / 60000);
      const count = old.day === day ? old.count || 0 : 0;
      const burst = old.minute === minute ? old.burst || 0 : 0;
      if (burst >= 10 || (!billing && pro && count >= 100)) throw new ApiError(429, 'Usage limit reached. Please try again later.');
      if (!billing && !pro && old.freeUsed) throw new ApiError(403, 'Your free AI request has been used. Upgrade to Pro to continue.');
      tx.set(ref, { day, minute, count: count + (billing ? 0 : 1), burst: burst + 1,
        freeUsed: Boolean(old.freeUsed || (!billing && !pro)) });
    });
  },
};
const json = (status, error) => Response.json({ error }, { status });

// Accept both Vercel's Node request/response and Web Requests used by tests.
export function secure(handler, { free = false, billing = false, textFields = [] } = {}, deps = services) {
  return async (req, res) => {
    let response;
    try {
      if (req.method !== 'POST') throw new ApiError(405, 'Method not allowed');
      const headers = new Headers(req.headers);
      const match = /^Bearer (\S+)$/.exec(headers.get('authorization') || '');
      if (!match) throw new ApiError(401, 'Sign in to continue.');
      let identity;
      try { identity = await deps.verify(match[1]); } catch { throw new ApiError(401, 'Your session has expired. Please sign in again.'); }
      if (!identity?.uid) throw new ApiError(401, 'Invalid session.');
      if (!headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Send JSON content.');
      if (Number(headers.get('content-length')) > 32768) throw new ApiError(413, 'Request too large.');
      let text;
      if (req instanceof Request) text = await req.text();
      else if (req.body !== undefined) text = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      else {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += Buffer.byteLength(chunk); if (size > 32768) throw new ApiError(413, 'Request too large.'); chunks.push(Buffer.from(chunk)); }
        text = Buffer.concat(chunks).toString();
      }
      if (Buffer.byteLength(text) > 32768) throw new ApiError(413, 'Request too large.');
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
      const account = await deps.account(identity.uid);
      const pro = account.isPro === true && (!account.proExpiresAt || account.proExpiresAt > Date.now());
      if (!billing && !free && !pro) throw new ApiError(403, 'A Pro subscription is required.');
      await deps.reserve(identity.uid, pro, billing);
      // Never trust account identifiers submitted by the browser.
      body.uid = identity.uid; body.email = identity.email;
      const request = new Request('https://evidstack.com/api', { method: 'POST', headers, body: JSON.stringify(body) });
      response = await handler(request, { identity, account });
      if (response.status >= 500) response = json(502, 'The service is temporarily unavailable. Please try again later.');
    } catch (error) {
      response = json(error instanceof ApiError ? error.status : 503, error instanceof ApiError ? error.message : 'The service is temporarily unavailable. Please try again later.');
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
