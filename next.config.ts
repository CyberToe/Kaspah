import type { NextConfig } from "next";
import path from "node:path";

const edgeShims: Record<string, string> = {
  "node:buffer": path.join(process.cwd(), "lib/edge/node-buffer.js"),
  "node:async_hooks": path.join(process.cwd(), "lib/edge/node-async-hooks.js"),
};

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime !== "edge") return config;
    const shims: Record<string, string> = {
      buffer: edgeShims["node:buffer"],
      "node:buffer": edgeShims["node:buffer"],
      async_hooks: edgeShims["node:async_hooks"],
      "node:async_hooks": edgeShims["node:async_hooks"],
    };
    config.plugins.push({
      apply(compiler: { hooks: { normalModuleFactory: { tap: (name: string, fn: (factory: { hooks: { beforeResolve: { tap: (name: string, fn: (data: { request: string }) => void) => void } } }) => void) => void } } }) {
        compiler.hooks.normalModuleFactory.tap("EdgeNodeShims", (factory) => {
          factory.hooks.beforeResolve.tap("EdgeNodeShims", (data) => {
            const shim = shims[data.request];
            if (shim) data.request = shim;
          });
        });
      },
    });
    if (Array.isArray(config.externals)) {
      config.externals = config.externals.map((external: unknown) => {
        if (!external || typeof external !== "object" || Array.isArray(external)) return external;
        const copy = { ...(external as Record<string, string>) };
        for (const key of Object.keys(shims)) delete copy[key];
        return copy;
      });
    }
    return config;
  },
};

export default nextConfig;
