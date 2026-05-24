/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Note: In production on Render, this should be the internal or external URL of your backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;