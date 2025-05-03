// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'irzpbxgawrzgknhtfatf.supabase.co',
      // add any other external hosts you’ll serve via next/image
    ]
  }
}

module.exports = nextConfig