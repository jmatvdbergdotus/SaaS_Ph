import { config } from "../../config";

const MAYA_BASE = "https://pg.maya.ph/payments/v1";

async function mayaFetch(path: string, options: RequestInit = {}) {
  if (!config.MAYA_SECRET_KEY) {
    throw new Error("Maya integration is not configured");
  }

  const credentials = Buffer.from(`${config.MAYA_SECRET_KEY}:`).toString("base64");
  const res = await fetch(`${MAYA_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Maya request failed with status ${res.status}`);
  return res.json();
}

export const mayaClient = { fetch: mayaFetch };
