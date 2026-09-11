function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Sign in to use this feature." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Build the authenticated API client separately from Firebase so its retry
 * behaviour can be verified without a browser or a live Firebase project.
 */
export function createAuthenticatedFetch({ getCurrentUser, fetchImpl = fetch }) {
  return async function authenticatedFetch(url, options = {}) {
    const user = getCurrentUser();
    if (!user) return unauthorizedResponse();

    const request = async (token) => {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${token}`);
      return fetchImpl(url, { ...options, headers });
    };

    const response = await request(await user.getIdToken());
    if (response.status !== 401) return response;

    // Firebase tokens can expire while a tab is idle. Refresh once and retry
    // the same request so users do not have to sign out and back in.
    return request(await user.getIdToken(true));
  };
}

