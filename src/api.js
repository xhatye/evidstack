import { auth } from './firebase.js';

export async function authenticatedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) return Response.json({ error: 'Sign in to use this feature.' }, { status: 401 });
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(url, { ...options, headers });
}
