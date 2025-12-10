import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Строим standalone, чтобы Docker использовал готовый server.js без dev-зависимостей
  output: "standalone",
};

export default nextConfig;
