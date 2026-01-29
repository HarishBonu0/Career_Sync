/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Allow importing modules from ../db shared folder
    externalDir: true,
  },
}

module.exports = nextConfig
