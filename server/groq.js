const DEFAULT_MODEL = "openai/gpt-oss-20b";
const ACTIVE_MODELS = new Set([
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "qwen/qwen3.8-27b",
]);

export class GroqProviderError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "GroqProviderError";
    this.status = status;
    this.code = code;
  }
}

export function resolveGroqModel(value = process.env.GROQ_MODEL) {
  const requested = String(value || "").trim();
  if (ACTIVE_MODELS.has(requested)) return requested;
  if (requested) console.warn("[evidstack-ai] Ignoring retired or unsupported GROQ_MODEL", { requested });
  return DEFAULT_MODEL;
}

function providerLog(details) {
  // Never log API keys or provider response bodies. These fields are enough to
  // diagnose a missing/retired model from Vercel runtime logs.
  console.error("[evidstack-ai] Groq request failed", details);
}

function isModelError(status, body) {
  return (status === 400 || status === 404) && /model|not found|unsupported|deprecat/i.test(body || "");
}

function providerErrorDetails(body) {
  try {
    const parsed = JSON.parse(body || "{}");
    const error = parsed?.error || parsed;
    return {
      errorType: typeof error?.type === "string" ? error.type : undefined,
      errorCode: typeof error?.code === "string" ? error.code : undefined,
      errorParam: typeof error?.param === "string" ? error.param : undefined,
      errorMessage: typeof error?.message === "string" ? error.message.slice(0, 240) : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Make a bounded Groq request for the JSON-only prompts used by ProTools.
 * A stale GROQ_MODEL environment variable is automatically replaced by the
 * current production model, so an old dashboard setting cannot break every
 * tool after a provider deprecation.
 */
export async function groqChat({ messages, maxTokens = 2000, temperature = 0.2, fetchImpl = fetch }) {
  const apiKey = String(process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    providerLog({ code: "missing_api_key" });
    throw new GroqProviderError(503, "missing_api_key", "AI provider is not configured.");
  }

  const configured = String(process.env.GROQ_MODEL || "").trim();
  const primary = resolveGroqModel(configured);
  const models = primary === DEFAULT_MODEL ? [DEFAULT_MODEL] : [primary, DEFAULT_MODEL];

  for (const model of models) {
    // Groq's current API prefers max_completion_tokens. If an account or
    // model rejects an optional sampling/JSON parameter, retry with a smaller
    // compatible payload before surfacing a provider outage to the user.
    const payloads = [
      { model, max_completion_tokens: maxTokens, temperature, response_format: { type: "json_object" }, messages },
      { model, max_completion_tokens: maxTokens, response_format: { type: "json_object" }, messages },
      { model, max_completion_tokens: maxTokens, messages },
    ];
    for (let attempt = 0; attempt < payloads.length; attempt += 1) {
      let response;
      try {
        response = await fetchImpl("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          signal: AbortSignal.timeout(25000),
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(payloads[attempt]),
        });
      } catch (error) {
        providerLog({ code: "network_error", model, name: error?.name || "Error" });
        throw new GroqProviderError(503, "network_error", "The AI provider could not be reached.");
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        if (model !== DEFAULT_MODEL && isModelError(response.status, body)) {
          providerLog({ code: "model_fallback", requested: model, fallback: DEFAULT_MODEL, status: response.status, ...providerErrorDetails(body) });
          break;
        }
        if (response.status === 400 && attempt < payloads.length - 1) {
          providerLog({ code: "compatibility_retry", model, attempt: attempt + 1, ...providerErrorDetails(body) });
          continue;
        }
        providerLog({ code: response.status === 401 ? "invalid_api_key" : response.status === 429 ? "rate_limited" : "provider_error", model, status: response.status, ...providerErrorDetails(body) });
        const status = response.status === 429 ? 429 : 503;
        throw new GroqProviderError(status, "provider_error", "The AI provider is temporarily unavailable.");
      }

      const data = await response.json().catch(() => null);
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        providerLog({ code: "empty_response", model });
        throw new GroqProviderError(503, "empty_response", "The AI provider returned an empty response.");
      }
      return content.trim();
    }
  }

  throw new GroqProviderError(503, "model_unavailable", "The AI provider model is unavailable.");
}

export function parseGroqJson(content) {
  const clean = String(content || "").replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw new GroqProviderError(503, "invalid_json", "The AI provider returned an invalid response.");
  }
}

export { DEFAULT_MODEL };
