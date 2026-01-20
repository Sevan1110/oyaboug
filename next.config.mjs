/** @type {import('next').NextConfig} */
const nextConfig = {
    // Temporarily disabled due to Leaflet map library incompatibility
    // Leaflet doesn't handle React 18 Strict Mode's double-invocation properly
    reactStrictMode: false,

    // Necessary for generic Supabase image hosting if used, or other external domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // We can add more config here later
};

export default nextConfig;
