/** @type {import('next').NextConfig} */
const longCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/images/:path*", headers: longCache },
      { source: "/(apple-touch-icon.png|icon-192.png|icon-512.png|card.png|favicon.ico)", headers: longCache },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
