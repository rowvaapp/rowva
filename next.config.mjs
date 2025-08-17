/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  async redirects() {
    return [
      {
        source: "/rules",
        destination: "/mapping",
        permanent: true,
      },
      {
        source: "/notion/workspaces",
        destination: "/integrations",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
