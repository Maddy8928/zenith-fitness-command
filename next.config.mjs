/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'three', '@react-three/drei']
    },
    async rewrites() {
        return [
            {
                source: '/store',
                destination: '/store-manager',
            },
            {
                source: '/store/:path*',
                destination: '/store-manager/:path*',
            },
        ];
    },
};

export default nextConfig;
