import { config } from "../../config";

const XENDIT_BASE = "https://api.xendit.co";

async function xenditFetch(path: string, options: RequestInit = {}) {
  const credentials = Buffer.from(`${config.XENDIT_SECRET_KEY}:`).toString("base64");
  const res = await fetch(`${XENDIT_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Xendit error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const xenditClient = { fetch: xenditFetch };
