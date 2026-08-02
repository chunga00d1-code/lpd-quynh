import vinext from "vinext";
import { defineConfig, type UserConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";
import fs from "fs";
import path from "path";

interface HostingConfig {
  d1: string;
  r2: string;
}

// .openai/hosting.json is local-only (gitignored) Sites config; fall back to
// empty bindings when it's absent, e.g. in CI.
function readHostingConfig(): HostingConfig {
  const hostingPath = path.resolve(process.cwd(), ".openai/hosting.json");
  if (fs.existsSync(hostingPath)) {
    return JSON.parse(fs.readFileSync(hostingPath, "utf-8")) as HostingConfig;
  }
  return { d1: "", r2: "" };
}

// Read PORT from .env
let port = 5002;
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
    if (portMatch && portMatch[1]) {
      port = parseInt(portMatch[1]);
    }
  }
} catch {
  // ignore
}

const punycodePlugin = {
  name: "punycode-resolver",
  resolveId(id: string) {
    if (id === "punycode/") {
      return { id: "punycode", external: true };
    }
    return null;
  }
};

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = readHostingConfig();

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async (): Promise<UserConfig> => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      port: port,
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    resolve: {
      alias: {
        "punycode/": "punycode",
        punycode: "punycode",
      },
    },
    environments: {
      rsc: {
        resolve: {
          noExternal: true,
        },
      },
      ssr: {
        resolve: {
          noExternal: true,
        },
      },
    },
    plugins: [
      punycodePlugin,
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});

