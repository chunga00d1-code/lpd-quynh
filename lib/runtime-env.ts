/**
 * Reads env vars that may come from the Cloudflare Workers `env` binding
 * (when running under `wrangler`/workerd) or from `process.env` (when
 * running under plain Node, e.g. `vinext start` on a VPS/Docker host).
 *
 * `cloudflare:workers` only exists inside workerd — a static `import`
 * of it crashes plain Node with ERR_UNSUPPORTED_ESM_URL_SCHEME before any
 * try/catch can run, so it must be loaded dynamically and swallowed here.
 */
let cfEnvPromise: Promise<Record<string, string | undefined>> | null = null;

function loadCloudflareEnv(): Promise<Record<string, string | undefined>> {
  if (!cfEnvPromise) {
    cfEnvPromise = import("cloudflare:workers")
      .then((mod) => (mod as { env: Record<string, string | undefined> }).env)
      .catch(() => ({}));
  }
  return cfEnvPromise;
}

export async function getRuntimeEnv(key: string): Promise<string | undefined> {
  const cfEnv = await loadCloudflareEnv();
  return cfEnv[key] ?? process.env[key];
}
