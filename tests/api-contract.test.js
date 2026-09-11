import test from "node:test";
import assert from "node:assert/strict";

const protectedRoutes = [
  "ai-stack",
  "bloodwork-analyzer",
  "interaction-checker",
  "stack-audit",
  "stack-optimizer",
  "stripe-checkout",
  "stripe-portal",
  "symptom-advisor",
  "weekly-protocol",
];

const request = (method, body, token) => new Request("https://evidstack.com/api/test", {
  method,
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

test("every protected API route has a consistent method and auth boundary", async () => {
  for (const routeName of protectedRoutes) {
    const route = await import(`../api/${routeName}.js`);
    assert.equal(typeof route.default, "function", `${routeName} must export a handler`);
    assert.equal((await route.default(request("GET"))).status, 405, `${routeName} GET`);
    assert.equal((await route.default(request("POST", {}))).status, 401, `${routeName} anonymous POST`);
  }
});

