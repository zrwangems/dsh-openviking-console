/**
 * Standalone OpenViking console Host plugin.
 *
 * The console itself lives in `console.mjs`: a fenced `/openviking/console`
 * status route and a same-origin `/studio/*` proxy for the OpenViking Studio.
 * This entry only resolves the connection settings and supplies the health
 * client the status route probes with.
 *
 * This is a preview of the console component proposed in
 * volcengine/OpenViking#6435; once that PR merges, the memory plugin ships the
 * console itself and this bundle can be removed.
 */
import { mountConsole } from "./console.mjs";

export const name = "openviking-console";
export const inject = ["webServer", "connection"];

const DEFAULT_ENDPOINT = "http://127.0.0.1:1933";

export function apply(ctx, input = {}) {
  const baseUrl = trimUrl(
    input.endpoint
      || process.env.OPENVIKING_URL
      || process.env.OPENVIKING_BASE_URL
      || DEFAULT_ENDPOINT,
  );
  const consoleUrl = String(
    input.consoleUrl || process.env.OPENVIKING_CONSOLE_URL || "",
  ).trim() || baseUrl;
  mountConsole(ctx, { baseUrl, consoleUrl }, {
    healthResult: () => probeHealth(baseUrl),
  });
}

function trimUrl(value) {
  const text = String(value || "").trim().replace(/\/+$/, "");
  return text || DEFAULT_ENDPOINT;
}

async function probeHealth(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body) {
      return {
        ok: false,
        status: response.status,
        result: null,
        error: { message: `HTTP ${response.status}` },
      };
    }
    return { ok: true, status: response.status, result: body };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      result: null,
      error: { message: error instanceof Error ? error.message : String(error) },
    };
  }
}
