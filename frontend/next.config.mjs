import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle wallet-related modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }

    // Fix for uuid module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'uuid': path.resolve(__dirname, 'node_modules/uuid'),
    };

    // Handle problematic modules
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle Nexus SDK and other dynamic imports
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          nexus: {
            test: /[\\/]node_modules[\\/]@avail-project[\\/]/,
            name: 'nexus',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };

    return config;
  },
}

export default nextConfig
