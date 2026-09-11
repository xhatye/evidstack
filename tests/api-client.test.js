import test from "node:test";
import assert from "node:assert/strict";
import { createAuthenticatedFetch } from "../src/api-client.js";

test("authenticated client refuses anonymous requests without calling the API", async () => {
  let calls = 0;
  const request = createAuthenticatedFetch({
    getCurrentUser: () => null,
    fetchImpl: async () => { calls += 1; return new Response("unexpected"); },
  });
  const response = await request("/api/protected");
  assert.equal(response.status, 401);
  assert.equal(calls, 0);
});

test("authenticated client sends the current token", async () => {
  const seen = [];
  const request = createAuthenticatedFetch({
    getCurrentUser: () => ({ getIdToken: async () => "current-token" }),
    fetchImpl: async (_url, options) => {
      seen.push(options.headers.get("Authorization"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
  });
  assert.equal((await request("/api/protected")).status, 200);
  assert.deepEqual(seen, ["Bearer current-token"]);
});

test("a 401 refreshes the token and retries exactly once", async () => {
  const seen = [];
  const tokens = [];
  const request = createAuthenticatedFetch({
    getCurrentUser: () => ({
      getIdToken: async (forceRefresh = false) => {
        tokens.push(forceRefresh);
        return forceRefresh ? "refreshed-token" : "expired-token";
      },
    }),
    fetchImpl: async (_url, options) => {
      seen.push(options.headers.get("Authorization"));
      return new Response("", { status: seen.length === 1 ? 401 : 200 });
    },
  });
  assert.equal((await request("/api/protected")).status, 200);
  assert.deepEqual(seen, ["Bearer expired-token", "Bearer refreshed-token"]);
  assert.deepEqual(tokens, [false, true]);
});

