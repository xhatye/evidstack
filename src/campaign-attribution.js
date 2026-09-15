// Only our public campaign labels are retained, never search text or user IDs.
const KEY = 'evidstack_campaign_session';
function allowed(value) {
  if (!value || typeof value !== 'object') return {};
  const result = {};
  if (/^(tiktok|instagram|youtube)$/.test(value.utm_source || '')) result.utm_source = value.utm_source;
  if (value.utm_medium === 'organic_social') result.utm_medium = value.utm_medium;
  if (/^launch_m\d{2}$/.test(value.utm_campaign || '')) result.utm_campaign = value.utm_campaign;
  if (/^(d\d{2}|bio)$/.test(value.utm_content || '')) result.utm_content = value.utm_content;
  return result.utm_source && result.utm_campaign ? result : {};
}

export function campaignAttribution(search, storage) {
  try {
    const params = new URLSearchParams(search);
    const incoming = allowed(Object.fromEntries(params));
    if (params.has('utm_source') || params.has('utm_campaign')) {
      try {
        if (Object.keys(incoming).length) storage?.setItem(KEY, JSON.stringify(incoming));
        else storage?.removeItem(KEY);
      } catch { /* Storage may be disabled. Attribution must not block usage. */ }
      return incoming;
    }
    return allowed(JSON.parse(storage?.getItem(KEY) || '{}'));
  } catch {
    return {};
  }
}
