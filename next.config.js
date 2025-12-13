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
    webpack: (config, { dev, isServer }) => {
        if (dev && isServer) {
            // Enable source maps for server-side code in development
            config.devtool = 'eval-source-map';
        }
        return config;
    },
};
const redirects = [
    {
        source: '/:path*',
        has: [
            {
                type: 'query',
                key: 'site',
                value: 'snow',
            },
        ],
        destination: 'https://parkplaceephraim.prospectportal.com/',
        permanent: true, // Set to true for a 308 redirect, false for a 307 redirect
    },
];

module.exports = {
    ...nextConfig,
  // async redirects() {
  //   return redirects;
  // },
};