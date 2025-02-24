/*
Configures Next.js for the app.
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL,
        pathname: "/storage/v1/object/sign/**"
      }
    ]
  }
}

export default nextConfig
