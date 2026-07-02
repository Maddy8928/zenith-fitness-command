/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'three', '@react-three/drei']
    }
};

export default nextConfig;
