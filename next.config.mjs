/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable if you have issues with strict mode, though strictly recommended to keep true
    reactStrictMode: true,

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
