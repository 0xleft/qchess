/** @type {import('next').NextConfig} */
const nextConfig = {
    headers: async () => {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    }
                ],
            },

            {
                source: '/stockfish',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=30000',
                    },
                ]
            }
        ];
    }
};

export default nextConfig;
