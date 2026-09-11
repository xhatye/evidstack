import { auth } from './firebase.js';
import { createAuthenticatedFetch } from './api-client.js';

export const authenticatedFetch = createAuthenticatedFetch({
  getCurrentUser: () => auth.currentUser,
});

