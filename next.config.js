/** @type {import("next").NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    // useFileSystemPublicRoutes: false,
    experimental: {
        //largePageDataBytes: 128 * 1000; // 128KB by default
        largePageDataBytes: 1024 * 1000,
    },
    // Ensure proper handling of API routes with React 19
    serverExternalPackages: ['argon2'],
    // Enable source maps for debugging
    productionBrowserSourceMaps: false,
};

module.exports = {
    ...nextConfig,
};