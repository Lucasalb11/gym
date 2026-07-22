import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (WASM) e pg não devem ser empacotados pelo bundler do servidor
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
