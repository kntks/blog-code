import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@opentelemetry/sdk-node',
    'pino',
  ]
};

export default nextConfig;
