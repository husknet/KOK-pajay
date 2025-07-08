/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,           // Enables extra React warnings
  swcMinify: true,                 // Uses SWC compiler for faster builds
  experimental: {
    appDir: true,                  // Enables the /app directory (App Router)
  },
  images: {
    domains: ['api.telegram.org'], // Allow Telegram images (if needed for bot UI)
  },
  env: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  },
}

module.exports = nextConfig
