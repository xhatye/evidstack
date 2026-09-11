import test from "node:test";
import assert from "node:assert/strict";
import { activeSubscription, eventUid } from "../api/stripe-webhook.js";

test("Stripe event UID extraction supports subscription and invoice shapes", () => {
  assert.equal(eventUid({ metadata: { uid: "user-1" } }), "user-1");
  assert.equal(eventUid({ subscription_details: { metadata: { uid: "user-2" } } }), "user-2");
  assert.equal(eventUid({ parent: { subscription_details: { metadata: { uid: "user-3" } } } }), "user-3");
  assert.equal(eventUid({}), null);
});

test("only active and trialing subscriptions retain Pro access", () => {
  assert.equal(activeSubscription("active"), true);
  assert.equal(activeSubscription("trialing"), true);
  assert.equal(activeSubscription("past_due"), false);
  assert.equal(activeSubscription("canceled"), false);
});

