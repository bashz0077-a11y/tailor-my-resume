/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  serverExternalPackages: ["pdf-parse"],
};
export default nextConfig;
