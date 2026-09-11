import { track } from "@vercel/analytics";

// Analytics must never block a user action or make the app depend on the
// analytics service being available.
export function trackEvent(name, data) {
  try {
    return track(name, data);
  } catch {
    return undefined;
  }
}

