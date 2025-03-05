/** @type {import("next").NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    // useFileSystemPublicRoutes: false,
    experimental: {
        //largePageDataBytes: 128 * 1000, // 128KB by default
        largePageDataBytes: 1024 * 1000,
    },
}

module.exports = nextConfig
